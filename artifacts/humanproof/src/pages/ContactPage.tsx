import React from 'react';
import { Mail, MessageSquare, Globe } from 'lucide-react';

export const ContactPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#020408] text-white pt-40 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-24 max-w-3xl mx-auto px-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 block">Communication Link</span>
                    <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9]">
                        DIRECT <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 italic">TRANSMISSION.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed">Our liaison team is ready to assist with protocol inquiries and enterprise node allocation.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div className="space-y-12">
                        {[
                            { icon: Mail, title: 'Liaison Support', val: 'support@humanproof.ai', color: 'text-cyan-400' },
                            { icon: MessageSquare, title: 'Real-time Sync', val: 'Mon-Sun via Neural Chat', color: 'text-emerald-400' },
                            { icon: Globe, title: 'Global HQ', val: 'One Tech Plaza, New York, NY 10001', color: 'text-slate-400' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-6 group">
                                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl group-hover:border-white/20 transition-all">
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{item.title}</h4>
                                    <p className="text-lg font-black text-white tracking-tight">{item.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card !p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full translate-x-16 -translate-y-16" />
                        <form className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Network Handle</label>
                                    <input type="text" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/30" placeholder="NAME://USER" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Signal Address</label>
                                    <input type="email" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/30" placeholder="ADDR://EMAIL" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Transmission Payload</label>
                                <textarea rows={5} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/30 resize-none" placeholder="Enter your data payload here..." />
                            </div>
                            <button className="btn-primary w-full py-5 !text-[10px] tracking-[0.2em]">
                                EXECUTE TRANSMISSION
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
