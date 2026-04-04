import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Registration successful! Please check your email to verify your account.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--bg2, #111827)',
        border: '1px solid var(--border, rgba(255,255,255,0.1))',
        borderRadius: '12px',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text2, #9ba5b4)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '4px'
          }}
        >
          ×
        </button>

        <h2 style={{ color: 'var(--text, #fff)', marginBottom: '8px', fontFamily: 'var(--mono)' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--text2, #9ba5b4)', fontSize: '0.9rem', marginBottom: '24px' }}>
          {isLogin ? 'Sign in to access your saved risk assessments.' : 'Join HumanProof to track your layoff risk over time.'}
        </p>

        {errorMsg && (
          <div style={{ color: 'var(--red, #ff4757)', fontSize: '0.85rem', marginBottom: '16px', padding: '8px', background: 'rgba(255,71,87,0.1)', borderRadius: '6px', border: '1px solid rgba(255,71,87,0.2)' }}>
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div style={{ color: 'var(--emerald, #00ff9f)', fontSize: '0.85rem', marginBottom: '16px', padding: '8px', background: 'rgba(0,255,159,0.1)', borderRadius: '6px', border: '1px solid rgba(0,255,159,0.2)' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text2, #9ba5b4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontFamily: 'var(--body)',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text2, #9ba5b4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontFamily: 'var(--body)',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--cyan, #00F5FF)',
              color: 'var(--bg, #000)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontFamily: 'var(--mono)',
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cyan, #00F5FF)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
