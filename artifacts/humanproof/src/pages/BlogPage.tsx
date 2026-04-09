import React from 'react';
import { Sparkles, TrendingUp, Cpu } from 'lucide-react';

export const BlogPage: React.FC = () => {
    const posts = [
        {
            title: "THE HUMAN ADVANTAGE IN THE GENERATIVE AI ERA",
            excerpt: "Why emotional intelligence and strategic synthesis are becoming the most valuable assets in the modern labor market.",
            date: "01.04.2026",
            readTime: "6 MIN",
            icon: <Sparkles className="w-4 h-4 text-cyan-400" />
        },
        {
            title: "TOP 10 ANTI-FRAGILE CAREERS FOR 2026",
            excerpt: "Detailed analysis of sectors that are thriving despite the rapid advancement of neural automation cycles.",
            date: "28.03.2026",
            readTime: "8 MIN",
            icon: <TrendingUp className="w-4 h-4 text-emerald-400" />
        },
        {
            title: "BUILDING AN ANTI-FRAGILE CAREER PORTFOLIO",
            excerpt: "Advanced strategies for diversifying professional signals to survive and thrive during extreme market volatility.",
            date: "15.03.2026",
            readTime: "12 MIN",
            icon: <Cpu className="w-4 h-4 text-slate-400" />
        }
    ];

    return (
        <div className="min-h-screen bg-[#020408] text-white pt-40 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24 max-w-3xl mx-auto px-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 block">Intelligence Stream</span>
                    <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9]">
                        FIELD <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 italic">REPORTS.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium">Deep-dives into the architecture of the new labor economy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {posts.map((post, i) => (
                        <article key={i} className="card group reveal flex flex-col h-full hover:!border-cyan-500/20">
                            <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl w-fit mb-8 group-hover:border-white/20 transition-all">
                                {post.icon}
                            </div>
                            <h3 className="text-xl font-black text-white mb-4 group-hover:text-cyan-400 transition-colors tracking-tight leading-tight">{post.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 flex-1">{post.excerpt}</p>
                            <div className="flex items-center justify-between pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-700">
                                <span>{post.date}</span>
                                <span className="text-cyan-500">{post.readTime} SCAN</span>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-20 p-16 card !bg-transparent !border-dashed !border-white/5 text-center reveal">
                     <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.4em]">Intelligence gathering in progress. Check back soon.</p>
                </div>
            </div>
        </div>
    );
};
