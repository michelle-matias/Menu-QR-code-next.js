'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { getDayStats, getTopDishes, getHourlyOrderCounts, type DayStats, type TopDish } from '@/lib/database';
import '@/styles/dashboard.css';

interface StatTrend {
  text: string;
  isUp: boolean;
  isNeutral: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [todayStats, setTodayStats] = useState<DayStats>({ orders: 0, revenue: 0, avg: 0 });
  const [yesterdayStats, setYesterdayStats] = useState<DayStats>({ orders: 0, revenue: 0, avg: 0 });
  const [topDishes, setTopDishes] = useState<TopDish[]>([]);
  const [hourlyData, setHourlyData] = useState<{ hour: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const [todayResult, yesterdayResult, dishes, hourly] = await Promise.all([
        getDayStats(user.id, today),
        getDayStats(user.id, yesterday),
        getTopDishes(user.id, 5),
        getHourlyOrderCounts(user.id, today),
      ]);

      setTodayStats(todayResult);
      setYesterdayStats(yesterdayResult);
      setTopDishes(dishes);
      setHourlyData(hourly);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();

    if (!user) return;

    const channel = supabase
      .channel('live-dashboard-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos', filter: `user_id=eq.${user.id}` },
        () => fetchStats()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchStats]);

  const getTrend = (current: number, previous: number): StatTrend => {
    if (!previous) {
      return { text: 'No yesterday data', isUp: false, isNeutral: true };
    }
    const diff = ((current - previous) / previous) * 100;
    const symbol = diff >= 0 ? '↑' : '↓';
    return {
      text: `${symbol} ${Math.abs(diff).toFixed(1)}% vs yesterday`,
      isUp: diff >= 0,
      isNeutral: false,
    };
  };

  const renderTrendClass = (trend: StatTrend) => {
    if (trend.isNeutral) return 'trend-neutral';
    return trend.isUp ? 'trend-up' : 'trend-down';
  };

  const ordersTrend = getTrend(todayStats.orders, yesterdayStats.orders);
  const revenueTrend = getTrend(todayStats.revenue, yesterdayStats.revenue);
  const avgTrend = getTrend(todayStats.avg, yesterdayStats.avg);

  const maxDishCount = topDishes.length > 0 ? topDishes[0].count : 1;
  const maxHourly = hourlyData.length > 0 ? Math.max(...hourlyData.map((h) => h.value)) : 1;

  return (
    <div>
      <div className="dashboard-title">
        <span>Estatístics</span>
        {loading && (
          <span style={{ fontSize: '1rem', color: '#888', fontWeight: 500 }}>
            <i className="fas fa-sync fa-spin"></i> Atualizando...
          </span>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {/* Card 1: Orders */}
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-orders">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="stat-label">Orders Today</div>
          <div className="stat-value">{todayStats.orders}</div>
          <div className={`stat-trend ${renderTrendClass(ordersTrend)}`}>
            {ordersTrend.text}
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-revenue">
            <i className="fas fa-euro-sign"></i>
          </div>
          <div className="stat-label">Revenue Today</div>
          <div className="stat-value">€{todayStats.revenue.toFixed(2)}</div>
          <div className={`stat-trend ${renderTrendClass(revenueTrend)}`}>
            {revenueTrend.text}
          </div>
        </div>

        {/* Card 3: Avg Order */}
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-avg">
            <i className="fas fa-calculator"></i>
          </div>
          <div className="stat-label">Avg. Order Value</div>
          <div className="stat-value">€{todayStats.avg.toFixed(2)}</div>
          <div className={`stat-trend ${renderTrendClass(avgTrend)}`}>
            {avgTrend.text}
          </div>
        </div>

        {/* Card 4: Total Orders */}
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-scans">
            <i className="fas fa-chart-bar"></i>
          </div>
          <div className="stat-label">Top Dishes</div>
          <div className="stat-value">{topDishes.length}</div>
          <div className="stat-trend trend-neutral">Unique dishes ordered</div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="details-grid">
        {/* Top Dishes Card */}
        <div className="chart-card">
          <h3>Most ordered dishes</h3>
          {topDishes.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>
              No order data available yet.
            </p>
          ) : (
            <ul className="dish-list">
              {topDishes.map((dish, idx) => (
                <li key={idx}>
                  <span>{dish.name}</span>
                  <div className="bar-container">
                    <div className="bar" style={{ width: `${(dish.count / maxDishCount) * 100}%` }}></div>
                  </div>
                  <span>{dish.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Orders by Hour Graph */}
        <div className="chart-card">
          <h3>Orders by hour (today)</h3>
          {hourlyData.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>
              No orders today yet.
            </p>
          ) : (
            <div className="placeholder-chart">
              {hourlyData.map((item, idx) => (
                <div className="chart-bar-wrapper" key={idx}>
                  <div 
                    className="chart-bar" 
                    style={{ height: `${(item.value / maxHourly) * 100}%` }}
                    title={`${item.value} orders at ${item.hour}`}
                  ></div>
                  <div className="axis-x">{item.hour}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
