'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
    const { user } = useAuth();

    // Estado dos campos editáveis
    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [novaPassword, setNovaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');

    // Mensagens de feedback
    const [mensagemPerfil, setMensagemPerfil] = useState('');
    const [mensagemPassword, setMensagemPassword] = useState('');
    const [erroPerfil, setErroPerfil] = useState(false);
    const [erroPassword, setErroPassword] = useState(false);


    // ---------------------------------------------------------------
    // FUNÇÃO: Guardar alterações de nome e email
    // ---------------------------------------------------------------
    async function guardarPerfil() {
        setMensagemPerfil('');

        const { error } = await supabase.auth.updateUser({
            email,
            data: { display_name: displayName },
        });

        if (error) {
            setErroPerfil(true);
            setMensagemPerfil('Erro ao guardar: ' + error.message);
        } else {
            setErroPerfil(false);
            setMensagemPerfil('Perfil atualizado com sucesso!');
        }
    }


    // ---------------------------------------------------------------
    // FUNÇÃO: Alterar password
    // ---------------------------------------------------------------
    async function alterarPassword() {
        setMensagemPassword('');

        if (novaPassword !== confirmarPassword) {
            setErroPassword(true);
            setMensagemPassword('As passwords não coincidem.');
            return;
        }

        if (novaPassword.length < 6) {
            setErroPassword(true);
            setMensagemPassword('A password deve ter pelo menos 6 caracteres.');
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: novaPassword });

        if (error) {
            setErroPassword(true);
            setMensagemPassword('Erro ao alterar password: ' + error.message);
        } else {
            setErroPassword(false);
            setMensagemPassword('Password alterada com sucesso!');
            setNovaPassword('');
            setConfirmarPassword('');
        }
    }


    return (
        <div style={css.pagina}>
            <h2 style={css.titulo}>Perfil</h2>

            <div style={css.zonacartoes}>
                {/* --- Secção: Dados da conta --- */}
                <div style={css.cartao}>
                    <h3 style={css.subtitulo}>Dados da conta</h3>

                    <label style={css.label}>Nome</label>
                    <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        style={css.input}
                        placeholder="O teu nome"
                    />

                    <label style={css.label}>Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={css.input}
                        placeholder="O teu email"
                    />

                    {mensagemPerfil && (
                        <p style={erroPerfil ? css.erro : css.sucesso}>{mensagemPerfil}</p>
                    )}

                    <button onClick={guardarPerfil} style={css.botao}>
                        Guardar alterações
                    </button>
                </div>

                {/* --- Secção: Alterar password --- */}
                <div style={css.cartao}>
                    <h3 style={css.subtitulo}>Alterar password</h3>

                    <label style={css.label}>Nova password</label>
                    <input
                        type="password"
                        value={novaPassword}
                        onChange={(e) => setNovaPassword(e.target.value)}
                        style={css.input}
                        placeholder="Nova password"
                    />

                    <label style={css.label}>Confirmar password</label>
                    <input
                        type="password"
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                        style={css.input}
                        placeholder="Confirmar password"
                    />

                    {mensagemPassword && (
                        <p style={erroPassword ? css.erro : css.sucesso}>{mensagemPassword}</p>
                    )}

                    <button onClick={alterarPassword} style={css.botao}>
                        Alterar password
                    </button>
                </div>
            </div>
        </div>
    );
}


// =================================================================
// ESTILOS
// =================================================================
const css: Record<string, React.CSSProperties> = {
    pagina: {
        padding: '40px 32px',
    },
    zonacartoes: {
        display: 'flex',
        flexDirection: 'row',
        gap: '24px',
        alignItems: 'flex-start',
    },
    titulo: {
        fontSize: '1.8rem',
        fontWeight: '700',
        marginBottom: '24px',
        color: '#2d2d2d',
    },
    cartao: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
    },
    subtitulo: {
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '8px',
        marginTop: '0',
        color: '#2d2d2d',
    },
    label: {
        fontSize: '0.85rem',
        color: '#666',
        marginTop: '8px',
    },
    input: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '0.95rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    botao: {
        marginTop: '12px',
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#4a7c59',
        color: '#fff',
        fontWeight: '600',
        cursor: 'pointer',
        alignSelf: 'flex-start',
    },
    sucesso: {
        color: '#2d7a2d',
        fontSize: '0.9rem',
        margin: '4px 0',
    },
    erro: {
        color: '#c0392b',
        fontSize: '0.9rem',
        margin: '4px 0',
    },
};