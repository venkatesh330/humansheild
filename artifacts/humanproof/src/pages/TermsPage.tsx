import React from 'react';

export const TermsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#020408] text-white pt-40 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 block">Usage Protocol</span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">
                        TERMS OF <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 italic">DEPLOYMENT.</span>
                    </h1>
                </div>
                
                <div className="space-y-12 text-slate-500 font-medium leading-[1.8]">
                    <section className="reveal">
                        <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">01. ACCEPTABLE SIGNAL USE</h2>
                        <p>By initializing the HumanShield terminal, you agree to provide authentic signal data for calibration. Automated extraction of proprietary risk vectors or stress-testing our API nodes for non-personal use is strictly prohibited.</p>
                    </section>

                    <section className="reveal">
                        <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">02. INTELLECTUAL SOVEREIGNTY</h2>
                        <p>All systemic algorithms, UI architecture, and generative signal pathways are the exclusive intellectual property of HUMANSHIELD SYSTEM ARCHITECTURE. Unauthorized replication of our audit standard is a violation of deployment terms.</p>
                    </section>

                    <section className="reveal">
                        <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">03. LIABILITY SHIELD</h2>
                        <p>Risk indices are high-fidelity projections, not absolute career guarantees. We deliver actionable intelligence based on Q1 2026 datasets, but do not assume liability for external market volatilities or specific employer decisions.</p>
                    </section>

                    <section className="reveal">
                        <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">04. SERVICE CONTINUITY</h2>
                        <p>Node availability and API synchronization are subject to standard network maintenance cycles. We reserve the right to recalibrate risk models as new AI capabilities emerge in the market.</p>
                    </section>
                </div>
                
                <div className="mt-32 pt-12 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                    <span>Protocol Synchronized: April 7, 2026</span>
                </div>
            </div>
        </div>
    );
};
