import { SUPABASE_URL, SUPABASE_KEY } from '../.env.js';

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const dataToday = {
    orders: 47,
    revenue: 683,
    scans: 134
};

const dataYesterday = {
    orders: 42,
    revenue: 630,
    scans: 110
};

const elementIds = {
    orders: 'orders-value',
    revenue: 'revenue-value',
    avg: 'avg-value',
    scans: 'scans-value',
    ordersTrend: 'orders-trend',
    revenueTrend: 'revenue-trend',
    avgTrend: 'avg-trend',
    scansTrend: 'scans-trend'
};

async function loadTodayStats() {
    if (!supabaseClient) {
        return;
    }

    const { data, error } = await supabaseClient
        .from('orders')
        .select('revenue, created_at')
        .gte('created_at', todayStart.toISOString());

    if (error) {
        console.error('Erro ao carregar estatísticas:', error);
        return;
    }

    if (!data) {
        return;
    }

    dataToday.orders = data.length;
    dataToday.revenue = data.reduce((sum, order) => sum + (order.revenue || 0), 0);
}

function getTrend(current, previous) {
    if (!previous) {
        return {
            text: 'Sem comparação',
            className: 'trend-neutral'
        };
    }

    const diff = ((current - previous) / previous) * 100;
    const symbol = diff >= 0 ? '↑' : '↓';
    const className = diff >= 0 ? 'trend-up' : 'trend-down';

    return {
        text: `${symbol} ${Math.abs(diff).toFixed(1)}% vs yesterday`,
        className
    };
}

function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}

function updateTrend(id, trend) {
    const el = document.getElementById(id);
    if (!el) {
        return;
    }

    el.textContent = trend.text;
    el.className = `stat-trend ${trend.className}`;
}

function calculateStats() {
    const avgToday = dataToday.orders ? dataToday.revenue / dataToday.orders : 0;
    const avgYesterday = dataYesterday.orders ? dataYesterday.revenue / dataYesterday.orders : 0;

    updateElement(elementIds.orders, dataToday.orders);
    updateTrend(elementIds.ordersTrend, getTrend(dataToday.orders, dataYesterday.orders));

    updateElement(elementIds.revenue, `€${dataToday.revenue}`);
    updateTrend(elementIds.revenueTrend, getTrend(dataToday.revenue, dataYesterday.revenue));

    updateElement(elementIds.avg, `€${avgToday.toFixed(2)}`);
    updateTrend(elementIds.avgTrend, getTrend(avgToday, avgYesterday));

    updateElement(elementIds.scans, dataToday.scans);
    updateTrend(elementIds.scansTrend, getTrend(dataToday.scans, dataYesterday.scans));
}

async function initStatisticsPage() {
    await loadTodayStats();
    calculateStats();
}

window.addEventListener('DOMContentLoaded', initStatisticsPage);
