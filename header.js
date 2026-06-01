import { SUPABASE_URL, SUPABASE_KEY } from './.env.js';

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

async function setRestaurantName() {
    const logo = document.querySelector('header .logo');
    if (!logo) return;

    // Avoid adding multiple spans if script is included more than once
    let span = document.getElementById('restaurant-name');
    if (!span) {
        span = document.createElement('span');
        span.id = 'restaurant-name';
        span.style.marginLeft = '10px';
        span.style.fontWeight = '600';
        logo.appendChild(span);
    }

    if (!supabaseClient) {
        span.textContent = '';
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.getUser();
        if (error || !data) return;
        const user = data.user;
        const name = user?.user_metadata?.display_name || user?.user_metadata?.displayName || '';
        span.textContent = name ? `| ${name}` : '';
    } catch (err) {
        // silent fail
        console.error('header.js error:', err);
    }
}

document.addEventListener('DOMContentLoaded', setRestaurantName);
