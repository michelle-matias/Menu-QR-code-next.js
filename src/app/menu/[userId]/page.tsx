'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getDishes } from '@/lib/database';
import { Dish, DishCategory, Order } from '@/types';

// =================================================================
// TIPOS
// =================================================================
interface ItemCarrinho {
  nome: string;
  preco: number;
  qty: number;
}

interface RestauranteConfig {
  nome_restaurante: string;
  layout_style: string;
  bg_color: string;
  primary_color: string;
  accent_color: string;
  currency: string;
  user_id: string;
}


// =================================================================
// ESTILOS (gerados dinamicamente com base na config)
// =================================================================
function gerarEstilos(config: RestauranteConfig) {
  const accent = config.accent_color || '#2ecc71';
  const primary = config.primary_color || '#2c3e50';
  const bg = config.bg_color || '#f9f9f9';

  return {
    // Página
    pagina: { backgroundColor: bg, minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', color: '#333', paddingBottom: '80px' } as React.CSSProperties,

    // Top bar
    topBar: { position: 'fixed' as const, top: 0, left: 0, right: 0, height: '60px', backgroundColor: '#1a252f', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', zIndex: 100, gap: '10px' },
    topBarLeft: { display: 'flex', gap: '16px', alignItems: 'center' },
    topBarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
    btnToggleAdmin: { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: '600' as const, cursor: 'pointer' },
    btnPedidos: { color: '#ecf0f1', fontWeight: '600' as const, fontSize: '0.95rem', textDecoration: 'none', cursor: 'pointer', background: 'none', border: 'none' },
    cartStatus: (temItens: boolean) => ({ color: '#fff', fontWeight: 'bold' as const, cursor: 'pointer', background: temItens ? '#e67e22' : 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '4px', border: 'none', fontSize: '0.9rem' }),
    btnSair: { background: 'rgba(231,76,60,0.75)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' as const, cursor: 'pointer' },
    userEmail: { color: '#bdc3c7', fontSize: '0.8rem' },

    // Painel admin
    adminPanel: (visivel: boolean) => ({ display: visivel ? 'flex' : 'none', flexDirection: 'column' as const, gap: '15px', width: '320px', backgroundColor: '#2c3e50', color: '#ecf0f1', padding: '80px 20px 20px 20px', boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 10 }),
    adminTitulo: { fontSize: '1.3rem', color: '#3498db', borderBottom: '2px solid #34495e', paddingBottom: '5px', margin: '0 0 5px 0' },
    adminLabel: { fontSize: '0.85rem', fontWeight: '600' as const, marginBottom: '2px' },
    adminInput: { padding: '10px', borderRadius: '4px', border: '1px solid #34495e', backgroundColor: '#34495e', color: '#fff', width: '100%', fontSize: '0.9rem' },
    adminColorInput: { width: '100%', height: '35px', border: 'none', cursor: 'pointer', background: 'none' },
    btnGuardar: { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold' as const, cursor: 'pointer', marginTop: '10px' },

    // Conteúdo principal
    conteudo: (adminVisivel: boolean) => ({ flex: 1, padding: '90px 20px 20px 20px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', marginLeft: adminVisivel ? '320px' : '0', transition: 'margin-left 0.3s' }),
    menuHeader: { textAlign: 'center' as const, marginBottom: '40px', maxWidth: '600px' },
    menuTitulo: { fontSize: '2.5rem', marginBottom: '10px', color: primary },
    menuSubtitulo: { color: '#666' },

    // Secções e cards
    menuSecao: { width: '100%', maxWidth: '800px', marginBottom: '30px' },
    secaoTitulo: { fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '5px', marginBottom: '20px', color: primary },
    menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
    card: (layoutStyle: string) => ({ background: 'white', display: 'flex', flexDirection: 'column' as const, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: `5px solid ${accent}`, borderRadius: layoutStyle === 'classic' ? '0px' : layoutStyle === 'rustic' ? '16px' : '8px', overflow: 'hidden' }),
    cardImagem: { width: '100%', height: '180px', objectFit: 'cover' as const, display: 'block' },
    cardImagemPlaceholder: { width: '100%', height: '180px', background: 'linear-gradient(135deg, #ecf0f1, #bdc3c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95a5a6', fontSize: '2rem' },
    cardBody: { padding: '15px 20px 20px 20px', display: 'flex', flexDirection: 'column' as const, flex: 1 },
    cardNome: { fontSize: '1.1rem', marginBottom: '4px', margin: '0 0 4px 0' },
    cardDesc: { fontSize: '0.875rem', color: '#7f8c8d', lineHeight: '1.4', margin: 0 },
    cardAcoes: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' },
    cardPreco: { fontWeight: 'bold' as const, fontSize: '1.15rem', color: accent },
    btnPedir: { backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' as const },

    // Barra do carrinho
    cartFooter: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, backgroundColor: '#e67e22', color: 'white', padding: '0', cursor: 'pointer', zIndex: 99 },
    cartFooterInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' },

    // Drawer do carrinho
    cartOverlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300 },
    cartDrawer: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 30px rgba(0,0,0,0.15)', zIndex: 301, maxHeight: '85vh', display: 'flex', flexDirection: 'column' as const },
    cartHandle: { width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '12px auto 0 auto' },
    cartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px 12px 24px', borderBottom: '1px solid #eee' },
    cartHeaderTitulo: { fontSize: '1.2rem', color: '#2c3e50', margin: 0 },
    btnFecharCart: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#7f8c8d', lineHeight: '1' },
    cartLista: { overflowY: 'auto' as const, flex: 1, padding: '12px 24px' },
    cartVazio: { textAlign: 'center' as const, color: '#95a5a6', padding: '40px 0' },
    cartRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5', gap: '10px' },
    cartRowNome: { fontWeight: '600' as const, fontSize: '0.95rem', color: '#2c3e50' },
    cartRowPreco: { fontSize: '0.875rem', color: '#7f8c8d', marginTop: '2px' },
    cartRowQty: { display: 'flex', alignItems: 'center', gap: '8px' },
    btnQty: (remover: boolean) => ({ width: '28px', height: '28px', borderRadius: '50%', border: remover ? '2px solid #e74c3c' : '2px solid #e0e0e0', background: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' as const, display: 'flex', alignItems: 'center', justifyContent: 'center', color: remover ? '#e74c3c' : '#2c3e50' }),
    qtyNumero: { fontWeight: '700' as const, fontSize: '1rem', minWidth: '20px', textAlign: 'center' as const },
    cartFooterDrawer: { padding: '16px 24px', borderTop: '1px solid #eee', background: 'white' },
    cartSubtotal: { display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700' as const, color: '#2c3e50', marginBottom: '14px' },
    btnEnviarPedido: (disabled: boolean) => ({ width: '100%', padding: '14px', background: disabled ? '#bdc3c7' : '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold' as const, cursor: disabled ? 'not-allowed' : 'pointer' }),

    // Página de pedidos
    paginaPedidos: (visivel: boolean) => ({ display: visivel ? 'block' : 'none', position: 'fixed' as const, inset: 0, background: '#f0f2f5', zIndex: 200, overflowY: 'auto' as const, padding: '30px' }),
    pedidosHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' },
    pedidosTitulo: { fontSize: '1.8rem', color: '#2c3e50', margin: 0 },
    pedidosAcoes: { display: 'flex', gap: '10px' },
    btnVoltar: { background: '#7f8c8d', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '4px', fontWeight: '600' as const, cursor: 'pointer' },
    btnLimpar: { background: '#e74c3c', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '4px', fontWeight: '600' as const, cursor: 'pointer' },
    pedidosLista: { maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column' as const, gap: '16px' },
    pedidoCard: { background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '5px solid #3498db' },
    pedidoCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    pedidoBadge: { background: '#3498db', color: 'white', borderRadius: '20px', padding: '3px 12px', fontSize: '0.8rem', fontWeight: '600' as const },
    pedidoData: { fontSize: '0.8rem', color: '#95a5a6', marginBottom: '10px' },
    pedidoTotal: { textAlign: 'right' as const, fontWeight: 'bold' as const, fontSize: '1.05rem', color: '#2c3e50', marginTop: '8px' },
    pedidoVazio: { textAlign: 'center' as const, color: '#7f8c8d', fontSize: '1.1rem', padding: '60px 20px' },
  };
}


// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================
export default function PublicMenu() {
  const params = useParams();
  const userId = params?.userId as string;

  // Dados
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [config, setConfig] = useState<RestauranteConfig>({
    nome_restaurante: 'Meu Restaurante',
    layout_style: 'modern',
    bg_color: '#f9f9f9',
    primary_color: '#2c3e50',
    accent_color: '#2ecc71',
    currency: '€',
    user_id: userId,
  });

  // UI
  const [loading, setLoading] = useState(true);
  const [adminVisivel, setAdminVisivel] = useState(false);
  const [paginaPedidosVisivel, setPaginaPedidosVisivel] = useState(false);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Campos do painel admin (controlados)
  const [inputNome, setInputNome] = useState('');
  const [inputCurrency, setInputCurrency] = useState('€');
  const [inputLayout, setInputLayout] = useState('modern');
  const [inputBg, setInputBg] = useState('#f9f9f9');
  const [inputPrimary, setInputPrimary] = useState('#2c3e50');
  const [inputAccent, setInputAccent] = useState('#2ecc71');


  // ---------------------------------------------------------------
  // Carregar dados ao abrir
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!userId) return;

    async function inicializar() {
      setLoading(true);
      try {
        const [dishData, configData] = await Promise.all([
          getDishes(userId),
          supabase.from('restaurante_config').select('*').eq('user_id', userId).maybeSingle(),
        ]);

        setDishes(dishData);

        if (configData.data) {
          const c = configData.data;
          setConfig(c);
          setInputNome(c.nome_restaurante || '');
          setInputCurrency(c.currency || '€');
          setInputLayout(c.layout_style || 'modern');
          setInputBg(c.bg_color || '#f9f9f9');
          setInputPrimary(c.primary_color || '#2c3e50');
          setInputAccent(c.accent_color || '#2ecc71');
        }
      } catch (err) {
        console.error('Erro ao inicializar menu:', err);
      } finally {
        setLoading(false);
      }
    }

    inicializar();
  }, [userId]);


  // Atualiza a preview em tempo real enquanto o dono edita
  const configPreview: RestauranteConfig = {
    nome_restaurante: inputNome,
    layout_style: inputLayout,
    bg_color: inputBg,
    primary_color: inputPrimary,
    accent_color: inputAccent,
    currency: inputCurrency,
    user_id: userId,
  };
  const css = gerarEstilos(configPreview);


  // ---------------------------------------------------------------
  // Guardar config
  // ---------------------------------------------------------------
  async function guardarConfig() {
    const { error } = await supabase.from('restaurante_config').upsert({
      user_id: userId,
      nome_restaurante: inputNome,
      layout_style: inputLayout,
      bg_color: inputBg,
      primary_color: inputPrimary,
      accent_color: inputAccent,
      currency: inputCurrency,
    }, { onConflict: 'user_id' });

    if (!error) {
      setConfig(configPreview);
      alert('Guardado com sucesso!');
    } else {
      alert('Erro: ' + error.message);
    }
  }


  // ---------------------------------------------------------------
  // Carregar pedidos
  // ---------------------------------------------------------------
  async function carregarPedidos() {
    const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', userId)
        .order('id', { ascending: false });

    if (!error && data) setPedidos(data);
  }

  async function abrirPedidos() {
    await carregarPedidos();
    setPaginaPedidosVisivel(true);
  }

  async function limparPedidos() {
    if (!confirm('Apagar todos os pedidos?')) return;
    await supabase.from('pedidos').delete().eq('user_id', userId);
    setPedidos([]);
  }


  // ---------------------------------------------------------------
  // Carrinho
  // ---------------------------------------------------------------
  function adicionarAoCarrinho(dish: Dish) {
    setCarrinho(prev => {
      const existente = prev.find(i => i.nome === dish.name);
      if (existente) return prev.map(i => i.nome === dish.name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { nome: dish.name, preco: dish.price, qty: 1 }];
    });
  }

  function alterarQty(nome: string, delta: number) {
    setCarrinho(prev => prev.map(i => i.nome === nome ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  }

  const totalItens = carrinho.reduce((s, i) => s + i.qty, 0);
  const totalPreco = carrinho.reduce((s, i) => s + i.preco * i.qty, 0);


  // ---------------------------------------------------------------
  // Enviar pedido
  // ---------------------------------------------------------------
  async function enviarPedido() {
    if (carrinho.length === 0) return;
    setEnviando(true);

    const itensFlatten = carrinho.flatMap(i => Array(i.qty).fill({ nome: i.nome, preco: i.preco }));

    const { error } = await supabase.from('pedidos').insert({
      user_id: userId,
      itens: JSON.stringify(itensFlatten),
      total: totalPreco,
    });

    setEnviando(false);

    if (!error) {
      setCarrinho([]);
      setCarrinhoAberto(false);
      alert('Pedido enviado para a cozinha! ✅');
    } else {
      alert('Erro ao enviar pedido: ' + error.message);
    }
  }


  // ---------------------------------------------------------------
  // Agrupar pratos por categoria
  // ---------------------------------------------------------------
  const categorias = dishes.reduce((acc, dish) => {
    const cat = dish.category || 'Geral';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);


  if (loading) {
    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: configPreview.bg_color }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>A carregar menu...</p>
        </div>
    );
  }


  return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* TOP BAR */}
        <div style={css.topBar}>
          <div style={css.topBarLeft}>
            <button style={css.btnToggleAdmin} onClick={() => setAdminVisivel(!adminVisivel)}>
              Painel do Dono
            </button>
            <button style={css.btnPedidos} onClick={abrirPedidos}>
              📋 Pedidos
            </button>
          </div>
          <div style={css.topBarRight}>
            <button style={css.cartStatus(totalItens > 0)} onClick={() => totalItens > 0 && setCarrinhoAberto(true)}>
              🛒 {totalItens > 0 ? totalItens : 'Vazio'}
            </button>
          </div>
        </div>

        {/* PAINEL ADMIN */}
        <aside style={css.adminPanel(adminVisivel)}>
          <h2 style={css.adminTitulo}>Editar Restaurante</h2>

          <div>
            <label style={css.adminLabel}>Nome do Restaurante:</label>
            <input style={css.adminInput} value={inputNome} onChange={e => setInputNome(e.target.value)} />
          </div>
          <div>
            <label style={css.adminLabel}>Símbolo de Moeda:</label>
            <input style={css.adminInput} value={inputCurrency} onChange={e => setInputCurrency(e.target.value)} maxLength={5} />
          </div>
          <div>
            <label style={css.adminLabel}>Estilo do Layout:</label>
            <select style={css.adminInput} value={inputLayout} onChange={e => setInputLayout(e.target.value)}>
              <option value="modern">Moderno Clean</option>
              <option value="classic">Clássico</option>
              <option value="rustic">Rústico</option>
            </select>
          </div>
          <div>
            <label style={css.adminLabel}>Cor de Fundo:</label>
            <input type="color" style={css.adminColorInput} value={inputBg} onChange={e => setInputBg(e.target.value)} />
          </div>
          <div>
            <label style={css.adminLabel}>Cor dos Títulos:</label>
            <input type="color" style={css.adminColorInput} value={inputPrimary} onChange={e => setInputPrimary(e.target.value)} />
          </div>
          <div>
            <label style={css.adminLabel}>Cor dos Destaques:</label>
            <input type="color" style={css.adminColorInput} value={inputAccent} onChange={e => setInputAccent(e.target.value)} />
          </div>

          <button style={css.btnGuardar} onClick={guardarConfig}>
            Guardar Alterações
          </button>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main style={{ ...css.pagina, ...css.conteudo(adminVisivel) }}>
          <header style={css.menuHeader}>
            <h1 style={css.menuTitulo}>{inputNome || 'Meu Restaurante'}</h1>
            <p style={css.menuSubtitulo}>Faça o seu pedido diretamente pelo site!</p>
          </header>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {Object.entries(categorias).map(([cat, pratosCategoria]) => (
                <section key={cat} style={css.menuSecao}>
                  <h2 style={css.secaoTitulo}>{cat}</h2>
                  <div style={css.menuGrid}>
                    {pratosCategoria.map(dish => (
                        <div key={dish.id} style={css.card(inputLayout)}>
                          {dish.image_url
                              ? <img src={dish.image_url} alt={dish.name} style={css.cardImagem} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                              : <div style={css.cardImagemPlaceholder}>🍽️</div>
                          }
                          <div style={css.cardBody}>
                            <h3 style={css.cardNome}>{dish.name}</h3>
                            <p style={css.cardDesc}>{dish.description}</p>
                            <div style={css.cardAcoes}>
                              <span style={css.cardPreco}>{inputCurrency} {dish.price.toFixed(2)}</span>
                              <button style={css.btnPedir} onClick={() => adicionarAoCarrinho(dish)}>+ Pedir</button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </section>
            ))}
          </div>
        </main>

        {/* BARRA DO CARRINHO */}
        {totalItens > 0 && (
            <div style={css.cartFooter} onClick={() => setCarrinhoAberto(true)}>
              <div style={css.cartFooterInner}>
                <span>🛒 {totalItens} item(ns) — toque para editar</span>
                <span>{inputCurrency} {totalPreco.toFixed(2)}</span>
              </div>
            </div>
        )}

        {/* DRAWER DO CARRINHO */}
        {carrinhoAberto && (
            <>
              <div style={css.cartOverlay} onClick={() => setCarrinhoAberto(false)} />
              <div style={css.cartDrawer}>
                <div style={css.cartHandle} />
                <div style={css.cartHeader}>
                  <h3 style={css.cartHeaderTitulo}>🛒 O seu Pedido</h3>
                  <button style={css.btnFecharCart} onClick={() => setCarrinhoAberto(false)}>×</button>
                </div>
                <div style={css.cartLista}>
                  {carrinho.length === 0 ? (
                      <p style={css.cartVazio}>O carrinho está vazio.</p>
                  ) : (
                      carrinho.map(item => (
                          <div key={item.nome} style={css.cartRow}>
                            <div>
                              <div style={css.cartRowNome}>{item.nome}</div>
                              <div style={css.cartRowPreco}>{inputCurrency} {(item.preco * item.qty).toFixed(2)}</div>
                            </div>
                            <div style={css.cartRowQty}>
                              <button style={css.btnQty(true)} onClick={() => alterarQty(item.nome, -1)}>−</button>
                              <span style={css.qtyNumero}>{item.qty}</span>
                              <button style={css.btnQty(false)} onClick={() => alterarQty(item.nome, 1)}>+</button>
                            </div>
                          </div>
                      ))
                  )}
                </div>
                <div style={css.cartFooterDrawer}>
                  <div style={css.cartSubtotal}>
                    <span>Total</span>
                    <span>{inputCurrency} {totalPreco.toFixed(2)}</span>
                  </div>
                  <button
                      style={css.btnEnviarPedido(carrinho.length === 0 || enviando)}
                      onClick={enviarPedido}
                      disabled={carrinho.length === 0 || enviando}
                  >
                    {enviando ? 'A enviar...' : 'Enviar Pedido para a Cozinha 🍳'}
                  </button>
                </div>
              </div>
            </>
        )}

        {/* PÁGINA DE PEDIDOS */}
        <div style={css.paginaPedidos(paginaPedidosVisivel)}>
          <div style={css.pedidosHeader}>
            <h2 style={css.pedidosTitulo}>📋 Pedidos Recebidos</h2>
            <div style={css.pedidosAcoes}>
              <button style={css.btnLimpar} onClick={limparPedidos}>🗑️ Limpar</button>
              <button style={css.btnVoltar} onClick={() => setPaginaPedidosVisivel(false)}>← Voltar</button>
            </div>
          </div>
          <div style={css.pedidosLista}>
            {pedidos.length === 0 ? (
                <p style={css.pedidoVazio}>Nenhum pedido ainda.</p>
            ) : (
                pedidos.map((pedido, idx) => {
                  let itens: { nome: string; preco: number }[] = [];
                  try { itens = typeof pedido.itens === 'string' ? JSON.parse(pedido.itens as unknown as string) : pedido.itens || []; } catch (e) {}
                  const dataHora = pedido.created_at ? new Date(pedido.created_at).toLocaleString('pt-PT') : '—';
                  return (
                      <div key={pedido.id} style={css.pedidoCard}>
                        <div style={css.pedidoCardHeader}>
                          <strong>Pedido #{pedidos.length - idx}</strong>
                          <span style={css.pedidoBadge}>{itens.length} item(ns)</span>
                        </div>
                        <div style={css.pedidoData}>📅 {dataHora}</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 8px 0' }}>
                          {itens.map((item, i) => (
                              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' }}>
                                <span>{item.nome}</span>
                                <span>{inputCurrency} {Number(item.preco).toFixed(2)}</span>
                              </li>
                          ))}
                        </ul>
                        <div style={css.pedidoTotal}>Total: {inputCurrency} {Number(pedido.total).toFixed(2)}</div>
                      </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
  );
}