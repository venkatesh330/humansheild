import React from 'react';

export const PrivacyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#020408] text-white pt-40 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 block">Legal Protocol</span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">
                        PRIVACY <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 italic">GOVERNANCE.</span>
                    </h1>
                </div>
                
                <div className="space-y-12 text-slate-500 font-medium leading-[1.8]">
                    <section className="reveal">
                        <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">01. DATA INGESTION</h2>
                        <p>We only capture identifying telemetry required to calibrate your resilience index. This includes role-specific signal data, skill matrices, and verified network handles. We do not ingest non-contextual personal payloads.</p>
                    </section>

                    <section className="reveal">
                        <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">02. SIGNAL UTILIZATION</h2>
                        <p>Your signal data is processed exclusively for risk calibration and pathway synthesis. Our proprietary nodes do not distribute or liquidate individual user signal to third-party data brokerage networks.</p>
                    </section>

                    <section className="reveal">
                        <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">03. STORAGE SECURITY</h2>
                        <p>All signal payloads are secured via high-fidelity encryption at rest. Audit nodes are quarantined and access-controlled through Supabase edge authentication protocols.</p>
                    </section>

                    <section className="reveal">
                        <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">04. DELETION RIGHTS</h2>
                        <p>Users maintain full sovereignty over their signal data. You may execute a full node wipe at any time through your terminal settings or by contacting our liaison team.</p>
                    </section>
                </div>
                
                <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 text-[10px] font-black uppercase tracking-widest">
                    <span>Protocol Revision: 7.2.2026</span>
                    <span>© HUMANSHIELD SYSTEM ARCHITECTURE</span>
                </div>
            </div>
        </div>
    );
};
