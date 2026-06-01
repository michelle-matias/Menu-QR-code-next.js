'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import '@/styles/main.css';

export default function Home() {
  const [ctaText, setCtaText] = useState('COMEÇAR AGORA GRATUITAMENTE');
  
  // Intersection Observer for feature cards
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll('.feature-card');
    if (!cards) return;

    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    cards.forEach((card) => {
      const el = card as HTMLElement;
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(card);
    });

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  return (
    <div className="hero-body">
      {/* Header component */}
      <Header />

      {/* Main Section */}
      <main className="hero">
        <p className="subtitle">What We Do</p>
        <h1>Crie e Gira os Seus Menus de Restaurante com Facilidade</h1>

        <div className="features-grid" ref={cardsRef}>
          {/* Card 1 */}
          <div className="feature-card">
            <div className="image-container">
              <img 
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&q=80"
                alt="Gestão de Restaurante"
              />
            </div>
            <h3>Gestão Digital Total</h3>
            <p>Crie, edite e organize o seu menu digital. Dashboard intuitivo e editor potente.</p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="image-container">
              <img 
                src="https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=500&q=80" 
                alt="QR Code no Restaurante"
              />
            </div>
            <h3>Pedidos QR & Contactless</h3>
            <p>Gerere códigos QR únicos. Receba e gerencie pedidos em tempo real.</p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="image-container">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=80"
                alt="Análise de Dados"
              />
            </div>
            <h3>Análise e Relatórios</h3>
            <p>Obtenha insights sobre os seus pratos mais vendidos e o desempenho do seu negócio.</p>
          </div>
        </div>

        {/* CTA BUTTON */}
        <div style={{ marginBottom: '80px' }}>
          <Link href="/register">
            <button 
              className="cta-button"
              onMouseEnter={() => setCtaText('VAMOS A ISSO! 🚀')}
              onMouseLeave={() => setCtaText('COMEÇAR AGORA GRATUITAMENTE')}
            >
              {ctaText}
            </button>
          </Link>
        </div>

        {/* Sobre Nós Section */}
        <section className="about-us">
          <div className="about-content">
            <div className="about-text">
              <p className="subtitle">Sobre Nós</p>
              <h2>Simplificamos a forma como o mundo come fora</h2>
              <p>
                O <strong>Menu4U</strong> nasceu da vontade de ajudar proprietários de restaurantes
                a modernizarem os seus negócios sem complicações técnicas. Acreditamos que a tecnologia
                deve ser acessível, intuitiva e, acima de tudo, útil para o dia a dia.
              </p>
              <p>
                Desde 2026, focamo-nos em criar soluções que aproximam os clientes dos seus pratos favoritos
                através de experiências digitais rápidas, seguras e elegantes.
              </p>
            </div>
            <div className="about-image">
              <img
                src="https://www.correiobraziliense.com.br/cbradar/wp-content/uploads/2025/10/Cozinha-Restaurante-Sem-AC-1-750x375.jpg"
                alt="Nossa missão"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer" style={{ maxWidth: '1200px', margin: '50px auto 0' }}>
        <div className="footer-links">
          <a href="#">Termos de Serviço</a>
          <a href="#">Privacidade</a>
        </div>
        <div className="copyright">
          MenuQR © 2026
        </div>
      </footer>
    </div>
  );
}
