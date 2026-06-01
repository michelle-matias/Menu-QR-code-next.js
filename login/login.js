import { SUPABASE_URL, SUPABASE_KEY } from '../.env.js';

// Initialize the client exactly like you do in register
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const loginForm = document.getElementById('loginForm');
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = '#4a634a';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.backgroundColor = '#5d7a5d';
            navbar.style.boxShadow = 'none';
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!supabaseClient) {
            alert('Supabase não está disponível.');
            return;
        }

        const emailInput = loginForm.querySelector('input[type="email"]');
        const passwordInput = loginForm.querySelector('input[type="password"]');
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email || !password) {
            alert('Por favor, preencha email e password.');
            return;
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert('Login falhou: ' + error.message);
            return;
        }

        // At this point login succeeded — data.user is available directly
        const user = data.user;
        alert('Login com sucesso! Bem-vindo, ' + user.email);
        window.location.href = '../estatistics/estatistics.html';
    });
}