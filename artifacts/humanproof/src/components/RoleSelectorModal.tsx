import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Cpu, Activity, ArrowRight, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { MASTER_CAREER_INTELLIGENCE } from '../data/intelligence';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleSelectorModal({ isOpen, onClose }: RoleSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const roles = Object.values(MASTER_CAREER_INTELLIGENCE);
  const filteredRoles = roles.filter(role => 
    role.title.toLowerCase().includes(search.toLowerCase()) ||
    role.industry.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setProgress(0);
  };

  useEffect(() => {
    if (isAnalyzing) {
      const steps = [
        'Initializing Frontier Engine...',
        'Synthesizing 4.8B+ data nodes...',
        'Calibrating 6-dimension risk matrix...',
        'Evaluating task-specific automation depth...',
        'Finalizing audit report...'
      ];
      
      let stepIdx = 0;
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsAnalyzing(false);
              onClose();
              // In a real app, navigate to results
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'calculator' }));
            }, 500);
            return 100;
          }
          const next = prev + 1;
          if (next % 20 === 0 && stepIdx < steps.length - 1) {
            stepIdx++;
            setCurrentStep(steps[stepIdx]);
          }
          return next;
        });
      }, 30);
      setCurrentStep(steps[0]);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, onClose]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-bg" style={{ zIndex: 1100 }} />
        <Dialog.Content 
          className="card" 
          style={{ 
            position: 'fixed', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: '600px',
            zIndex: 1200,
            padding: 0,
            border: '1px solid var(--border-cyan)',
            boxShadow: '0 0 50px rgba(0, 240, 255, 0.15)',
            background: 'var(--bg-overlay)',
          }}
        >
          <AnimatePresence mode="wait">
            {!isAnalyzing ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ padding: '32px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 className="display-3" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Risk Oracle</h2>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Select your role to begin high-fidelity auditing.</p>
                  </div>
                  <button onClick={onClose} className="theme-toggle">
                    <X size={18} />
                  </button>
                </div>

                <div className="input-prefix-wrap" style={{ marginBottom: '24px' }}>
                  <Search className="input-prefix-icon" size={18} />
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Search 250+ professionally verified roles..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredRoles.map((role) => (
                    <button
                      key={role.title}
                      className="btn-secondary"
                      onClick={startAnalysis}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '14px 20px',
                        textAlign: 'left',
                        width: '100%',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      <span>{role.title} <span style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginLeft: '8px' }}>{role.industry}</span></span>
                      <ArrowRight size={14} style={{ opacity: 0.5 }} />
                    </button>
                  ))}
                  {filteredRoles.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>
                      No roles found. Try a different industry.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ 
                  padding: '64px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div style={{ position: 'relative', marginBottom: '40px' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      border: '2px solid var(--cyan-dim)',
                      borderTopColor: 'var(--cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Shield size={48} className="text-cyan-400" style={{ color: 'var(--cyan)' }} />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      position: 'absolute',
                      inset: -20,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, var(--cyan) 0%, transparent 70%)',
                      zIndex: -1
                    }}
                  />
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.05em' }}>
                  ANALYZING WITH FRONTIER AI...
                </h2>
                
                <div style={{ width: '100%', maxWidth: '300px', marginBottom: '24px' }}>
                  <div className="gauge-track" style={{ background: 'rgba(255,255,255,0.03)', height: '4px' }}>
                    <motion.div 
                      className="gauge-fill" 
                      style={{ 
                        width: `${progress}%`, 
                        background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
                        boxShadow: '0 0 10px var(--cyan)',
                      }} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span className="label-xs" style={{ color: 'var(--cyan)' }}>{progress}%</span>
                    <span className="label-xs">{currentStep}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%' }}>
                  {[
                    { icon: Cpu, label: 'Neural Synapse' },
                    { icon: Activity, label: 'Risk Calibration' },
                    { icon: Shield, label: 'Safety Protocol' }
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                      <item.icon size={16} style={{ margin: '0 auto 8px', color: i === 0 ? 'var(--cyan)' : i === 1 ? 'var(--violet)' : 'var(--emerald)' }} />
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.6 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
