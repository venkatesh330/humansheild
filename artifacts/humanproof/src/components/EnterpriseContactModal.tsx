import React, { useState } from 'react';
import { submitEnterpriseContact, TEAM_SIZE_OPTIONS, USE_CASE_OPTIONS, type EnterpriseContactInput } from '../services/enterpriseContactService';

interface EnterpriseContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Row: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', gap: '16px', marginBottom: '16px'}}>{children}</div>
);

const Field: React.FC<{label: string; children: React.ReactNode; flex?: number}> = ({label, children, flex = 1}) => (
  <div style={{flex}}>
    <label style={{display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#999'}}>{label}</label>
    {children}
  </div>
);

export const EnterpriseContactModal: React.FC<EnterpriseContactModalProps> = ({isOpen, onClose}) => {
  const [formData, setFormData] = useState<Partial<EnterpriseContactInput>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await submitEnterpriseContact(formData as EnterpriseContactInput);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({});
      }, 2000);
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  if (success) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: '#0b1020',
          border: '1px solid #00f5ff',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '400px',
          textAlign: 'center',
        }}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>✓</div>
          <h2 style={{marginBottom: '12px'}}>Thanks for reaching out!</h2>
          <p style={{color: '#999'}}>Our sales team will contact you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#0b1020',
        border: '1px solid #00f5ff',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <h2 style={{marginBottom: '24px', fontSize: '20px'}}>Enterprise Contact</h2>

        <form onSubmit={handleSubmit}>
          <Row>
            <Field label="Full Name" flex={1}>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{width: '100%', padding: '8px 12px', border: '1px solid #333', borderRadius: '6px', background: '#1a1f35', color: '#fff', fontSize: '14px'}}
              />
            </Field>
            <Field label="Email" flex={1}>
              <input
                type="email"
                placeholder="john@company.com"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{width: '100%', padding: '8px 12px', border: '1px solid #333', borderRadius: '6px', background: '#1a1f35', color: '#fff', fontSize: '14px'}}
              />
            </Field>
          </Row>

          <Row>
            <Field label="Company" flex={1}>
              <input
                type="text"
                placeholder="Acme Corp"
                value={formData.company || ''}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                style={{width: '100%', padding: '8px 12px', border: '1px solid #333', borderRadius: '6px', background: '#1a1f35', color: '#fff', fontSize: '14px'}}
              />
            </Field>
            <Field label="Job Role" flex={1}>
              <input
                type="text"
                placeholder="Head of HR"
                value={formData.role || ''}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={{width: '100%', padding: '8px 12px', border: '1px solid #333', borderRadius: '6px', background: '#1a1f35', color: '#fff', fontSize: '14px'}}
              />
            </Field>
          </Row>

          <Row>
            <Field label="Team Size" flex={1}>
              <select
                value={formData.teamSize || ''}
                onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
                style={{width: '100%', padding: '8px 12px', border: '1px solid #333', borderRadius: '6px', background: '#1a1f35', color: '#fff', fontSize: '14px'}}
              >
                <option value="">Select...</option>
                {TEAM_SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </Field>
            <Field label="Use Case" flex={1}>
              <select
                value={formData.useCase || ''}
                onChange={(e) => setFormData({...formData, useCase: e.target.value})}
                style={{width: '100%', padding: '8px 12px', border: '1px solid #333', borderRadius: '6px', background: '#1a1f35', color: '#fff', fontSize: '14px'}}
              >
                <option value="">Select...</option>
                {USE_CASE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </Field>
          </Row>

          <Row>
            <Field label="Phone (optional)" flex={1}>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                style={{width: '100%', padding: '8px 12px', border: '1px solid #333', borderRadius: '6px', background: '#1a1f35', color: '#fff', fontSize: '14px'}}
              />
            </Field>
          </Row>

          <Row>
            <Field label="Message (optional)" flex={1}>
              <textarea
                placeholder="Tell us about your needs..."
                value={formData.message || ''}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                style={{width: '100%', padding: '8px 12px', border: '1px solid #333', borderRadius: '6px', background: '#1a1f35', color: '#fff', fontSize: '14px', fontFamily: 'inherit'}}
              />
            </Field>
          </Row>

          {error && (
            <div style={{padding: '12px', background: '#ff5555', borderRadius: '6px', marginBottom: '16px', color: '#fff', fontSize: '13px'}}>
              {error}
            </div>
          )}

          <Row>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                background: '#00f5ff',
                border: 'none',
                borderRadius: '6px',
                color: '#000',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </Row>
        </form>
      </div>
    </div>
  );
};
