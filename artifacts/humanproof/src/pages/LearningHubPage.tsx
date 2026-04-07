import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, BookOpen, Clock, Target, CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

// -- Types --
interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'article' | 'video' | 'project';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  provider: string;
  url: string;
  skills: string[];
}

interface Path {
  id: string;
  title: string;
  role: string;
  steps: {
    title: string;
    description: string;
    duration: string;
  }[];
}

export const LearningHubPage: React.FC<{ initialRoleKey?: string }> = ({ initialRoleKey }) => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'discover' | 'my-paths' | 'progress'>('discover');
  const [searchQuery, setSearchQuery] = useState(initialRoleKey || '');
  const [debouncedQuery, setDebouncedQuery] = useState(initialRoleKey || '');
  const [resources, setResources] = useState<Resource[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Use ref to track the search query for the fetch closure
  const searchRef = useRef(searchQuery);
  searchRef.current = searchQuery;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchResources();
    if (user) {
      fetchPaths();
    }
  }, [debouncedQuery, user]);

  useEffect(() => {
    const handleRoleKey = (e: any) => {
      if (e.detail) {
        setSearchQuery(e.detail);
        setActiveTab('discover');
      }
    };
    window.addEventListener('hub-rolekey', handleRoleKey);
    return () => window.removeEventListener('hub-rolekey', handleRoleKey);
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/learning/resources?q=${encodeURIComponent(searchRef.current)}`);
      if (!resp.ok) throw new Error('Failed to fetch resources');
      const data = await resp.json();
      setResources(data);
    } catch (err) {
      addToast('error', 'Could not load resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaths = async () => {
    try {
      const resp = await fetch('/api/learning/paths');
      if (resp.ok) {
        const data = await resp.json();
        setPaths(data);
      }
    } catch (err) {
      console.error('Error fetching paths:', err);
    }
  };

  const generatePath = async () => {
    if (!user) {
      addToast('info', 'Please sign in to generate custom paths');
      return;
    }
    setIsGenerating(true);
    try {
      const resp = await fetch('/api/learning/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: searchQuery })
      });
      if (!resp.ok) throw new Error('Generation failed');
      const newPath = await resp.json();
      setPaths([newPath, ...paths]);
      addToast('success', 'Your custom learning path is ready!');
      setActiveTab('my-paths');
    } catch (err) {
      addToast('error', 'AI Generation service is currently busy');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update Status
  const toggleProgress = async (resourceId: string, updates: { bookmarked?: boolean, status?: string }) => {
    if (!session?.user) {
      toastInfo('Please sign in to track your learning progress.');
      return;
    }
    try {
      const body: any = {};
      if (updates.bookmarked !== undefined) body.isBookmarked = updates.bookmarked;
      if (updates.status !== undefined) body.status = updates.status;

      // Optimistic UI update
      setUserProgress(prev => {
        const existing = prev.find(p => p.resourceId === resourceId);
        if (existing) {
          return prev.map(p => p.resourceId === resourceId ? { ...p, ...body } : p);
        }
        return [...prev, { id: Date.now().toString(), resourceId, status: body.status || 'not_started', isBookmarked: body.isBookmarked || false }];
      });

      const resp = await fetch(`/api/resources/${resourceId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        fetchUserProgress(); // rollback on failure
        toastError('Failed to save progress. Please try again.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const enrollInPath = async (pathId: string) => {
    if (!session?.user) {
      toastInfo('Please sign in to enroll in a learning path.');
      return;
    }
    try {
      const resp = await fetch(`/api/learning-paths/${pathId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status: 'in_progress' })
      });
      if (resp.ok) {
        toastSuccess('🌟 Enrolled in path! Start your first module below.');
      } else {
        toastError('Enrollment failed. Please try again.');
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'discover') fetchResources();
    else if (activeTab === 'paths') fetchPaths();
    else if (activeTab === 'progress') fetchAllResourcesForProgress();
  }, [activeTab, filters.language, filters.level, filters.dimension, debouncedQ, state.jobId, autoRiskLevel, roleKeyOverride]);

  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);


  // -- Render Helpers --
  const getResourceProgress = (id: string) => userProgress.find(p => p.resourceId === id);

  const ResourceCard = ({ resource, inPath = false }: { resource: Resource, inPath?: boolean }) => {
    const prog = getResourceProgress(resource.id);
    const isCompleted = prog?.status === 'completed';
    const isBookmarked = prog?.isBookmarked;

    return (
      <div style={{
        background: 'var(--surface)', border: `1px solid ${isCompleted ? 'var(--emerald)' : 'var(--border)'}`,
        borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10,
        opacity: isCompleted && !inPath ? 0.7 : 1, transition: 'all 0.2s', position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600 }}>{resource.provider}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => toggleProgress(resource.id, { bookmarked: !isBookmarked })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked ? 'var(--cyan)' : 'var(--text3)' }}>
              <Bookmark size={14} fill={isBookmarked ? 'var(--cyan)' : 'none'} />
            </button>
            <button onClick={() => toggleProgress(resource.id, { status: isCompleted ? 'in_progress' : 'completed' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isCompleted ? 'var(--emerald)' : 'var(--text3)' }}>
              <CheckCircle size={14} fill={isCompleted ? 'var(--emerald)' : 'none'} />
            </button>
          </div>
        </div>

        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text1)' }}>{resource.title}</h3>
        
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 'auto' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{LANGUAGE_FLAGS[resource.language]} {resource.languageLabel}</span>
          <span style={{ fontSize: '0.78rem', color: LEVEL_COLORS[resource.level], fontWeight: 600 }}>{resource.level}</span>
          {resource.durationHours && <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}><Clock size={11} /> {resource.durationHours}h</span>}
        </div>
        
        <a href={resource.url} target="_blank" rel="noreferrer" style={{
          marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '0.8rem', color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600
        }}>
           Open Resource <ExternalLink size={12} />
        </a>
      </div>
    );
  };


  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">LEARNING <span className="text-cyan-500">HUB</span></h1>
          <p className="text-slate-400">Master the "Human Advantage" with curated upskilling paths.</p>
        </div>
        
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {(['discover', 'my-paths', 'progress'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'discover' ? 'Discover' : tab === 'my-paths' ? 'My Paths' : 'Progress'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'discover' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder="Search skills (e.g. 'Strategic Leadership', 'Prompt Engineering'...)"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-6">
              <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
                <Sparkles className="w-6 h-6 text-cyan-400 mb-4" />
                <h3 className="text-white font-bold mb-2">AI-Powered Paths</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Generate a personalised roadmap based on your current role and target job market.
                </p>
                <button
                  onClick={generatePath}
                  disabled={isGenerating || !searchQuery}
                  className="w-full py-3 bg-cyan-500 text-black text-xs font-black rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'GENERATE PATH'}
                </button>
              </div>

              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Trending Skills</h4>
                <div className="space-y-2">
                  {['Systems Thinking', 'Bio-Leadership', 'AI Governance', 'Creative Strategy'].map(s => (
                    <button key={s} onClick={() => setSearchQuery(s)} className="block text-sm text-slate-300 hover:text-cyan-400 transition-colors">
                      # {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                  <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
                  <span className="text-slate-500 font-mono text-sm">INDEXING RESOURCES...</span>
                </div>
              ) : resources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {resources.map(res => (
                    <div key={res.id} className="group p-6 bg-slate-900/30 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all hover:bg-slate-900/50">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          res.type === 'course' ? 'bg-purple-500/20 text-purple-400' :
                          res.type === 'project' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {res.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{res.duration}</span>
                      </div>
                      <h3 className="text-white font-bold group-hover:text-cyan-400 transition-colors mb-2 line-clamp-1">{res.title}</h3>
                      <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">{res.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{res.provider}</span>
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-cyan-500 group-hover:text-black transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                  <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No results for "{searchQuery}"</p>
                  <p className="text-slate-600 text-sm">Try searching for broader skill categories</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'my-paths' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
          {paths.length > 0 ? (
            paths.map(path => (
              <div key={path.id} className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Target className="w-32 h-32 text-cyan-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{path.title}</h3>
                <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-6">Target: {path.role}</p>
                
                <div className="space-y-6 relative">
                  {path.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                          {idx + 1}
                        </div>
                        {idx !== path.steps.length - 1 && <div className="w-px h-full bg-slate-800 my-2" />}
                      </div>
                      <div className="pb-2">
                        <h4 className="text-white font-bold text-sm mb-1">{step.title}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed mb-2">{step.description}</p>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">{step.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-8 py-3 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-all">
                  ACTIVATE PATHWAY
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-32">
              <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">You haven't generated any paths yet.</p>
              <button 
                onClick={() => setActiveTab('discover')}
                className="mt-4 text-cyan-400 text-sm hover:underline"
              >
                Go to Discover to start
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-12 text-center animate-in fade-in duration-500">
          <CheckCircle2 className="w-16 h-16 text-slate-800 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Learning Analytics</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            Complete your first module to unlock skills proficiency tracking and career safety dividends.
          </p>
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
             <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
               <div className="text-2xl font-bold text-white">0</div>
               <div className="text-[10px] text-slate-500 uppercase font-black">Hrs Learned</div>
             </div>
             <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
               <div className="text-2xl font-bold text-white">0</div>
               <div className="text-[10px] text-slate-500 uppercase font-black">Skills Maxed</div>
             </div>
             <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
               <div className="text-2xl font-bold text-white">0%</div>
               <div className="text-[10px] text-slate-500 uppercase font-black">Risk Offset</div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
