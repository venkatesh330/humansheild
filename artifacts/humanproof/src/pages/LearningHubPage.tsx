<<<<<<< HEAD
import { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Globe, Search, RotateCcw, Zap, Target, CheckCircle, Bookmark, Compass, Award, ExternalLink, Clock } from 'lucide-react';
import { useHumanProof } from '../context/HumanProofContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { supabase } from '../utils/supabase';
import { DataFreshnessBadge } from '../components/DataFreshnessBadge';
// import apiClient from '../utils/apiClient'; // Not used in favor of native fetch currently
=======
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, BookOpen, Clock, Target, CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
>>>>>>> audit-fixes-2026-04-07

// -- Types --
interface Resource {
<<<<<<< HEAD
  id: string; title: string; provider: string; url: string; language: string; languageLabel: string;
  isFree: 'yes' | 'audit' | 'scholarship'; level: 'beginner' | 'intermediate' | 'advanced';
  durationHours: number | null; targetDimension: string | null; riskLevelTarget: string; tags: string[] | null;
  rating?: number; reviewCount?: number;
}
interface LearningPath {
  id: string; title: string; description: string; targetRoleKey: string; targetDimension: string;
  difficultyLevel: string; estimatedHours: number;
}
interface PathWithResources extends LearningPath {
  resources: { resource: Resource; orderIndex: number; isRequired: boolean }[];
}
interface ResourceProgress {
  id: string; resourceId: string; status: 'not_started' | 'in_progress' | 'completed'; isBookmarked: boolean;
}

// -- Constants --
const LEVEL_COLORS: Record<string, string> = { beginner: 'var(--emerald)', intermediate: 'var(--yellow)', advanced: 'var(--orange)' };
const DIM_LABELS: Record<string, string> = { D1: 'Reduce Task Risk', D2: 'AI Tool Skills', D3: 'Augmentation', D6: 'Network & Leadership', general: 'General AI Literacy' };
const FREE_LABELS: Record<string, { label: string; color: string }> = { yes: { label: 'FREE', color: 'var(--emerald)' }, audit: { label: 'FREE AUDIT', color: 'var(--cyan)' }, scholarship: { label: 'SCHOLARSHIP', color: 'var(--yellow)' } };
const LANGUAGE_FLAGS: Record<string, string> = { en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', zh: '🇨🇳', hi: '🇮🇳', pt: '🇧🇷', ar: '🇸🇦' };

export function LearningHubPage() {
  const { state } = useHumanProof();
  const { session } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  
  const [activeTab, setActiveTab] = useState<'discover' | 'paths' | 'progress'>('discover');
  // BUG-011 FIX: Use ref for offset to avoid stale closures in fetchResources
  const offsetRef = useRef(0);
  
  // States
  const [resources, setResources] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]); // BUG-011: independent fetch for progress tab
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [activePathDetails, setActivePathDetails] = useState<PathWithResources | null>(null);
  const [userProgress, setUserProgress] = useState<ResourceProgress[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleKeyOverride, setRoleKeyOverride] = useState<string | null>(null);

  // Filters with debounce
  const [filters, setFilters] = useState({ language: '', level: '', dimension: '', q: '' });
  const [debouncedQ, setDebouncedQ] = useState('');

  const jobRisk = state.jobRiskScore;
  const autoRiskLevel = jobRisk !== null ? (jobRisk >= 80 ? 'critical' : jobRisk >= 65 ? 'high' : jobRisk >= 40 ? 'moderate' : 'all') : 'all';

  // BUG-011 FIX: Listen for hub-rolekey custom event from SafeCareers navigation
  useEffect(() => {
    const handler = (e: CustomEvent) => setRoleKeyOverride(e.detail);
    window.addEventListener('hub-rolekey', handler as EventListener);
    return () => window.removeEventListener('hub-rolekey', handler as EventListener);
  }, []);

  // Debounce search input — 350ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(filters.q), 350);
    return () => clearTimeout(timer);
  }, [filters.q]);

  // Headers for API
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (session?.user?.id) {
      headers['x-user-id'] = session.user.id;
      // Also send Authorization header for requireAuth middleware
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.access_token) {
          headers['Authorization'] = `Bearer ${data.session.access_token}`;
        }
      });
    }
    return headers;
  };

  // BUG-003 FIX: Stale closure fixed — offset via ref, not state dep
  const fetchResources = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      setError(null);
      const searchParams = new URLSearchParams();
      if (filters.language) searchParams.set('language', filters.language);
      if (filters.level) searchParams.set('level', filters.level);
      if (filters.dimension) searchParams.set('dimension', filters.dimension);
      if (debouncedQ) searchParams.set('q', debouncedQ); // Use debounced value
      searchParams.set('limit', '18');

      const currentOffset = isLoadMore ? offsetRef.current + 18 : 0;
      searchParams.set('offset', currentOffset.toString());
      
      if (!isLoadMore) {
        offsetRef.current = 0;
        setResources([]);
      } else {
        offsetRef.current = currentOffset;
      }

      if (autoRiskLevel && autoRiskLevel !== 'all') {
        searchParams.set('riskLevel', autoRiskLevel);
      }

      const rk = roleKeyOverride || state.jobId;
      if (rk) searchParams.set('roleKey', rk);
      
      const resp = await fetch(`/api/resources?${searchParams.toString()}`);
      if (!resp.ok) throw new Error("Failed to load discovery catalogue");
      const json = await resp.json();
      
      if (isLoadMore) {
        setResources(prev => [...prev, ...json.data]);
      } else {
        setResources(json.data);
      }
      setTotal(json.pagination?.total || 0);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [filters.language, filters.level, filters.dimension, debouncedQ, state.jobId, autoRiskLevel, roleKeyOverride]);

  const fetchPaths = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const rk = roleKeyOverride || state.jobId || '';
      const query = rk ? `?roleKey=${rk}` : '';
      const resp = await fetch(`/api/learning-paths${query}`);
      // BUG FIX: Check resp.ok before parsing
      if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
      const json = await resp.json();
      setPaths(json.data || []);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [state.jobId, roleKeyOverride]);

  // BUG-011 FIX: Fetch all resources independently for Progress tab
  const fetchAllResourcesForProgress = useCallback(async () => {
    try {
      const resp = await fetch('/api/resources?limit=40');
      if (!resp.ok) return;
      const json = await resp.json();
      setAllResources(json.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchUserProgress = useCallback(async () => {
    if (!session?.user) return;
    try {
      const resp = await fetch(`/api/resources/progress`, { headers: getAuthHeaders() });
      const json = await resp.json();
      setUserProgress(json.data || []);
    } catch (e: any) { console.error('Failed to load user progress', e); }
  }, [session]);

  const fetchPathDetails = async (id: string) => {
    try {
      setLoading(true);
      const resp = await fetch(`/api/learning-paths/${id}`);
      const json = await resp.json();
      setActivePathDetails(json.data);
    } catch (e: any) { setError("Failed to fetch path structure"); } finally { setLoading(false); }
  };

  const generateAIPath = async () => {
    if (!session?.user) {
      toastError('Please sign in to use AI path generation.');
      return;
    }
    try {
      setLoading(true); setError(null);
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const resp = await fetch("/api/learning-paths/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
          ...(freshSession?.access_token ? { 'Authorization': `Bearer ${freshSession.access_token}` } : {}),
        },
        body: JSON.stringify({ roleKey: state.jobId || 'software_engineer' })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "AI Generation failed.");
      toastSuccess('🤖 AI Learning Path generated successfully! Check the Paths tab.');
      fetchPaths();
    } catch (e: any) {
      toastError(`AI Path Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
=======
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
>>>>>>> audit-fixes-2026-04-07
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
<<<<<<< HEAD
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      
      {/* Header & Tabs */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <BookOpen size={28} style={{ color: 'var(--cyan)' }} />
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>Learning Hub</h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text2)', fontSize: '0.95rem' }}>
              Advanced upskilling pipelines mapping directly to your AI vulnerability gaps.
            </p>
          </div>
          <DataFreshnessBadge roleKey={state.jobId || null} fallbackScore={state.jobRiskScore} />
        </div>

        {/* Custom Tabs */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          {[
            { id: 'discover', label: 'Discover', icon: <Search size={14}/> },
            { id: 'paths', label: 'Curated Paths', icon: <Compass size={14}/> },
            { id: 'progress', label: 'My Progress', icon: <Award size={14}/> }
          ].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id as any); setActivePathDetails(null); }}
              style={{
                background: activeTab === t.id ? 'var(--surface-hover)' : 'transparent',
                border: 'none', color: activeTab === t.id ? 'var(--cyan)' : 'var(--text2)',
                padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8, transition: '0.2s'
              }}>
              {t.icon} {t.label}
=======
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
>>>>>>> audit-fixes-2026-04-07
            </button>
          ))}
        </div>
      </div>

<<<<<<< HEAD
      {loading && <div style={{ color: 'var(--text3)' }}>Loading content...</div>}
      {error && <div style={{ color: 'var(--red)', background: 'rgba(255,0,0,0.1)', padding: 16, borderRadius: 8 }}>{error}</div>}

      {/* Tab Content: Discover */}
      {activeTab === 'discover' && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Search resources..." 
              value={filters.q}
              onChange={e => setFilters(f => ({...f, q: e.target.value}))}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', padding: '8px 16px', borderRadius: 8, flex: 1, minWidth: 200 }}
            />
            <select 
              value={filters.language} 
              onChange={e => setFilters(f => ({...f, language: e.target.value}))}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', padding: '8px 16px', borderRadius: 8 }}
            >
              <option value="">All Languages</option>
              <option value="en">English (en)</option>
              <option value="es">Spanish (es)</option>
              <option value="fr">French (fr)</option>
            </select>
            <select 
              value={filters.level} 
              onChange={e => setFilters(f => ({...f, level: e.target.value}))}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', padding: '8px 16px', borderRadius: 8 }}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select 
              value={filters.dimension} 
              onChange={e => setFilters(f => ({...f, dimension: e.target.value}))}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', padding: '8px 16px', borderRadius: 8 }}
            >
              <option value="">Any Focus</option>
              <option value="D1">Reduce Task Risk</option>
              <option value="D2">AI Tool Skills</option>
              <option value="D3">Augmentation</option>
              <option value="D6">Network & Leadership</option>
              <option value="general">General AI Literacy</option>
            </select>
          </div>
          
          {loading && resources.length === 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 180, width: 300, background: 'var(--surface)', borderRadius: 14, opacity: 0.5, border: '1px dashed var(--border)' }} />
              ))}
            </div>
          ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
            </div>
            {!loading && resources.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: 16, border: '1px dashed var(--border)' }}>
                 <Search size={40} style={{ color: 'var(--text3)', marginBottom: 16, opacity: 0.3 }} />
                 <h3 style={{ color: 'var(--text2)', marginBottom: 8 }}>No resources match your filters</h3>
                 <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Try broadening your search or resetting categories.</p>
                 <button onClick={() => setFilters({ language: '', level: '', dimension: '', q: '' })} style={{ background: 'none', border: '1px solid var(--cyan)', color: 'var(--cyan)', padding: '8px 16px', borderRadius: 20, marginTop: 16, cursor: 'pointer' }}>Reset All Filters</button>
              </div>
            )}
            
            {resources.length < total && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button 
                  onClick={() => fetchResources(true)}
                  disabled={loading}
                  style={{ background: 'transparent', border: '1px solid var(--cyan)', color: 'var(--cyan)', padding: '10px 24px', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
          )}
        </>
      )}

      {/* Tab Content: Paths */}
      {activeTab === 'paths' && !activePathDetails && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,245,255,0.05)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(0,245,255,0.1)' }}>
            <div>
              <h4 style={{ margin: 0, color: 'var(--text1)' }}>Tailor-made Curiosity Pipelines</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text3)' }}>Use our elite AI educator to architect a custom path for your role.</p>
            </div>
            <button onClick={generateAIPath} style={{
              background: 'linear-gradient(90deg, var(--cyan), var(--emerald))', border: 'none',
              color: '#000', padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 15px rgba(0,245,255,0.3)'
            }}>
              <Zap size={16} fill="black" /> Generate AI Path
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {paths.map(p => (
            <div key={p.id} onClick={() => fetchPathDetails(p.id)} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
              padding: 24, cursor: 'pointer', transition: '0.2s'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--cyan)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                {p.targetRoleKey ? `Tailored for ${p.targetRoleKey}` : 'General Path'}
              </div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem' }}>{p.title}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.5, marginBottom: 16 }}>{p.description}</p>
              
              <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Target size={12} /> {DIM_LABELS[p.targetDimension] || p.targetDimension}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> ~{p.estimatedHours}h</span>
                </div>
              </div>
            ))}
          </div>
          {paths.length === 0 && <span style={{ color: 'var(--text3)' }}>No paths available for this profile yet.</span>}
        </div>
      )}

      {/* Internal Path Details View */}
      {activeTab === 'paths' && activePathDetails && (
        <div style={{ background: 'var(--surface2)', padding: 32, borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <button onClick={() => setActivePathDetails(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', marginBottom: 16 }}>
                ← Back to Paths
              </button>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.6rem' }}>{activePathDetails.title}</h2>
              <p style={{ color: 'var(--text2)', margin: 0 }}>{activePathDetails.description}</p>
            </div>
            <button onClick={() => enrollInPath(activePathDetails.id)} style={{
                 background: 'var(--cyan)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer'
            }}>
              Start Path
            </button>
          </div>
          
          <h4 style={{ color: 'var(--cyan)', marginBottom: 16 }}>Curriculum Modules:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {activePathDetails.resources.map((pm, idx) => (
                <div key={pm.resource.id} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ background: 'var(--surface)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--cyan)', border: '1px solid var(--border)', flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <ResourceCard resource={pm.resource} inPath={true} />
                  </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Tab Content: Progress Dashboard */}
      {activeTab === 'progress' && (
        <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
          {!session?.user ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
              <Award size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>Please log in to track your learning progress and earn credentials.</p>
            </div>
          ) : (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem' }}>Your Learning Dashboard</h2>
              <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
                <div style={{ padding: 20, background: 'var(--surface2)', borderRadius: 12, flex: 1 }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--emerald)' }}>
                    {userProgress.filter(p => p.status === 'completed').length}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>Modules Completed</div>
                </div>
                <div style={{ padding: 20, background: 'var(--surface2)', borderRadius: 12, flex: 1 }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--cyan)' }}>
                    {userProgress.filter(p => p.isBookmarked).length}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>Bookmarked Resources</div>
                </div>
              </div>
              
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>In Progress & Bookmarks</h3>
              {userProgress.filter(p => p.status !== 'completed' || p.isBookmarked).length === 0 ? (
                <p style={{ color: 'var(--text3)' }}>No active courses. Check the Discover tab!</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {/* BUG-011 FIX: Use allResources (independently fetched) instead of discover-tab resources */}
                  {allResources.filter(r => userProgress.some(p => p.resourceId === r.id && (p.isBookmarked || p.status !== 'completed'))).map(r => (
                    <ResourceCard key={r.id} resource={r} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

=======
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
>>>>>>> audit-fixes-2026-04-07
    </div>
  );
};
