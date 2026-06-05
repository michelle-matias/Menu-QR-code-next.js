'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDishes, createDish, updateDish, deleteDish } from '@/lib/database';
import { uploadDishImage } from '@/lib/storage';
import { Dish, DishCategory } from '@/types';
import '@/styles/menu.css';

export default function MenuEditor() {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState<DishCategory>('Starters');
  const [dishImageFile, setDishImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: DishCategory[] = ['Starters', 'Mains', 'Desserts', 'Drinks'];

  const fetchDishes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getDishes(user.id);
      setDishes(data);
    } catch (err: any) {
      console.error('Error fetching dishes:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const handleOpenModal = (dish: Dish | null = null) => {
    setEditingDish(dish);
    if (dish) {
      setDishName(dish.name);
      setDishDesc(dish.description);
      setDishPrice(dish.price.toString());
      setDishCategory(dish.category);
      setImagePreviewUrl(dish.image_url);
    } else {
      setDishName('');
      setDishDesc('');
      setDishPrice('');
      setDishCategory('Starters');
      setImagePreviewUrl(null);
    }
    setDishImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDish(null);
    setDishName('');
    setDishDesc('');
    setDishPrice('');
    setDishCategory('Starters');
    setDishImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDishImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setDishImageFile(null);
      setImagePreviewUrl(editingDish?.image_url || null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!dishName.trim() || !dishDesc.trim() || !dishPrice) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSaving(true);
    let image_url = editingDish?.image_url || null;

    try {
      if (dishImageFile) {
        image_url = await uploadDishImage(dishImageFile);
      }

      const payload = {
        name: dishName.trim(),
        description: dishDesc.trim(),
        price: parseFloat(dishPrice),
        category: dishCategory,
        image_url,
        user_id: user.id,
      };

      if (editingDish) {
        await updateDish(editingDish.id, user.id, payload);
      } else {
        await createDish(payload);
      }

      handleCloseModal();
      fetchDishes();
    } catch (err: any) {
      alert('Erro ao guardar prato: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (!user || !confirm('Deseja realmente apagar este prato?')) return;

    try {
      await deleteDish(id, user.id);
      fetchDishes();
    } catch (err: any) {
      alert('Erro ao apagar prato: ' + err.message);
    }
  };

  const handlePreviewMenu = () => {
    if (!user) return;
    window.open(`/menu/${user.id}`, '_blank');
  };

  // Group dishes by category
  const groupedDishes = categories.reduce((acc, cat) => {
    acc[cat] = dishes.filter(d => d.category === cat);
    return acc;
  }, {} as Record<DishCategory, Dish[]>);

  return (
    <div>
      <div className="menu-header-row">
        <h1>Menu Editor</h1>
        <div className="menu-buttons">
          <button className="btn-secondary" onClick={handlePreviewMenu} style={{ background: '#ffffff', color: '#333', border: '1px solid #ddd' }}>
            <i className="fas fa-eye"></i> Preview Menu
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <i className="fas fa-plus"></i> Add Dish
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <i className="fas fa-sync fa-spin" style={{ fontSize: '2rem', color: '#5d7a5d', marginBottom: '10px' }}></i>
          <p>Carregando pratos...</p>
        </div>
      ) : dishes.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-utensils"></i>
          <p>Não existem pratos criados. Adicione o seu primeiro prato!</p>
          <button className="btn-primary" onClick={() => handleOpenModal()} style={{ marginTop: '20px' }}>
            + Add Dish
          </button>
        </div>
      ) : (
        categories.map(cat => {
          const list = groupedDishes[cat];
          if (list.length === 0) return null;

          return (
            <div className="category-section" key={cat}>
              <h2 className="category-title">{cat}</h2>
              <div className="dishes-grid">
                {list.map(dish => (
                  <div className="dish-card" key={dish.id}>
                    {dish.image_url && (
                      <img 
                        src={dish.image_url} 
                        alt={dish.name}
                        onError={(e) => {
                          const el = e.target as HTMLElement;
                          el.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="dish-info">
                      <div className="dish-header">
                        <span className="dish-name">{dish.name}</span>
                        <span className="dish-price">€{dish.price.toFixed(2)}</span>
                      </div>
                      <p className="dish-desc">{dish.description}</p>
                      <div className="dish-actions">
                        <button className="btn-secondary" onClick={() => handleOpenModal(dish)} style={{ background: '#f5f2e8', border: 'none', color: '#333' }}>
                          Edit
                        </button>
                        <button className="btn-secondary" onClick={() => handleDeleteDish(dish.id)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444' }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Add/Edit Modal Dialog */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingDish ? 'Edit Dish' : 'Add Dish'}</h2>

            <form onSubmit={handleFormSubmit}>
              <div className="input-group">
                <label>Dish Name</label>
                <input 
                  type="text" 
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea 
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Price (€)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <select 
                  value={dishCategory}
                  onChange={(e) => setDishCategory(e.target.value as DishCategory)}
                  required
                >
                  <option value="Starters">Starters</option>
                  <option value="Mains">Mains</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>

              <div className="input-group">
                <label>Dish Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                {imagePreviewUrl && (
                  <img 
                    src={imagePreviewUrl} 
                    alt="Preview" 
                    className="form-image-preview"
                  />
                )}
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={handleCloseModal} style={{ background: '#f5f2e8', border: 'none', color: '#333' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingDish ? 'Update Dish' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
