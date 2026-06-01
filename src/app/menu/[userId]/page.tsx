'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Dish, DishCategory } from '@/types';

export default function PublicMenu() {
  const params = useParams();
  const userId = params?.userId as string;

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<DishCategory | 'All'>('All');

  const categories: DishCategory[] = ['Starters', 'Mains', 'Desserts', 'Drinks'];

  useEffect(() => {
    if (!userId) return;

    const fetchMenuData = async () => {
      setLoading(true);
      try {
        // 1. Fetch dishes for this restaurant user ID
        const { data: dishesData, error: dishesError } = await supabase
          .from('dishes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (dishesError) throw dishesError;
        setDishes(dishesData || []);

        // 2. Fetch restaurant profile / display name (optional public profile logic)
        // Since Supabase auth.users is protected, we can check if there are dishes,
        // and we can try to query user profiles, or display a default name based on first dish if needed.
        // For now, let's look for dishes to establish the menu.
      } catch (err: any) {
        console.error('Error loading public menu:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [userId]);

  const filteredDishes = activeCategory === 'All' 
    ? dishes 
    : dishes.filter(d => d.category === activeCategory);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fdfbe8',
        fontFamily: 'Jost, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-qrcode fa-spin" style={{ fontSize: '3.5rem', color: '#5d7a5d', marginBottom: '1rem' }}></i>
          <p style={{ color: '#5d7a5d', fontWeight: 600, fontSize: '1.2rem' }}>Carregando Menu Digital...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fdfbe8',
      minHeight: '100vh',
      fontFamily: 'Jost, sans-serif',
      color: '#2a2a2a',
      paddingBottom: '60px'
    }}>
      {/* Header */}
      <header style={{
        background: '#5d7a5d',
        color: 'white',
        padding: '24px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-utensils"></i> Menu Digital
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.85, fontWeight: 500, fontSize: '1rem' }}>
          Interactive Contactless Menu
        </p>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Category Pills */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '10px',
          marginBottom: '30px',
          scrollbarWidth: 'none'
        }}>
          <button 
            onClick={() => setActiveCategory('All')}
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              border: 'none',
              background: activeCategory === 'All' ? '#5d7a5d' : 'white',
              color: activeCategory === 'All' ? 'white' : '#555',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            All Dishes
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '10px 20px',
                borderRadius: '999px',
                border: 'none',
                background: activeCategory === cat ? '#5d7a5d' : 'white',
                color: activeCategory === cat ? 'white' : '#555',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dishes Listing */}
        {filteredDishes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.02)'
          }}>
            <i className="fas fa-info-circle" style={{ fontSize: '2.5rem', color: '#5d7a5d', marginBottom: '15px' }}></i>
            <p style={{ fontSize: '1.15rem', color: '#666', margin: 0 }}>Nenhum prato disponível nesta categoria.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {filteredDishes.map(dish => (
              <div 
                key={dish.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  display: 'flex',
                  border: '1px solid rgba(0,0,0,0.01)',
                  transition: 'transform 0.2s ease'
                }}
              >
                {dish.image_url && (
                  <img 
                    src={dish.image_url} 
                    alt={dish.name}
                    style={{
                      width: '130px',
                      height: '130px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      const el = e.target as HTMLElement;
                      el.style.display = 'none';
                    }}
                  />
                )}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#2a2a2a' }}>
                        {dish.name}
                      </h3>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#5d7a5d', whiteSpace: 'nowrap' }}>
                        €{dish.price.toFixed(2)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#666666', lineHeight: 1.4, margin: 0 }}>
                      {dish.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#888',
                      background: '#f5f2e8',
                      padding: '4px 10px',
                      borderRadius: '4px'
                    }}>
                      {dish.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
