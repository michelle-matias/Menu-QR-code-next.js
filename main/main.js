// Testar a ligação
console.log("Supabase ligado com sucesso!", supabase);


// Aguarda que o documento esteja totalmente carregado
document.addEventListener('DOMContentLoaded', () => {

    // 1. Efeito na Barra de Navegação ao fazer Scroll
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = '#4a634a'; // Tom de verde mais escuro
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.backgroundColor = '#5d7a5d'; // Cor original
            navbar.style.boxShadow = 'none';
        }
    });

    // 2. Animação de Entrada dos Cards (Fade In)
    const cards = document.querySelectorAll('.feature-card');

    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        // Estado inicial para a animação
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });

    // 3. Clique nos Botões
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');

    loginBtn.addEventListener('click', (e) => {
        console.log("Botão de login premido");
        window.location.href = '../login/login.html';
    });

    const ctaButton = document.querySelector('.cta-button');
    ctaButton.addEventListener('mouseenter', () => {
        ctaButton.textContent = "VAMOS A ISSO! 🚀";
    });

    const ctaButton = document.querySelector('.cta-button');
    ctaButton.addEventListener('click', () => {
        window.location.href = 'register.html'; // Redireciona via código
    });