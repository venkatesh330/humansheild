import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  TrendingUp,
  DollarSign,
  Briefcase,
  Brain,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  MapPin,
  Clock,
} from "lucide-react";

interface CareerDetail {
  id: string;
  title: string;
  sector: string;
  risk_score: number;
  growth_rate: string;
  avg_salary: number;
  human_factor: number;
  ai_resistance: "Critical" | "Very High" | "High";
  why_safe: string;
  skills: string[];
  description?: string;
  entry_requirements?: string;
  growth_trajectory?: string;
  key_strengths?: string[];
  ai_impact_detail?: string;
  salary_range_low?: number;
  salary_range_high?: number;
  job_outlook?: string;
}

const RESISTANCE_CONFIG: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  Critical: {
    color: "var(--cyan)",
    bg: "var(--cyan-dim)",
    label: "Critical AI Resistance",
  },
  "Very High": {
    color: "var(--emerald)",
    bg: "var(--emerald-dim)",
    label: "Very High AI Resistance",
  },
  High: {
    color: "#818cf8",
    bg: "var(--violet-dim)",
    label: "High AI Resistance",
  },
};

// Fallback career data for offline mode
const FALLBACK_CAREERS: CareerDetail[] = [
  {
    id: "1",
    title: "Cybersecurity Analyst",
    sector: "Technology",
    risk_score: 8,
    growth_rate: "+32%",
    avg_salary: 112000,
    human_factor: 92,
    ai_resistance: "Critical",
    why_safe:
      "Zero-sum offense/defense game; AI cannot anticipate novel attack vectors",
    skills: ["Threat Hunting", "Incident Response", "Security Architecture"],
    description:
      "Protects organizations from cyber threats through threat hunting, incident response, and security architecture design.",
    entry_requirements:
      "Bachelor's in CS/IT + Security certifications (CISSP, CEH)",
    growth_trajectory:
      "Rapid growth as attacks evolve; 32% projected over 10 years",
    key_strengths: [
      "Continuous Learning",
      "Problem Solving",
      "Technical Depth",
    ],
    ai_impact_detail:
      "AI augments detection but cannot replace strategic security thinking",
    salary_range_low: 85000,
    salary_range_high: 145000,
    job_outlook: "Excellent",
  },
  {
    id: "2",
    title: "Registered Nurse",
    sector: "Healthcare",
    risk_score: 5,
    growth_rate: "+6%",
    avg_salary: 82600,
    human_factor: 95,
    ai_resistance: "Critical",
    why_safe:
      "Hands-on patient care requires human touch and real-time clinical judgment",
    skills: ["Patient Assessment", "Clinical Decision Making"],
    description:
      "Provides direct patient care, administers medications, and coordinates with healthcare teams.",
    entry_requirements: "RN license (ASN/BSN), NCLEX-RN",
    growth_trajectory: "Steady 6% growth; aging population drives demand",
    key_strengths: ["Empathy", "Physical Stamina", "Critical Thinking"],
    ai_impact_detail:
      "AI assistants help documentation but cannot replace bedside care",
    salary_range_low: 65000,
    salary_range_high: 110000,
    job_outlook: "Excellent",
  },
  {
    id: "3",
    title: "Mental Health Counselor",
    sector: "Healthcare",
    risk_score: 3,
    growth_rate: "+15%",
    avg_salary: 52400,
    human_factor: 97,
    ai_resistance: "Critical",
    why_safe:
      "Deep emotional intelligence and therapeutic rapport cannot be replicated",
    skills: ["Therapeutic Techniques", "Crisis Intervention"],
    description:
      "Helps clients navigate emotional and mental health challenges through talk therapy.",
    entry_requirements: "Master's in Counseling/Psychology + State License",
    growth_trajectory: "15% growth; destigmatization increases demand",
    key_strengths: ["Empathy", "Active Listening", "Boundaries"],
    ai_impact_detail: "AI chatbots cannot replicate therapeutic alliance",
    salary_range_low: 42000,
    salary_range_high: 85000,
    job_outlook: "Excellent",
  },
  {
    id: "4",
    title: "Special Education Teacher",
    sector: "Education",
    risk_score: 6,
    growth_rate: "+4%",
    avg_salary: 64000,
    human_factor: 94,
    ai_resistance: "Critical",
    why_safe: "Individualized accommodation require human judgment",
    skills: ["IEP Development", "Behavioral Support"],
    description:
      "Teaches students with disabilities using individualized education plans.",
    entry_requirements: "Bachelor's in Special Ed + State Teaching License",
    growth_trajectory: "Moderate growth; demand for inclusion specialists",
    key_strengths: ["Patience", "Creativity", "Advocacy"],
    ai_impact_detail: "AI cannot adapt to individual behavioral needs",
    salary_range_low: 50000,
    salary_range_high: 85000,
    job_outlook: "Good",
  },
  {
    id: "5",
    title: "Physical Therapist",
    sector: "Healthcare",
    risk_score: 7,
    growth_rate: "+17%",
    avg_salary: 97000,
    human_factor: 93,
    ai_resistance: "Critical",
    why_safe: "Manual therapy requires physical embodiment",
    skills: ["Manual Therapy", "Movement Analysis"],
    description:
      "Helps patients recover movement and function through exercises and manual therapy.",
    entry_requirements: "Doctor of Physical Therapy (DPT) + State License",
    growth_trajectory: "Strong 17% growth; aging population",
    key_strengths: ["Manual Dexterity", "Patience", "Motivation"],
    ai_impact_detail: "AI cannot perform manual interventions",
    salary_range_low: 75000,
    salary_range_high: 130000,
    job_outlook: "Excellent",
  },
  {
    id: "6",
    title: "AI Ethics Officer",
    sector: "Technology",
    risk_score: 15,
    growth_rate: "+45%",
    avg_salary: 145000,
    human_factor: 85,
    ai_resistance: "Very High",
    why_safe: "Governance and bias auditing require human accountability",
    skills: ["AI Governance", "Bias Auditing"],
    description: "Ensures AI systems are fair, transparent, and compliant.",
    entry_requirements: "Bachelor's in CS/Phil/Policy + AI experience",
    growth_trajectory: "Explosive 45% growth",
    key_strengths: ["Ethics", "Policy Knowledge", "Technical Understanding"],
    ai_impact_detail: "Human accountability cannot be delegated to AI",
    salary_range_low: 120000,
    salary_range_high: 180000,
    job_outlook: "Excellent",
  },
  {
    id: "7",
    title: "Social Worker",
    sector: "Healthcare",
    risk_score: 18,
    growth_rate: "+9%",
    avg_salary: 58000,
    human_factor: 82,
    ai_resistance: "Very High",
    why_safe: "Case management and advocacy require deep human empathy",
    skills: ["Case Management", "Advocacy"],
    description:
      "Connects clients with resources and supports them through crises.",
    entry_requirements: "Bachelor's/MSW + State License",
    growth_trajectory: "Steady 9% growth",
    key_strengths: ["Empathy", "Advocacy", "Resourcefulness"],
    ai_impact_detail: "AI cannot replicate emotional labor",
    salary_range_low: 45000,
    salary_range_high: 78000,
    job_outlook: "Good",
  },
  {
    id: "8",
    title: "Electrician",
    sector: "Trades",
    risk_score: 12,
    growth_rate: "+6%",
    avg_salary: 61000,
    human_factor: 88,
    ai_resistance: "Very High",
    why_safe: "Installation and troubleshooting require physical presence",
    skills: ["Electrical Installation", "Troubleshooting"],
    description: "Installs and repairs electrical systems.",
    entry_requirements: "Apprenticeship + State License",
    growth_trajectory: "Steady 6% growth",
    key_strengths: ["Problem Solving", "Physical Work", "Safety Mindset"],
    ai_impact_detail: "AI cannot work on live systems",
    salary_range_low: 45000,
    salary_range_high: 85000,
    job_outlook: "Good",
  },
  {
    id: "9",
    title: "Plumber",
    sector: "Trades",
    risk_score: 11,
    growth_rate: "+5%",
    avg_salary: 64000,
    human_factor: 89,
    ai_resistance: "Very High",
    why_safe: "Pipe fitting requires manual dexterity",
    skills: ["Pipe Fitting", "Diagnostic Skills"],
    description: "Installs and repairs plumbing systems.",
    entry_requirements: "Apprenticeship + State License",
    growth_trajectory: "Steady 5% growth",
    key_strengths: ["Problem Solving", "Manual Dexterity", "Customer Skills"],
    ai_impact_detail: "AI cannot access pipes physically",
    salary_range_low: 48000,
    salary_range_high: 90000,
    job_outlook: "Good",
  },
  {
    id: "10",
    title: "HVAC Technician",
    sector: "Trades",
    risk_score: 14,
    growth_rate: "+4%",
    avg_salary: 56000,
    human_factor: 86,
    ai_resistance: "Very High",
    why_safe: "System installation requires physical presence",
    skills: ["System Installation", "Refrigeration"],
    description: "Installs and maintains heating/cooling systems.",
    entry_requirements: "EPA 608 + HVAC certification",
    growth_trajectory: "4% growth; HVAC essential",
    key_strengths: ["Technical Skills", "Physical Work", "Problem Solving"],
    ai_impact_detail: "AI cannot handle refrigerants",
    salary_range_low: 40000,
    salary_range_high: 78000,
    job_outlook: "Good",
  },
  {
    id: "11",
    title: "Pilot",
    sector: "Transportation",
    risk_score: 18,
    growth_rate: "+5%",
    avg_salary: 160000,
    human_factor: 82,
    ai_resistance: "Very High",
    why_safe: "Aircraft command requires human decision-making",
    skills: ["Flight Operations", "Emergency Response"],
    description: "Commands aircraft and ensures passenger safety.",
    entry_requirements: "Commercial Pilot License + ATP",
    growth_trajectory: "5% growth; essential role",
    key_strengths: ["Decision Making", "Leadership", "Pressure Handling"],
    ai_impact_detail: "AI assists but cannot be legally responsible",
    salary_range_low: 120000,
    salary_range_high: 250000,
    job_outlook: "Good",
  },
  {
    id: "12",
    title: "Attorney",
    sector: "Legal",
    risk_score: 28,
    growth_rate: "+4%",
    avg_salary: 145000,
    human_factor: 72,
    ai_resistance: "Very High",
    why_safe: "Courtroom advocacy requires human judgment",
    skills: ["Legal Strategy", "Litigation"],
    description: "Represents clients in legal matters.",
    entry_requirements: "JD + State Bar",
    growth_trajectory: "4% growth; essential function",
    key_strengths: ["Argumentation", "Research", "Client Relations"],
    ai_impact_detail: "AI cannot replace courtroom presence",
    salary_range_low: 110000,
    salary_range_high: 250000,
    job_outlook: "Good",
  },
  {
    id: "13",
    title: "Data Scientist",
    sector: "Technology",
    risk_score: 45,
    growth_rate: "+36%",
    avg_salary: 130000,
    human_factor: 55,
    ai_resistance: "High",
    why_safe: "Model interpretation requires human context",
    skills: ["Statistical Analysis", "ML Modeling"],
    description: "Extracts insights from data.",
    entry_requirements: "Bachelor's in Stats/CS + Python/R",
    growth_trajectory: "36% growth",
    key_strengths: ["Business Acumen", "Technical Depth", "Communication"],
    ai_impact_detail: "AI assists but cannot interpret business context",
    salary_range_low: 95000,
    salary_range_high: 200000,
    job_outlook: "Good",
  },
  {
    id: "14",
    title: "Product Manager",
    sector: "Technology",
    risk_score: 42,
    growth_rate: "+20%",
    avg_salary: 140000,
    human_factor: 58,
    ai_resistance: "High",
    why_safe: "Strategic roadmap requires human synthesis",
    skills: ["Product Strategy", "User Research"],
    description: "Leads product strategy.",
    entry_requirements: "Bachelor's + Product experience",
    growth_trajectory: "20% growth",
    key_strengths: ["Strategic Thinking", "User Empathy", "Leadership"],
    ai_impact_detail: "AI cannot replace human intuition",
    salary_range_low: 110000,
    salary_range_high: 200000,
    job_outlook: "Good",
  },
  {
    id: "15",
    title: "UX Researcher",
    sector: "Technology",
    risk_score: 40,
    growth_rate: "+25%",
    avg_salary: 105000,
    human_factor: 60,
    ai_resistance: "High",
    why_safe: "Qualitative insights require human connection",
    skills: ["User Interviews", "Usability Testing"],
    description: "Researches user needs.",
    entry_requirements: "Bachelor's in HCI/Psych + Research methods",
    growth_trajectory: "25% growth",
    key_strengths: ["Empathy", "Qualitative Skills", "Communication"],
    ai_impact_detail: "AI cannot replicate human connection",
    salary_range_low: 80000,
    salary_range_high: 155000,
    job_outlook: "Good",
  },
  {
    id: "16",
    title: "HR Business Partner",
    sector: "People Ops",
    risk_score: 32,
    growth_rate: "+8%",
    avg_salary: 85000,
    human_factor: 68,
    ai_resistance: "High",
    why_safe: "Employee relations require emotional intelligence",
    skills: ["Employee Relations", "Conflict Resolution"],
    description: "Strategic HR partner.",
    entry_requirements: "Bachelor's in HR + SHRM-CP",
    growth_trajectory: "8% growth",
    key_strengths: [
      "Emotional Intelligence",
      "Communication",
      "Problem Solving",
    ],
    ai_impact_detail: "AI cannot resolve conflicts",
    salary_range_low: 65000,
    salary_range_high: 130000,
    job_outlook: "Good",
  },
  {
    id: "17",
    title: "Cloud Solutions Architect",
    sector: "Technology",
    risk_score: 42,
    growth_rate: "+25%",
    avg_salary: 155000,
    human_factor: 58,
    ai_resistance: "High",
    why_safe: "System design requires architectural judgment",
    skills: ["System Architecture", "Cloud Strategy"],
    description: "Designs cloud solutions.",
    entry_requirements: "Bachelor's + AWS/Azure/GCP certs",
    growth_trajectory: "25% growth",
    key_strengths: ["Technical Depth", "Strategic Thinking", "Cost Awareness"],
    ai_impact_detail: "AI cannot design architectures",
    salary_range_low: 120000,
    salary_range_high: 220000,
    job_outlook: "Good",
  },
  {
    id: "18",
    title: "Financial Advisor",
    sector: "Finance",
    risk_score: 35,
    growth_rate: "+7%",
    avg_salary: 95000,
    human_factor: 65,
    ai_resistance: "High",
    why_safe: "Wealth planning requires fiduciary trust",
    skills: ["Wealth Planning", "Risk Assessment"],
    description: "Provides financial advice.",
    entry_requirements: "CFP certification + Series 65",
    growth_trajectory: "7% growth",
    key_strengths: ["Trust Building", "Technical Knowledge", "Communication"],
    ai_impact_detail: "AI cannot replace fiduciary relationship",
    salary_range_low: 70000,
    salary_range_high: 150000,
    job_outlook: "Good",
  },
  {
    id: "19",
    title: "Marketing Director",
    sector: "Marketing",
    risk_score: 38,
    growth_rate: "+10%",
    avg_salary: 135000,
    human_factor: 62,
    ai_resistance: "High",
    why_safe: "Brand strategy requires human intuition",
    skills: ["Brand Strategy", "Creative Leadership"],
    description: "Leads marketing strategy.",
    entry_requirements: "Bachelor's in Marketing + MBA preferred",
    growth_trajectory: "10% growth",
    key_strengths: ["Creativity", "Leadership", "Strategic Thinking"],
    ai_impact_detail: "AI cannot lead creatively",
    salary_range_low: 100000,
    salary_range_high: 220000,
    job_outlook: "Good",
  },
  {
    id: "20",
    title: "Machine Learning Operations Engineer",
    sector: "Technology",
    risk_score: 48,
    growth_rate: "+45%",
    avg_salary: 145000,
    human_factor: 52,
    ai_resistance: "High",
    why_safe: "ML pipeline orchestration requires operational expertise",
    skills: ["MLOps", "Pipeline Orchestration"],
    description: "Operates ML systems at scale.",
    entry_requirements: "Bachelor's + MLOps experience",
    growth_trajectory: "45% growth",
    key_strengths: ["Operations", "Infrastructure", "Automation"],
    ai_impact_detail: "AI cannot operate itself",
    salary_range_low: 110000,
    salary_range_high: 200000,
    job_outlook: "Good",
  },
];

export const CareerDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [career, setCareer] = useState<CareerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareer = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/safe-careers`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const found = data.find(
          (c: CareerDetail) =>
            c.id === id || c.title?.toLowerCase().replace(/\s+/g, "-") === id,
        );
        if (found) {
          setCareer(found);
        } else {
          // Try fallback
          const fallbackFound = FALLBACK_CAREERS.find(
            (c) =>
              c.id === id || c.title?.toLowerCase().replace(/\s+/g, "-") === id,
          );
          if (fallbackFound) {
            setCareer(fallbackFound);
          } else {
            setError("Career not found");
          }
        }
      } catch (err) {
        // Use fallback on error
        const fallbackFound = FALLBACK_CAREERS.find(
          (c) =>
            c.id === id || c.title?.toLowerCase().replace(/\s+/g, "-") === id,
        );
        if (fallbackFound) {
          setCareer(fallbackFound);
        } else {
          setError("Failed to load career data");
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCareer();
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrap" style={{ background: "var(--bg)" }}>
        <div
          className="container"
          style={{ padding: "120px 24px", textAlign: "center" }}
        >
          <div
            className="skeleton"
            style={{ height: 400, maxWidth: 800, margin: "0 auto" }}
          />
        </div>
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="page-wrap" style={{ background: "var(--bg)" }}>
        <div
          className="container"
          style={{ padding: "120px 24px", textAlign: "center" }}
        >
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>🔍</div>
          <h2 style={{ marginBottom: 8 }}>Career Not Found</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 24 }}>
            {error || "This career is not in our database"}
          </p>
          <Link to="/safe-careers" className="btn btn-premium">
            View All Safe Careers
          </Link>
        </div>
      </div>
    );
  }

  const config =
    RESISTANCE_CONFIG[career.ai_resistance] || RESISTANCE_CONFIG["High"];
  const salaryLow =
    career.salary_range_low || Math.floor(career.avg_salary * 0.8);
  const salaryHigh =
    career.salary_range_high || Math.floor(career.avg_salary * 1.2);

  return (
    <div className="page-wrap" style={{ background: "var(--bg)" }}>
      <div className="container">
        {/* Back Navigation */}
        <Link
          to="/safe-careers"
          className="reveal"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--text-2)",
            marginTop: 32,
            marginBottom: 24,
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          Back to Safe Careers
        </Link>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <span
              className="badge"
              style={{
                color: config.color,
                background: config.bg,
                borderColor: `${config.color}33`,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {config.label}
            </span>
            <span className="badge badge-ghost" style={{ fontSize: "0.75rem" }}>
              {career.sector}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            {career.title}
          </h1>

          <p
            style={{
              color: "var(--text-2)",
              fontSize: "1.1rem",
              maxWidth: 640,
              lineHeight: 1.6,
            }}
          >
            {career.description || career.why_safe}
          </p>
        </div>

        {/* Key Stats Grid */}
        <div
          className="reveal"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div className="card" style={{ padding: 24 }}>
            <div
              style={{
                color: "var(--text-2)",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Risk Score
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: config.color,
                }}
              >
                {career.risk_score || 100 - career.human_factor}
              </span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>
                /100
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div
              style={{
                color: "var(--text-2)",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Median Salary
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2.5rem",
                  fontWeight: 800,
                }}
              >
                ${(career.avg_salary / 1000).toFixed(0)}k
              </span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>
                /yr
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div
              style={{
                color: "var(--text-2)",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Growth
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: "var(--emerald)",
                }}
              >
                +{career.growth_rate?.replace("%", "") || 10}%
              </span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>
                /10yr
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div
              style={{
                color: "var(--text-2)",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Job Outlook
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  fontWeight: 800,
                  color:
                    career.job_outlook === "Excellent"
                      ? "var(--emerald)"
                      : career.job_outlook === "Good"
                        ? "var(--cyan)"
                        : "var(--yellow)",
                }}
              >
                {career.job_outlook || "Good"}
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            marginBottom: 48,
          }}
        >
          {/* Left Column */}
          <div>
            {/* Why This Role is Safe */}
            <div
              className="reveal card"
              style={{ padding: 32, marginBottom: 24 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <Shield size={20} color="var(--cyan)" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Why This Role is AI-Resistant
                </h2>
              </div>
              <p
                style={{
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                }}
              >
                {career.why_safe}
              </p>
              {career.ai_impact_detail && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 16,
                    background: "rgba(0,245,255,0.05)",
                    borderRadius: 8,
                    border: "1px solid rgba(0,245,255,0.1)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--cyan)",
                      fontWeight: 500,
                    }}
                  >
                    🤖 AI Impact: {career.ai_impact_detail}
                  </p>
                </div>
              )}
            </div>

            {/* Skills Required */}
            <div
              className="reveal card"
              style={{ padding: 32, marginBottom: 24 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <Brain size={20} color="var(--violet)" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Key Skills
                </h2>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {career.skills?.map((skill, i) => (
                  <span
                    key={i}
                    className="badge badge-ghost"
                    style={{ padding: "8px 14px", fontSize: "0.8rem" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {career.key_strengths && (
                <div style={{ marginTop: 20 }}>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-3)",
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Core Strengths
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {career.key_strengths.map((strength, i) => (
                      <span
                        key={i}
                        className="badge"
                        style={{
                          background: "var(--violet-dim)",
                          color: "#a78bfa",
                          borderColor: "var(--violet)",
                          fontSize: "0.75rem",
                        }}
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Entry Requirements */}
            <div
              className="reveal card"
              style={{ padding: 32, marginBottom: 24 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <Briefcase size={20} color="var(--emerald)" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Entry Requirements
                </h2>
              </div>
              <p
                style={{
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                }}
              >
                {career.entry_requirements ||
                  "Bachelor's degree + relevant certifications"}
              </p>
            </div>

            {/* Salary Range */}
            <div
              className="reveal card"
              style={{ padding: 32, marginBottom: 24 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <DollarSign size={20} color="var(--yellow)" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Salary Range
                </h2>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2rem",
                    fontWeight: 800,
                  }}
                >
                  ${(salaryLow / 1000).toFixed(0)}k
                </span>
                <span style={{ color: "var(--text-3)" }}>—</span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2rem",
                    fontWeight: 800,
                  }}
                >
                  ${(salaryHigh / 1000).toFixed(0)}k
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-3)",
                  marginTop: 8,
                }}
              >
                Entry to senior level • Location and experience dependent
              </p>
            </div>

            {/* Growth Trajectory */}
            <div
              className="reveal card"
              style={{ padding: 32, marginBottom: 24 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <TrendingUp size={20} color="var(--cyan)" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Growth Trajectory
                </h2>
              </div>
              <p
                style={{
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                }}
              >
                {career.growth_trajectory ||
                  `${career.growth_rate?.replace("%", "") || 10}% projected growth over 10 years`}
              </p>
              <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
                <div
                  style={{
                    flex: 1,
                    padding: 16,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 8,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-3)",
                      marginBottom: 4,
                    }}
                  >
                    Now
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                    }}
                  >
                    ${(career.avg_salary / 1000).toFixed(0)}k
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: 16,
                    background: "rgba(0,245,255,0.05)",
                    borderRadius: 8,
                    textAlign: "center",
                    border: "1px solid rgba(0,245,255,0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--cyan)",
                      marginBottom: 4,
                    }}
                  >
                    +5 Years
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: "var(--cyan)",
                    }}
                  >
                    ${((career.avg_salary * 1.25) / 1000).toFixed(0)}k
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: 16,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 8,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-3)",
                      marginBottom: 4,
                    }}
                  >
                    +10 Years
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                    }}
                  >
                    ${((career.avg_salary * 1.5) / 1000).toFixed(0)}k
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div
          className="reveal"
          style={{
            padding: 32,
            background:
              "linear-gradient(135deg, rgba(0,245,255,0.05) 0%, rgba(139,92,246,0.05) 100%)",
            borderRadius: 16,
            border: "1px solid rgba(0,245,255,0.1)",
            marginBottom: 80,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Ready to explore more AI-resistant careers?
              </h3>
              <p style={{ color: "var(--text-2)", fontSize: "0.95rem" }}>
                View our complete list of {career.sector} roles and transition
                strategies.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Link
                to="/tools"
                className="btn btn-ghost"
                style={{ padding: "14px 24px" }}
              >
                Skill Assessment
              </Link>
              <Link
                to="/safe-careers"
                className="btn btn-premium"
                style={{ padding: "14px 24px" }}
              >
                View All Careers
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDetailPage;
