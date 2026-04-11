import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  Loader2,
  CheckCircle2,
  Star,
  Globe,
  Clock,
  BookMarked,
  Zap,
  Target,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Fallback resources when API is unavailable (expanded 50+ courses)
const FALLBACK_RESOURCES: Resource[] = [
  {
    id: "fb1",
    title: "Introduction to Prompt Engineering",
    provider: "DeepLearning.AI",
    level: "beginner" as const,
    durationHours: 2,
    isFree: "yes" as const,
    language: "en",
    tags: ["ai", "prompts"],
    url: "https://www.deeplearning.ai/short-courses/prompt-engineering",
  },
  {
    id: "fb2",
    title: "AI For Everyone",
    provider: "Coursera",
    level: "beginner" as const,
    durationHours: 6,
    isFree: "yes" as const,
    language: "en",
    tags: ["ai", "basics"],
    url: "https://www.coursera.org/learn/ai-for-everyone",
  },
  {
    id: "fb3",
    title: "Machine Learning Specialization",
    provider: "Stanford Online",
    level: "intermediate" as const,
    durationHours: 40,
    isFree: "audit" as const,
    language: "en",
    tags: ["ml", "ai"],
    url: "https://www.coursera.org/specializations/machine-learning-introduction",
  },
  {
    id: "fb4",
    title: "Python for Data Science",
    provider: "IBM",
    level: "beginner" as const,
    durationHours: 12,
    isFree: "yes" as const,
    language: "en",
    tags: ["python", "data"],
    url: "https://www.coursera.org/learn/python-for-data-science",
  },
  {
    id: "fb5",
    title: "AWS Cloud Practitioner",
    provider: "AWS",
    level: "beginner" as const,
    durationHours: 8,
    isFree: "yes" as const,
    language: "en",
    tags: ["aws", "cloud"],
    url: "https://aws.amazon.com/training/",
  },
  {
    id: "fb6",
    title: "Kubernetes in 3 Hours",
    provider: "Kubernetes",
    level: "intermediate" as const,
    durationHours: 3,
    isFree: "yes" as const,
    language: "en",
    tags: ["k8s", "cloud"],
    url: "https://kubernetes.io/docs/tutorials/",
  },
  {
    id: "fb7",
    title: "SQL for Data Analysis",
    provider: "Udacity",
    level: "beginner" as const,
    durationHours: 4,
    isFree: "yes" as const,
    language: "en",
    tags: ["sql", "data"],
    url: "https://www.udacity.com/course/sql-for-data-analysis",
  },
  {
    id: "fb8",
    title: "UX Design Fundamentals",
    provider: "Google",
    level: "beginner" as const,
    durationHours: 6,
    isFree: "yes" as const,
    language: "en",
    tags: ["ux", "design"],
    url: "https://www.coursera.org/learn/ux-design-fundamentals",
  },
  {
    id: "fb9",
    title: "Cybersecurity Essentials",
    provider: "Cisco",
    level: "beginner" as const,
    durationHours: 15,
    isFree: "yes" as const,
    language: "en",
    tags: ["security", "cyber"],
    url: "https://www.coursera.org/learn/cybersecurity",
  },
  {
    id: "fb10",
    title: "Data Visualization with Tableau",
    provider: "Tableau",
    level: "intermediate" as const,
    durationHours: 4,
    isFree: "yes" as const,
    language: "en",
    tags: ["viz", "tableau"],
    url: "https://www.tableau.com/learn/training",
  },
  {
    id: "fb11",
    title: "Leadership Skills",
    provider: "LinkedIn Learning",
    level: "intermediate" as const,
    durationHours: 2,
    isFree: "yes" as const,
    language: "en",
    tags: ["leadership", "management"],
    url: "https://www.linkedin.com/learning/leadership-foundations",
  },
  {
    id: "fb12",
    title: "Project Management Professional",
    provider: "PMI",
    level: "intermediate" as const,
    durationHours: 30,
    isFree: "scholarship" as const,
    language: "en",
    tags: ["pmp", "project"],
    url: "https://www.pmi.org/certifications/project-management-professional",
  },
  {
    id: "fb13",
    title: "Advanced Python Programming",
    provider: "Udemy",
    level: "advanced" as const,
    durationHours: 20,
    isFree: "no" as const,
    language: "en",
    tags: ["python", "programming"],
    url: "https://www.udemy.com/course/advanced-python-programming",
  },
  {
    id: "fb14",
    title: "SQL Database Management",
    provider: "MySQL",
    level: "intermediate" as const,
    durationHours: 8,
    isFree: "yes" as const,
    language: "en",
    tags: ["sql", "database"],
    url: "https://dev.mysql.com/doc/",
  },
  {
    id: "fb15",
    title: "React Frontend Development",
    provider: "Meta",
    level: "intermediate" as const,
    durationHours: 30,
    isFree: "audit" as const,
    language: "en",
    tags: ["react", "frontend"],
    url: "https://www.coursera.org/learn/react-front-end",
  },
  {
    id: "fb16",
    title: "Blockchain Development",
    provider: "Ethereum",
    level: "advanced" as const,
    durationHours: 25,
    isFree: "yes" as const,
    language: "en",
    tags: ["blockchain", "web3"],
    url: "https://ethereum.org/developers/",
  },
  {
    id: "fb17",
    title: "Data Structures & Algorithms",
    provider: "Harvard CS50",
    level: "intermediate" as const,
    durationHours: 35,
    isFree: "yes" as const,
    language: "en",
    tags: ["dsa", "programming"],
    url: "https://cs50.harvard.edu/",
  },
  {
    id: "fb18",
    title: "Cloud Architecture on GCP",
    provider: "Google Cloud",
    level: "advanced" as const,
    durationHours: 15,
    isFree: "yes" as const,
    language: "en",
    tags: ["gcp", "cloud"],
    url: "https://cloud.google.com/training",
  },
  {
    id: "fb19",
    title: "DevOps Engineering",
    provider: "AWS",
    level: "advanced" as const,
    durationHours: 20,
    isFree: "yes" as const,
    language: "en",
    tags: ["devops", "aws"],
    url: "https://aws.amazon.com/devops/",
  },
  {
    id: "fb20",
    title: "Mobile App Development",
    provider: "Google Flutter",
    level: "intermediate" as const,
    durationHours: 18,
    isFree: "yes" as const,
    language: "en",
    tags: ["mobile", "flutter"],
    url: "https://flutter.dev/docs",
  },
  {
    id: "fb21",
    title: "Artificial Intelligence Ethics",
    provider: "Stanford Online",
    level: "intermediate" as const,
    durationHours: 8,
    isFree: "yes" as const,
    language: "en",
    tags: ["ai", "ethics"],
    url: "https://online.stanford.edu/ai-ethics",
  },
  {
    id: "fb22",
    title: "Product Management",
    provider: "Product School",
    level: "intermediate" as const,
    durationHours: 12,
    isFree: "yes" as const,
    language: "en",
    tags: ["product", "management"],
    url: "https://productschool.com/",
  },
  {
    id: "fb23",
    title: "Technical Writing",
    provider: "Google",
    level: "beginner" as const,
    durationHours: 4,
    isFree: "yes" as const,
    language: "en",
    tags: ["writing", "documentation"],
    url: "https://developers.google.com/tech-writing",
  },
  {
    id: "fb24",
    title: "Machine Learning Engineering",
    provider: "DeepLearning.AI",
    level: "advanced" as const,
    durationHours: 45,
    isFree: "audit" as const,
    language: "en",
    tags: ["ml", "engineering"],
    url: "https://www.deeplearning.ai/learn",
  },
  {
    id: "fb25",
    title: "Cybersecurity Fundamentals",
    provider: "CompTIA",
    level: "beginner" as const,
    durationHours: 12,
    isFree: "no" as const,
    language: "en",
    tags: ["security", "comptia"],
    url: "https://www.comptia.org/training",
  },
  {
    id: "fb26",
    title: "Full Stack Web Development",
    provider: "freeCodeCamp",
    level: "beginner" as const,
    durationHours: 300,
    isFree: "yes" as const,
    language: "en",
    tags: ["web", "fullstack"],
    url: "https://www.freecodecamp.org/",
  },
  {
    id: "fb27",
    title: "Data Analysis with Excel",
    provider: "Microsoft",
    level: "beginner" as const,
    durationHours: 6,
    isFree: "yes" as const,
    language: "en",
    tags: ["excel", "data"],
    url: "https://learn.microsoft.com/excel",
  },
  {
    id: "fb28",
    title: "Business Analytics",
    provider: "Wharton",
    level: "intermediate" as const,
    durationHours: 20,
    isFree: "audit" as const,
    language: "en",
    tags: ["business", "analytics"],
    url: "https://www.coursera.org/learn/wharton-analytics",
  },
  {
    id: "fb29",
    title: "Network Security",
    provider: "Cisco",
    level: "intermediate" as const,
    durationHours: 15,
    isFree: "yes" as const,
    language: "en",
    tags: ["network", "security"],
    url: "https://www.cisco.com/c/security",
  },
  {
    id: "fb30",
    title: "Agile Project Management",
    provider: "Scrum Alliance",
    level: "beginner" as const,
    durationHours: 8,
    isFree: "yes" as const,
    language: "en",
    tags: ["agile", "scrum"],
    url: "https://www.scrumalliance.org/",
  },
  {
    id: "fb31",
    title: "UI/UX Design Principles",
    provider: "Adobe",
    level: "beginner" as const,
    durationHours: 10,
    isFree: "yes" as const,
    language: "en",
    tags: ["ui", "ux"],
    url: "https://www.adobe.com/products/xd.html",
  },
  {
    id: "fb32",
    title: "Digital Marketing Strategy",
    provider: "HubSpot",
    level: "beginner" as const,
    durationHours: 6,
    isFree: "yes" as const,
    language: "en",
    tags: ["marketing", "digital"],
    url: "https://academy.hubspot.com/",
  },
  {
    id: "fb33",
    title: "Cloud Security",
    provider: "(ISC)²",
    level: "advanced" as const,
    durationHours: 20,
    isFree: "no" as const,
    language: "en",
    tags: ["cloud", "security"],
    url: "https://www.isc2.org/",
  },
  {
    id: "fb34",
    title: "Leadership in Tech",
    provider: "LinkedIn",
    level: "intermediate" as const,
    durationHours: 4,
    isFree: "yes" as const,
    language: "en",
    tags: ["leadership", "management"],
    url: "https://www.linkedin.com/learning/leadership-in-tech",
  },
  {
    id: "fb35",
    title: "System Design",
    provider: "O'Reilly",
    level: "advanced" as const,
    durationHours: 12,
    isFree: "no" as const,
    language: "en",
    tags: ["system", "design"],
    url: "https://www.oreilly.com/",
  },
  {
    id: "fb36",
    title: "Docker & Containers",
    provider: "Docker",
    level: "intermediate" as const,
    durationHours: 8,
    isFree: "yes" as const,
    language: "en",
    tags: ["docker", "containers"],
    url: "https://docs.docker.com/",
  },
  {
    id: "fb37",
    title: "Kubernetes Administration",
    provider: "CNCF",
    level: "advanced" as const,
    durationHours: 15,
    isFree: "yes" as const,
    language: "en",
    tags: ["kubernetes", "k8s"],
    url: "https://kubernetes.io/docs/",
  },
  {
    id: "fb38",
    title: "Data Visualization with D3.js",
    provider: "D3",
    level: "advanced" as const,
    durationHours: 10,
    isFree: "yes" as const,
    language: "en",
    tags: ["d3", "visualization"],
    url: "https://d3js.org/",
  },
  {
    id: "fb39",
    title: "Python for Automation",
    provider: "Automate",
    level: "beginner" as const,
    durationHours: 8,
    isFree: "yes" as const,
    language: "en",
    tags: ["python", "automation"],
    url: "https://automatetheboringstuff.com/",
  },
  {
    id: "fb40",
    title: "Machine Learning with TensorFlow",
    provider: "Google",
    level: "advanced" as const,
    durationHours: 25,
    isFree: "yes" as const,
    language: "en",
    tags: ["tensorflow", "ml"],
    url: "https://www.tensorflow.org/learn",
  },
  {
    id: "fb41",
    title: "Cloud Computing Fundamentals",
    provider: "IBM Cloud",
    level: "beginner" as const,
    durationHours: 6,
    isFree: "yes" as const,
    language: "en",
    tags: ["cloud", "fundamentals"],
    url: "https://www.ibm.com/cloud/learn",
  },
  {
    id: "fb42",
    title: "API Design Best Practices",
    provider: "Restful",
    level: "intermediate" as const,
    durationHours: 4,
    isFree: "yes" as const,
    language: "en",
    tags: ["api", "rest"],
    url: "https://restfulapi.net/",
  },
  {
    id: "fb43",
    title: "Software Testing",
    provider: "ISTQB",
    level: "beginner" as const,
    durationHours: 8,
    isFree: "yes" as const,
    language: "en",
    tags: ["testing", "qa"],
    url: "https://www.istqb.org/",
  },
  {
    id: "fb44",
    title: "Version Control with Git",
    provider: "GitHub",
    level: "beginner" as const,
    durationHours: 3,
    isFree: "yes" as const,
    language: "en",
    tags: ["git", "version-control"],
    url: "https://docs.github.com/",
  },
  {
    id: "fb45",
    title: "Microservices Architecture",
    provider: "Spring",
    level: "advanced" as const,
    durationHours: 12,
    isFree: "yes" as const,
    language: "en",
    tags: ["microservices", "architecture"],
    url: "https://spring.io/microservices",
  },
  {
    id: "fb46",
    title: "Data Science Capstone",
    provider: "Kaggle",
    level: "intermediate" as const,
    durationHours: 15,
    isFree: "yes" as const,
    language: "en",
    tags: ["kaggle", "data-science"],
    url: "https://www.kaggle.com/",
  },
  {
    id: "fb47",
    title: "Ethical Hacking",
    provider: "EC-Council",
    level: "advanced" as const,
    durationHours: 20,
    isFree: "no" as const,
    language: "en",
    tags: ["hacking", "security"],
    url: "https://www.eccouncil.org/",
  },
  {
    id: "fb48",
    title: "Natural Language Processing",
    provider: "Hugging Face",
    level: "advanced" as const,
    durationHours: 18,
    isFree: "yes" as const,
    language: "en",
    tags: ["nlp", "ai"],
    url: "https://huggingface.co/learn",
  },
  {
    id: "fb49",
    title: "Computer Vision",
    provider: "OpenCV",
    level: "advanced" as const,
    durationHours: 20,
    isFree: "yes" as const,
    language: "en",
    tags: ["cv", "ai"],
    url: "https://opencv.org/courses/",
  },
  {
    id: "fb50",
    title: "Cloud Finance",
    provider: "FinOps",
    level: "intermediate" as const,
    durationHours: 8,
    isFree: "yes" as const,
    language: "en",
    tags: ["finops", "cloud"],
    url: "https://www.finops.org/",
  },
];

interface Resource {
  id: string;
  title: string;
  provider: string;
  level: "beginner" | "intermediate" | "advanced";
  durationHours?: number;
  isFree: "yes" | "audit" | "scholarship";
  language: string;
  languageLabel?: string;
  targetDimension?: string;
  tags?: string[];
  url?: string;
}

interface GeneratedPath {
  id: string;
  title: string;
  description: string;
  resources: {
    resource: { title: string; provider: string; level: string; url?: string };
    orderIndex: number;
    isRequired: boolean;
  }[];
}

const LEVEL_COLOR: Record<string, string> = {
  beginner: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
  intermediate: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  advanced: "text-rose-400 border-rose-500/20 bg-rose-500/5",
};

const DIM_FILTERS = [
  { key: "", label: "ALL SOURCES" },
  { key: "D1", label: "⚡ AUTOMATION" },
  { key: "D3", label: "🔄 AMPLIFICATION" },
  { key: "D6", label: "🤝 NETWORK MOAT" },
  { key: "general", label: "🌐 GENERAL" },
];

export const LearningHubPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [progress, setProgress] = useState<
    Record<string, { status: string; isBookmarked: boolean }>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [dimFilter, setDimFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "generate" | "bookmarks">(
    "all",
  );

  const [roleKeyInput, setRoleKeyInput] = useState("");
  const [generatedPath, setGeneratedPath] = useState<GeneratedPath | null>(
    null,
  );
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const urlRoleKey = location.state?.roleKey || "";
  const fetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResources = useCallback(
    async (query: string, dim: string, level: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "18" });
        if (query) params.set("q", query);
        if (dim) params.set("dimension", dim);
        if (level) params.set("level", level);
        const res = await fetch(`/api/learning/resources?${params}`);
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.data ?? []);
        setResources(items);
        setTotal(data.pagination?.total ?? items.length);
      } catch (err) {
        setResources([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-user-id": user.id,
      };
      const res = await fetch("/api/learning/progress", { headers });
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, { status: string; isBookmarked: boolean }> =
          {};
        for (const p of data.data ?? [])
          map[p.resourceId] = {
            status: p.status,
            isBookmarked: p.isBookmarked,
          };
        setProgress(map);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(
      () => fetchResources(searchQuery || urlRoleKey, dimFilter, levelFilter),
      searchQuery ? 350 : 0,
    );
    return () => {
      if (fetchTimer.current) clearTimeout(fetchTimer.current);
    };
  }, [searchQuery, dimFilter, levelFilter, urlRoleKey, fetchResources]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleMarkComplete = async (resourceId: string) => {
    if (!user) return;
    const current = progress[resourceId]?.status;
    const newStatus = current === "completed" ? "in_progress" : "completed";
    setProgress((v) => ({
      ...v,
      [resourceId]: { ...v[resourceId], status: newStatus },
    }));
    try {
      await fetch(`/api/learning/resources/${resourceId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      setProgress((v) => ({
        ...v,
        [resourceId]: { ...v[resourceId], status: current ?? "not_started" },
      }));
    }
  };

  const handleBookmark = async (resourceId: string) => {
    if (!user) return;
    const current = progress[resourceId]?.isBookmarked;
    setProgress((v) => ({
      ...v,
      [resourceId]: { ...v[resourceId], isBookmarked: !current },
    }));
    try {
      await fetch(`/api/learning/resources/${resourceId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({ isBookmarked: !current }),
      });
    } catch {}
  };

  const handleGeneratePath = async () => {
    const roleKey = roleKeyInput.trim() || urlRoleKey || "software_engineer";
    setGenerating(true);
    setGenerateError("");
    setGeneratedPath(null);
    try {
      const res = await fetch("/api/learning-paths/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setGeneratedPath(data.data ?? data);
    } catch (e: any) {
      setGenerateError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page-wrap" style={{ background: "var(--bg)" }}>
      <div className="container" style={{ maxWidth: 1280 }}>
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16 px-2">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
              Resilience Node
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">
              ADAPTATION <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 italic">
                REPOSITORY
              </span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md">
              Curated intelligence for high-density human skills — leadership,
              empathy, and strategic synthesis.
            </p>
          </div>

          {user && (
            <div className="flex gap-6 lg:gap-10">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                  Absorbed
                </div>
                <div className="text-3xl font-black tracking-tighter">
                  {
                    Object.values(progress).filter(
                      (p) => p.status === "completed",
                    ).length
                  }
                </div>
              </div>
              <div className="w-px h-12 bg-white/5" />
              <div className="space-y-1">
                <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                  Bookmarked
                </div>
                <div className="text-3xl font-black tracking-tighter text-cyan-400">
                  {Object.values(progress).filter((p) => p.isBookmarked).length}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cyber Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-full mb-12 w-fit no-scrollbar">
          {[
            { key: "all", icon: BookOpen, label: "DATABASE" },
            { key: "generate", icon: Sparkles, label: "AI PATH" },
            { key: "bookmarks", icon: BookMarked, label: "SAVED" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === key
                  ? "bg-white text-black shadow-xl"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>

        {/* ── SEARCH & FILTERS ── */}
        {activeTab === "all" && (
          <div className="space-y-8 mb-16">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400" />
              <input
                type="text"
                placeholder="SCAN://LEADERSHIP_EMPATHY_STRATEGY_SYNTHESIS"
                className="w-full bg-white/[0.02] border border-white/5 rounded-full py-5 pl-16 pr-6 focus:outline-none focus:border-cyan-500/30 text-xs font-black tracking-widest text-white placeholder-slate-700 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {DIM_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setDimFilter(dimFilter === f.key ? "" : f.key)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black border transition-all ${
                    dimFilter === f.key
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                      : "bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── RESOURCE GRID ── */}
        {activeTab === "all" &&
          (loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-64 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="card group reveal flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span
                      className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${LEVEL_COLOR[resource.level]}`}
                    >
                      {resource.level}
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleBookmark(resource.id)}
                        className={`transition-colors ${progress[resource.id]?.isBookmarked ? "text-amber-400" : "text-slate-700 hover:text-slate-400"}`}
                      >
                        <Star
                          className="w-4 h-4"
                          fill={
                            progress[resource.id]?.isBookmarked
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                      {user && (
                        <button
                          onClick={() => handleMarkComplete(resource.id)}
                          className={`transition-colors ${progress[resource.id]?.status === "completed" ? "text-emerald-400" : "text-slate-700 hover:text-emerald-400"}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                    {resource.title}
                  </h3>
                  <p className="text-slate-600 text-[10px] mb-8 font-black uppercase tracking-widest">
                    {resource.provider}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex gap-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                      {resource.durationHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {resource.durationHours}
                          H
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />{" "}
                        {resource.language.toUpperCase()}
                      </span>
                    </div>
                    <a
                      href={resource.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      ACCESS →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* ── AI PATH GENERATOR ── */}
        {activeTab === "generate" && (
          <div className="max-w-3xl mx-auto reveal">
            <div className="card !p-12 mb-12">
              <div className="flex items-center gap-4 mb-8">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">
                  AI AGENTIC PATHWAY
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 block mb-3">
                    Target Occupational Key
                  </label>
                  <input
                    type="text"
                    value={roleKeyInput || urlRoleKey}
                    onChange={(e) => setRoleKeyInput(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-800"
                    placeholder="ROLE://SOFTWARE_ARCHITECT"
                  />
                </div>
                {generateError && (
                  <div className="text-xs font-bold text-rose-500 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                    ERROR: {generateError}
                  </div>
                )}
                <button
                  onClick={handleGeneratePath}
                  disabled={generating}
                  className="btn-primary w-full py-5 disabled:opacity-50"
                >
                  {generating ? (
                    <>INITIALIZING SYTHESIS...</>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> GENERATE PATHWAY
                    </>
                  )}
                </button>
              </div>
            </div>

            {generatedPath && (
              <div className="card reveal !bg-cyan-500/[0.02] !border-cyan-500/10 h-max">
                <div className="flex items-center gap-4 mb-8">
                  <Target className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-black">{generatedPath.title}</h3>
                </div>
                <div className="space-y-3">
                  {generatedPath.resources.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-5 bg-black/40 rounded-2xl border border-white/5 group"
                    >
                      <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[10px] font-black">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs font-black text-white uppercase tracking-wider">
                          {item.resource.title}
                        </div>
                        <div className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">
                          {item.resource.provider} · {item.resource.level}
                        </div>
                      </div>
                      <a
                        href={item.resource.url}
                        target="_blank"
                        className="text-[10px] font-black text-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity"
                      >
                        ACCESS
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
