'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getDishes } from '@/lib/database';
import { Dish, DishCategory } from '@/types';
import '@/styles/public-menu.css';

export default function PublicMenu() {
  const params = useParams();
  const userId = params?.userId as string;

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<DishCategory | 'All'>('All');

  const categories: DishCategory[] = ['Starters', 'Mains', 'Desserts', 'Drinks'];

  useEffect(() => {
    if (!userId) return;

    const fetchMenuData = async () => {
      setLoading(true);
      try {
        const data = await getDishes(userId);
        setDishes(data);
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
      <div className="public-menu-loading">
        <div>
          <i className="fas fa-qrcode fa-spin"></i>
          <p>Carregando Menu Digital...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-menu-body">
      <header className="public-menu-header">
        <h1>
          <i className="fas fa-utensils"></i> Menu Digital
        </h1>
        <p>Interactive Contactless Menu</p>
      </header>

      <main className="public-menu-main">
        {/* Category Pills */}
        <div className="category-pills">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`category-pill ${activeCategory === 'All' ? 'active' : ''}`}
          >
            All Dishes
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dishes Listing */}
        {filteredDishes.length === 0 ? (
          <div className="public-menu-empty">
            <i className="fas fa-info-circle"></i>
            <p>Nenhum prato disponível nesta categoria.</p>
          </div>
        ) : (
          <div className="public-dishes-grid">
            {filteredDishes.map(dish => (
              <div className="public-dish-card" key={dish.id}>
                {dish.image_url && (
                  <img 
                    src={dish.image_url} 
                    alt={dish.name}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="public-dish-info">
                  <div>
                    <div className="public-dish-top">
                      <h3 className="public-dish-name">{dish.name}</h3>
                      <span className="public-dish-price">€{dish.price.toFixed(2)}</span>
                    </div>
                    <p className="public-dish-desc">{dish.description}</p>
                  </div>
                  <div className="public-dish-footer">
                    <span className="public-dish-category">{dish.category}</span>
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
