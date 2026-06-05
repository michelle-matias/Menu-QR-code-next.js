'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { getOrders, updateOrderStatus } from '@/lib/database';
import { Order } from '@/types';
import '@/styles/orders.css';

export default function OrdersManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Realtime & Printer states
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'reconnecting'>('reconnecting');
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getOrders(user.id);
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching orders:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchOrders();

    const channel = supabase
      .channel(`orders:user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchOrders()
      )
      .subscribe((status) => {
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'reconnecting');
      });

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchOrders]);

  const handleStatusToggle = async (orderId: number, currentStatus: string | null) => {
    if (!user) return;

    const newStatus = currentStatus === 'done' ? 'pending' : 'done';

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await updateOrderStatus(orderId, user.id, newStatus as 'pending' | 'done');
    } catch (err: any) {
      alert('Erro ao atualizar estado: ' + err.message);
      fetchOrders();
    }
  };

  const handlePrinterToggle = () => {
    setIsPrinterConnected((prev) => !prev);
  };

  // Metrics Calculations
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === null).length;
  const completedOrders = orders.filter((o) => o.status === 'done').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return (
    <div className="orders-monitor-wrapper">
      {/* Header block */}
      <div className="orders-header-row">
        <div className="orders-title-block">
          <h1>Live Orders Monitor</h1>
          <div className="realtime-indicator">
            <span className={`pulse-dot ${realtimeStatus === 'connected' ? 'connected' : 'error'}`}></span>
            <span>{realtimeStatus === 'connected' ? 'live' : 'reconnecting...'}</span>
          </div>
        </div>
        <div className="orders-buttons-bar">
          <button className="btn-secondary" onClick={fetchOrders} style={{ background: '#1e1e1e', color: 'white', border: '1px solid #333' }}>
            <i className="fas fa-sync"></i> Refresh
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="orders-metrics-bar">
        <div className="orders-metric-card">
          <div className="orders-metric-label">Today's Total</div>
          <div className="orders-metric-value">{orders.length}</div>
        </div>
        <div className="orders-metric-card">
          <div className="orders-metric-label">Pending Kitchen</div>
          <div className="orders-metric-value highlight-green" style={{ color: '#fbbf24' }}>
            {pendingOrders}
          </div>
        </div>
        <div className="orders-metric-card">
          <div className="orders-metric-label">Completed Delivery</div>
          <div className="orders-metric-value" style={{ color: '#34d399' }}>
            {completedOrders}
          </div>
        </div>
        <div className="orders-metric-card">
          <div className="orders-metric-label">Estimated Revenue</div>
          <div className="orders-metric-value highlight-green">
            €{totalRevenue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Orders grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
          <i className="fas fa-sync fa-spin" style={{ fontSize: '2.5rem', color: '#10b981', marginBottom: '15px' }}></i>
          <p style={{ fontSize: '1.1rem' }}>Sincronizando monitor da cozinha...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#1e1e1e', border: '1px dashed #333', borderRadius: '16px' }}>
          <i className="fas fa-clipboard-list" style={{ fontSize: '3rem', color: '#555', marginBottom: '20px' }}></i>
          <p style={{ color: '#9ca3af', fontSize: '1.2rem', margin: 0 }}>Nenhum pedido recebido hoje. Os novos pedidos aparecem em tempo real.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => {
            const isDone = order.status === 'done';
            
            // Safe parse ordered items
            let itemsList: any[] = [];
            if (order.itens) {
              itemsList = Array.isArray(order.itens) ? order.itens : JSON.parse(order.itens as any);
            }

            const formattedTime = order.created_at
              ? new Date(order.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
              : '—';

            return (
              <div 
                className={`order-card ${isDone ? 'card-done' : 'card-pending'}`} 
                key={order.id}
              >
                <div className="order-card-header">
                  <div className="card-meta">
                    <span className="order-id">Order #{order.id.toString().slice(-5).toUpperCase()}</span>
                    {order.table_number && (
                      <span className="table-tag">Table {order.table_number}</span>
                    )}
                  </div>
                  <div className="card-right">
                    <span className="order-time">{formattedTime}</span>
                    <span className={`badge ${isDone ? 'badge-done' : 'badge-pending'}`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>

                <ul className="items-list">
                  {itemsList.length > 0 ? (
                    itemsList.map((item, idx) => (
                      <li className="item-row" key={idx}>
                        <span className="item-qty">{item.qty || 1}×</span>
                        <span className="item-name">{item.nome || item.name || 'Prato'}</span>
                        {item.preco && (
                          <span className="item-price">€{Number(item.preco).toFixed(2)}</span>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="item-row muted" style={{ opacity: 0.5 }}>Sem detalhes dos itens</li>
                  )}
                </ul>

                <div className="card-footer">
                  <span className="total-price">
                    Total: <strong>€{Number(order.total || 0).toFixed(2)}</strong>
                  </span>
                  <button 
                    className={`btn-orders-action ${isDone ? 'btn-reopen' : 'btn-done'}`}
                    onClick={() => handleStatusToggle(order.id, order.status)}
                  >
                    {isDone ? '↩ Reopen' : '✓ Mark as Done'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printer Simulator Section */}
      <div className="printer-card">
        <div className="printer-info">
          <i className="fas fa-print" style={{ color: isPrinterConnected ? '#10b981' : '#6b7280' }}></i>
          <div>
            <span className="printer-status-text">
              {isPrinterConnected ? 'Printer connected' : 'No printer connected'}
            </span>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>
              {isPrinterConnected ? 'Kitchen ticket receipt printing active' : 'Simulate physical printer ticket connection'}
            </div>
          </div>
        </div>
        <button 
          className="btn-connect-printer" 
          onClick={handlePrinterToggle}
          style={{ background: isPrinterConnected ? '#ef4444' : '#5d7a5d' }}
        >
          {isPrinterConnected ? 'Disconnect printer' : 'Connect printer'}
        </button>
      </div>
    </div>
  );
}
