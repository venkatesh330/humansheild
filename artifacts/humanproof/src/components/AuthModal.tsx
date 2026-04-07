// ════════════════════════════════════════════════════════════════
// AuthModal.tsx — Enhanced Auth with Google OAuth + Forgot Password
// ════════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const resetMessages = () => { setErrorMsg(''); setSuccessMsg(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessMsg('✓ Password reset email sent! Check your inbox.');
        setMode('login');
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('✓ Account created! Check your email to verify, then sign in.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setOauthLoading(true);
    resetMessages();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
      setOauthLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.95rem',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background: 'var(--bg2, #111827)',
        border: '1px solid var(--border, rgba(255,255,255,0.1))',
        borderRadius: '16px', padding: '36px', width: '100%',
        maxWidth: '420px', position: 'relative',
        animation: 'fadeIn 0.2s ease-out',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', color: 'var(--text2, #9ba5b4)',
          cursor: 'pointer', fontSize: '1.2rem', padding: '4px', borderRadius: '4px',
        }}>×</button>

        <h2 style={{ color: '#fff', marginBottom: '4px', fontFamily: 'var(--mono)', fontSize: '1.4rem' }}>
          {mode === 'forgot' ? 'Reset Password' : mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '24px' }}>
          {mode === 'forgot' ? "Enter your email and we'll send a reset link." :
           mode === 'login' ? 'Sign in to access your saved assessments.' :
           'Join HumanProof to track your AI displacement risk over time.'}
        </p>

        {errorMsg && (
          <div style={{ color: '#ff4757', fontSize: '0.85rem', marginBottom: '16px', padding: '10px 12px', background: 'rgba(255,71,87,0.1)', borderRadius: '8px', border: '1px solid rgba(255,71,87,0.2)' }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ color: '#00ff9f', fontSize: '0.85rem', marginBottom: '16px', padding: '10px 12px', background: 'rgba(0,255,159,0.1)', borderRadius: '8px', border: '1px solid rgba(0,255,159,0.2)' }}>
            {successMsg}
          </div>
        )}

        {/* Google OAuth */}
        {mode !== 'forgot' && (
          <>
            <button
              type="button" onClick={handleGoogleOAuth} disabled={oauthLoading}
              style={{
                width: '100%', padding: '13px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                color: '#fff', fontFamily: 'var(--body)', fontSize: '0.9rem',
                cursor: oauthLoading ? 'not-allowed' : 'pointer', marginBottom: '20px',
                transition: 'background 0.2s', opacity: oauthLoading ? 0.7 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {oauthLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '20px' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="you@example.com" />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inputStyle} placeholder="••••••••" />
              {mode === 'login' && (
                <button type="button" onClick={() => { setMode('forgot'); resetMessages(); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '0.78rem', cursor: 'pointer', marginTop: '6px', padding: 0, textDecoration: 'underline' }}>
                  Forgot password?
                </button>
              )}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, var(--cyan, #00F5FF), #4CD964)',
              color: '#000', border: 'none', borderRadius: '10px',
              fontWeight: 700, fontFamily: 'var(--mono)', fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0,245,255,0.2)',
            }}>
            {loading ? 'Processing...' : mode === 'forgot' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: '20px', flexWrap: 'wrap' }}>
          {mode !== 'login' && (
            <button type="button" onClick={() => { setMode('login'); resetMessages(); }}
              style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}>
              Sign In
            </button>
          )}
          {mode !== 'signup' && (
            <button type="button" onClick={() => { setMode('signup'); resetMessages(); }}
              style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}>
              Create Account
            </button>
          )}
          {mode === 'forgot' && (
            <button type="button" onClick={() => { setMode('login'); resetMessages(); }}
              style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '0.82rem', cursor: 'pointer' }}>
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
