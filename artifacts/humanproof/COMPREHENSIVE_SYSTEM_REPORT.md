# HumanProof: Comprehensive System Report
## AI Job Displacement Intelligence Platform

**Version:** 2026 Q1  
**Architecture:** React 18 + Vite + Express.js  
**Data Foundation:** McKinsey 2025 | WEF 2025 | Goldman Sachs 2026 | Anthropic | OpenAI | Google  

---

## 📋 EXECUTIVE SUMMARY

HumanProof is a **5-dimension weighted risk assessment platform** that calculates AI displacement risk for any job, skill, or career portfolio. It combines:
- **228 verified skills** with 2026-calibrated risk scores
- **250+ job roles** with industry-specific multipliers
- **Real-time projections** for 1/3/5-year risk trajectories
- **Personalized upskilling roadmaps** with 50+ accredited courses

**Core Value Proposition:** Not just "your job is at risk" — but "here's exactly what to do about it"

---

## 🏗️ SYSTEM ARCHITECTURE

```
HumanProof Platform
├── Frontend (React 18 + Vite)
│   ├── Pages (5 main entry points)
│   ├── Components (12+ specialized tools)
│   ├── Context API (Global state management)
│   ├── Local Storage (Client-side persistence)
│   └── Utilities (Risk calculations, exports)
├── Backend (Express.js)
│   ├── /api/assessments (Store + retrieve assessments)
│   ├── /api/digest (Email digest service)
│   └── PostgreSQL (When deployed)
└── Data Layer
    ├── skillsDataNew.ts (228 skills with 2026 calibration)
    ├── courseDatabase.ts (50+ curated courses per skill)
    ├── jobRoleDatabase.ts (250+ jobs)
    └── Risk deltas & industry multipliers
```

---

# 📑 ALL PAGES & FEATURES

## PAGE 1: HOME PAGE
**File:** `src/pages/HomePage.tsx`  
**Route:** `/`  
**Purpose:** Landing page that converts visitors to tool usage

### 🎨 UI Components
- **Hero Section**
  - Animated geometric orbs (cyberpunk background)
  - Main headline: "Is Your Career AI-Resistant Enough?"
  - Subheading: "Built on 2026 data from 8 research institutions"
  - CTA buttons: "Calculate My Risk" & "View Resources"

- **Hero Stats Display**
  ```
  4.8B+ Workers Analyzed
  1.8yr Average Timeline to Displacement
  250+ Jobs Analyzed
  5-D Risk Model
  ```

- **Stat Band Section**
  - 3 key statistics with citations:
    - 300M+ jobs exposed (Goldman Sachs 2026)
    - 40% of work automatable (McKinsey Jan 2026)
    - $4.4T productivity gain (BCG Dec 2025)

### 📊 5-Dimension Risk Model Explanation
The page educates about the formula:

| Dimension | Weight | Description | Source |
|-----------|--------|-------------|--------|
| D1: Task Automatability | 30% | Current AI capability on enterprise deployment | Anthropic Q1 2026 |
| D2: AI Tool Maturity | 20% | Production readiness & reliability | OpenAI, Google Q1 2026 |
| D3: Augmentation Potential | 22% | Inverted: AI amplifying creates safety | Anthropic, McKinsey |
| D4: Experience Shield | 18% | Seniority protection by role | WEF, LinkedIn data |
| D5: Country Context | 10% | Geographic risk variation | WEF, World Bank |

### Data Flow
```
User lands on homepage
→ Reads headline + social proof
→ Clicks "Calculate My Risk"
→ Navigates to CalculatorPage
→ No data persistence at this stage
```

---

## PAGE 2: CALCULATOR PAGE (Job Risk Assessment)
**File:** `src/pages/CalculatorPage.tsx`  
**Route:** `/calculator`  
**Purpose:** Assess risk for a specific job role

### Feature: Job Selection & Risk Calculation

**UI Workflow:**
1. **Industry Selector** - 11 industries
   - Finance, Technology, Healthcare, Legal, Marketing, Creative, Education, Analytics, Sales, People Ops, Other

2. **Job Role Search** - 250+ jobs
   - Real-time filtering by name
   - Shows top 60 results
   - Each job shows: name, industry, baseline risk score

3. **Risk Score Display**
   - Large cyan-colored risk number (0-99)
   - Color-coded label: Safe (0-30) | Moderate (31-60) | At Risk (61-99)
   - Includes trend indicator (↑ rising, → stable, ↓ declining)

### 🧮 Risk Calculation Logic (Job Risk)

```typescript
// Step 1: Base job risk from database (McKinsey 2025)
baseJobRisk = jobDatabase[jobId].riskScore  // 0-99

// Step 2: Apply 5-dimension formula
D1_taskAutomatability = baseJobRisk * 0.30
D2_aiToolMaturity = (baseJobRisk - 15) * 0.20  // Tools slightly less mature
D3_augmentationFlip = (100 - baseJobRisk) * 0.22  // Inverted
D4_experienceShield = yearsExperience * roleExperienceFactor * 0.18
D5_countryContext = geoRiskMultiplier * 0.10

// Step 3: Weight and aggregate
finalRiskScore = D1 + D2 + D3 + D4 + D5
finalRiskScore = Math.min(99, Math.max(3, finalRiskScore))

// Step 4: Clamp percentiles to realistic ranges
// No job is >99% automatable (legal, healthcare reasons)
// No job is <3% (some AI exposure exists everywhere)
```

### 📈 Data Structures

```typescript
interface JobRole {
  id: string
  name: string
  industry: string
  baseRiskScore: number  // 0-99, from 2025 research
  description: string
  trend: 'rising' | 'stable' | 'declining'
  avgDisplacementYears: number  // e.g., 1.8
  affectedWorkers: number
}

interface AssessmentState {
  jobRiskScore: number | null
  jobTitle: string | null
  jobId: string | null
  industry: string | null
  assessmentTimestamp: number
}
```

### 💾 Persistence
- Saved to `localStorage` key: `hp_scores` (history)
- Also saved to `Context` (Redux-like pattern)
- Optional backend sync to `/api/assessments`

### Features
- **Share Score**: Export JSON snapshot or generate shareable link
- **Action Timeline**: "You have ~1.8 years before critical risk"
- **View Insights**: Industry-specific risk factors

---

## PAGE 3: TOOLS PAGE (6 Assessment Tools)
**File:** `src/pages/ToolsPage.tsx`  
**Route:** `/tools`  
**Purpose:** Integrated dashboard with 6 specialized risk assessment tools

### 🔧 Tab 1: Skill Risk Calculator
**Component:** `src/components/SkillRiskCalculator.tsx`

**Data Available:**
- **228 verified skills** (from skillsDataNew.ts)
- Categories: Technical, Creative, Interpersonal, Analytical, Science, Management, Healthcare, Legal, Finance
- Each skill includes: name, category, risk score (0-99), trend

**UI Workflow:**
```
1. User sees heading: "Search from 228 verified skills"
2. Search bar with placeholder: "Search 228 skills by name or category..."
3. Real-time filtering: both by skill name AND category
4. Shows up to 50 results in dropdown
5. User adds skills (max 50)
6. Each skill shows weight selector: 0.5x | 1x | 2x
7. Weighted calculation displays result
8. Shows year 2027, 2029, 2031 projections
```

**🧮 Skill Risk Calculation:**

```typescript
// For database skills
skillRisk = skillsDataNew[skillId].riskScore

// For custom skills (3-layer scoring)
function scoreCustomSkill(name: string, industry?: string): number {
  // Layer 1: Protective skills with tech-sounding names
  if (name.includes('ai ethics') || name.includes('ai governance')) {
    return 8 + random(7)  // 8-15 (safe)
  }
  
  // Layer 2: Highly automatable despite human-sounding names
  if (name.includes('data entry') || name.includes('form filling')) {
    return 82 + random(10)  // 82-92 (very risky)
  }
  
  // Layer 3: Keyword-based scoring
  const humanKeywords = ['empathy', 'leadership', 'crisis', 'mentor', ...]
  const techKeywords = ['code', 'automate', 'generate', 'analys', ...]
  
  const humanCount = humanKeywords.filter(k => name.includes(k)).length
  const techCount = techKeywords.filter(k => name.includes(k)).length
  const total = humanCount + techCount
  
  let baseScore = (techCount / total) * 82 + (humanCount / total) * 10
  
  // Layer 4: Industry context modifier
  const industryMult = INDUSTRY_RISK_MODIFIERS[industry] || 1.0
  return Math.min(92, Math.max(8, Math.round(baseScore * industryMult)))
}

// Portfolio aggregation
portfolioRisk = sum(skill.risk * skill.weight) / sum(skill.weight)
portfolioRisk = Math.min(99, Math.max(3, Math.round(portfolioRisk)))

// Weighted calculation (if weights != 1.0)
if (hasCustomWeights) {
  label = "Weighted Risk Score"
  isWeighted = true
}
```

**📊 Future Year Projections:**

```typescript
function projectSkillRisk(baselineScore, trend, industry):
  industryAccelerator = {Finance: 1.35, Tech: 1.25, Healthcare: 0.65, ...}
  
  annualGrowth = trend === 'rising' ? 8 
               : trend === 'stable' ? 2 
               : -2  // declining
  
  adjustedGrowth = annualGrowth * industryAccelerator[industry]
  
  year1Projection = baseline + adjustedGrowth  // 2027
  year3Projection = baseline + (adjustedGrowth * 3)  // 2029
  year5Projection = baseline + (adjustedGrowth * 5)  // 2031
  
  // With saturation modeling: high scores grow slower
  if (year5 > 90) {
    year5 = 90 + ((year5 - 90) * 0.4)
  }
  
  return [year1, year3, year5] clamped 3-99
```

**💾 Data Structures:**

```typescript
interface Skill {
  id: number
  name: string
  category: string
  riskScore: number  // 0-99
  trend: 'rising' | 'stable' | 'declining'
}

interface WeightedSkill extends Skill {
  weight: 0.5 | 1 | 2
  trendDelta?: number  // Change from 2025 baseline
}

interface RiskProjection {
  year: number  // 1, 3, or 5
  projectedRisk: number  // 0-99
  label: string  // "In 1 year", "In 3 years", etc.
}
```

**🔍 Dropdown Behavior:**
- Opens on focus or typing
- Shows 50 results (when filtering) or 60 (when browsing all)
- Search matches both skill name AND category
- Closes automatically when: skill selected, click outside, or click on dropdown
- Uses click-outside detection with `useRef` hook

**Validation & Warnings:**
- Max 50 skills selectable
- Job-skill industry mismatch warning shown
- Custom skill confidence score displayed (3-layer algorithm)
- Safest 3 skills highlighted (low risk)
- Riskiest 3 skills highlighted (high risk) with relevant AI tools

---

### 🔧 Tab 2: Human Irreplaceability Index (HII)
**Component:** `src/components/HumanIrreplacibilityIndex.tsx`

**Purpose:** Assess how "human" your role is vs. how automatable

**Dimensions Assessed:**
1. **Emotional Intelligence** - Crisis support, empathy, relationship building
2. **Judgment & Context** - Complex decision-making, edge cases
3. **Creativity & Innovation** - Novel problem solving, ideation
4. **Ethical Decision-Making** - Values, compliance, moral judgment
5. **Physical Presence** - Hands-on work, embodied expertise
6. **Relationship Capital** - Trust, networks, stakeholder management

**🧮 Calculation:**

```typescript
// User answers 6 questions (scale 0-10 each)
for each dimension:
  userScore = getUserResponse(dimension)  // 0-10
  
// Equal-weighted aggregation (not 5-D weighted model)
HIIScore = (sum of all dimensions) / 6

// Clamped to 0-100
HIIScore = Math.min(100, Math.max(0, Math.round(HIIScore)))

// Color coding:
//   0-25: Highly automatable
//  26-50: Moderate human factor
//  51-75: Strong human requirement
//  76-100: Irreplaceable human work
```

**📊 Output:**
- Visual gauge (0-100) with color gradient
- Dimension breakdown showing strengths
- Narrative interpretation ("Your role combines human creativity with judgment - both hard to automate")
- Recommended skill investments based on weak dimensions

**💾 Storage:**
```typescript
interface HumanIrreplacibilityState {
  humanScore: number | null  // 0-100
  humanDimensions: Record<string, number>  // Each dimension 0-100
  assessmentTimestamp: number
}
```

---

### 🔧 Tab 3: Upskilling Roadmap
**Component:** `src/components/UpskillingRoadmap.tsx`

**Purpose:** Generate personalized learning path based on risk profile

**🎯 Roadmap Generation Logic:**

```typescript
function generateRoadmap(jobRiskScore, skillRiskScores, humanScore):
  
  // Determine user intent: PROTECT or PIVOT
  if (humanScore > 75 && skillRiskScores < 50):
    intent = 'PROTECT'  // Strengthen existing strengths
  else if (jobRiskScore > 70):
    intent = 'PIVOT'    // Change direction
  else:
    intent = 'AUGMENT'  // Enhance with AI
  
  // Get high-risk skills
  riskySkills = filter(skills where riskScore > 70)
  
  // Map skills to relevant courses
  for each riskSkill:
    courses = getCoursesForSkill(riskSkill.name)
    phaseAssignment = assignToPhase(riskSkill.riskScore, intent)
```

**📚 Course Database Structure:**

```typescript
interface Course {
  title: string               // "Advanced Prompt Engineering"
  provider: string            // "DeepLearning.AI"
  duration: string            // "4 hours"
  price: string               // "$0" or "$99"
  affiliateUrl: string        // Link to course
  skillImpact: string          // "+22 points safety"
  description: string         // What you'll learn
  difficulty: CourseDifficulty // beginner|intermediate|advanced|expert
}

// 50+ courses mapped to skills, e.g.:
courseDatabase['Code generation'] = [
  {
    title: 'Advanced Prompt Engineering',
    provider: 'DeepLearning.AI',
    duration: '4 hours',
    price: '$0',
    affiliateUrl: 'https://deeplearning.ai/short-courses/prompt-engineering',
    skillImpact: '+22 points',
    description: 'Master AI code assistants to stay 10x ahead',
    difficulty: 'intermediate'
  },
  // More courses...
]
```

**🗺️ Roadmap Phases:**

```typescript
interface RoadmapPhase {
  phase: string          // "Phase 1: Foundation"
  weeks: string          // "Weeks 1-4"
  focus: string          // "Master core skill"
  milestones: string[]   // ["Complete 2 projects", "Pass assessment"]
  courses: Course[]      // Specific courses for this phase
}

// Example for PROTECT intent (finance analyst):
roadmap = [
  {
    phase: 'Phase 1: Foundation',
    weeks: 'Weeks 1-4',
    focus: 'Advanced Excel to Python Migration',
    milestones: [
      'Set up Python environment',
      'Build 1 financial model in Python',
      'Verify output matches Excel baseline'
    ],
    courses: [
      { title: 'Python for Financial Analysis', ... },
      { title: 'Pandas for Data Cleaning', ... }
    ]
  },
  {
    phase: 'Phase 2: Strategic',
    weeks: 'Weeks 5-12',
    focus: 'FP&A Strategy Beyond Spreadsheets',
    milestones: [
      'Develop scenario planning models',
      'Present strategic insight to CFO',
      'Lead forecasting improvement'
    ],
    courses: [
      { title: 'Advanced FP&A Analytics', ... },
      { title: 'Valuation & Corporate Strategy', ... }
    ]
  }
]
```

**💾 Progress Tracking:**

```typescript
interface RoadmapProgress {
  completedCourses: string[]      // Course titles completed
  completedMilestones: string[]   // Milestone names completed
}

// Stored in localStorage: 'hp_roadmap_progress'
// User can check off courses as they complete them
```

**🎨 UI Features:**
- Progress bar per phase
- Checkboxes for completed milestones
- Course links (all real, 2026-current)
- Time estimates
- Real pricing information
- Difficulty indicators (●○○ = intermediate)

---

### 🔧 Tab 4: Human Edge Journal
**Component:** `src/components/HumanEdgeJournal.tsx`

**Purpose:** Structured reflection tool to document irreplaceable human strengths

**🧠 Journal Prompts (10 questions):**

```typescript
const journalPrompts = [
  "What decision have you made that required human judgment AI couldn't?"
  "When did a relationship or trust matter more than a process?",
  "Describe a time you solved a novel problem no one had solved before",
  "When did your ethics or values protect your team/clients?",
  "What complex context do only you understand in your role?",
  "Describe a moment where emotional intelligence saved the day",
  "What would break if you left? (relationships, knowledge, judgment)",
  "How do you add value beyond task completion?",
  "What unique experience gives you an edge competitors don't have?",
  "If AI did 80% of tasks, what 20% would remain irreplaceable?"
]

// Responses stored in:
interface JournalEntry {
  promptId: number
  response: string
  timestamp: number
  sentiment: 'protected' | 'at_risk' | 'neutral'
}
```

**💾 Storage:**
- LocalStorage: `hp_journal_entries` (array of JournalEntry)
- Each entry timestamped for version history
- Optional export as PDF narrative

**🎨 UI:**
- Clean reflection interface, one prompt per view
- Character counter
- Sentiment tagging (optional)
- View all entries historical timeline
- Export as narrative document

---

### 🔧 Tab 5: Score Drift Tracker
**Component:** `src/components/ScoreDriftTracker.tsx`

**Purpose:** Monitor how risk scores change over time

**📊 Tracking Logic:**

```typescript
// Every assessment saved to localStorage with timestamp
scoreHistory = [
  { timestamp: 1704067200000, score: 42, type: 'job', date: 'Jan 1 2024' },
  { timestamp: 1709251200000, score: 45, type: 'job', date: 'Mar 1 2024' },
  { timestamp: 1714953600000, score: 38, type: 'job', date: 'May 1 2024' },
  // ...
]

// Drift = score change over time
yearOverYearDrift = latestScore - scoreFromOneYearAgo
monthOverMonthDrift = latestScore - scoreFromOneMonthAgo

// Trend = direction of drift
if (drift > 5):
  trend = 'RISING' (warning)
else if (drift < -5):
  trend = 'IMPROVING' (positive)
else:
  trend = 'STABLE'

// Inversion check
if (previousScore < 30 && currentScore > 70):
  showInversionBanner = true  // "Your risk inverted!"
```

**📈 Visualizations:**
- Line chart: Risk score over time
- Color-coded dots: Each assessment point
- Drift annotations: "+5 since last month"
- Alerts: Stale warnings (>90 days since last assessment)

**⚠️ Banners:**
1. **Staleness Banner** - "Your assessment is 90+ days old. Reassess now."
2. **Drift Banner** - "Risk increased 8 points (↑ RISING)"
3. **Inversion Banner** - "Your score inverted! Was safe, now at risk"

**💾 Data Structure:**

```typescript
interface ScoreEntry {
  timestamp: number      // ms since epoch
  score: number          // 0-99
  type: 'job' | 'skill' | 'human'
  context?: {
    jobTitle?: string
    skillCount?: number
    industry?: string
  }
}

// Stored in localStorage: 'hp_scores'
```

---

### 🔧 Tab 6: Email Digest Signup
**Component:** `src/components/DigestSignup.tsx`

**Purpose:** Subscribe to monthly risk updates

**📧 Features:**
- **Monthly Digest Email** containing:
  - Your current risk score
  - Month-over-month drift
  - New high-risk skills in your industry
  - Recommended micro-learning (5-min courses)
  - Research updates (new McKinsey reports, etc.)

**🔌 Backend Integration:**

```typescript
// Frontend submission
interface DigestSubscription {
  email: string
  frequency: 'weekly' | 'monthly' | 'quarterly'
  riskTriggers: boolean  // Alert if score changes >5 points
  newResearch: boolean   // Alert on new research releases
  timestamps: number
}

// Sent to: POST /api/digest
// Stored in: PostgreSQL digest_subscribers table
```

**💾 Opt-out:**
- Link in email unsubscribes from digest
- Stored in localStorage: `hp_digest_subscribed`
- Auto-shown 2 minutes after user completes first assessment
- "Don't show again" option

---

# 🗄️ DATA LAYER

## Skill Risk Database
**File:** `src/data/skillsDataNew.ts`

**228 Total Skills** organized by category:

| Category | Count | Examples | Risk Range |
|----------|-------|----------|-----------|
| Technical | 25 | Data entry (97), System architecture (28) | 24-97 |
| Creative | 20 | Image creation (95), Brand strategy (21) | 18-95 |
| Interpersonal | 20 | Leadership (7), Cold calling (52) | 3-52 |
| Analytical | 25 | Legal research (92), Systems thinking (17) | 17-92 |
| Management | 15 | Strategic planning (22), Vision setting (9) | 9-67 |
| Science | 15 | Drug discovery (57), Quantum research (29) | 29-76 |
| Healthcare | 20 | Medical coding (95), Patient care (12) | 3-95 |
| Legal | 12 | Contract drafting (87), Compliance (76) | 25-92 |
| Finance | 15 | Payroll processing (94), CFO strategy (18) | 18-94 |
| Sales | 10 | Cold calling (52), Sales discovery (25) | 9-52 |
| **EXTRA** | **5** | AI ethics (14), Emotional intelligence (2) | 2-18 |
| **2026 CALIBRATED** | **16** | Code generation (93), Executive storytelling (20) | 2-95 |

**Data Structure:**

```typescript
interface Skill {
  id: number                          // 1-228
  name: string                        // "Data entry"
  category: string                    // "Technical"
  riskScore: number                   // 0-99 (2026 calibrated)
  trend: 'rising' | 'stable' | 'declining'
}

// Risk score calibration sources:
// - McKinsey 2025: Task automation probability
// - Anthropic: Current Claude/GPT-4o capability
// - OpenAI: Enterprise deployment data
// - WEF Future of Jobs: Skill displacement timelines
// - LinkedIn: Skill demand trends
```

**Risk Score Calibration Process:**

```typescript
// Base score from McKinsey 2025 research
baseScore = mckinsey[skill.name]  // e.g., 72 for "code generation"

// Adjustment for current AI capability (Q1 2026)
if (skill.isAdjacent('coding')):
  // AI code generation now at 93%, up from 85% in 2025
  baseScore += 8

// Trend adjustment
if (skill.trend == 'rising'):
  baseScore += trend_delta[skill.name]  // e.g., +5 for "prompt engineering"

// Apply delta overrides from SKILL_RISK_DELTA_2026
if (SKILL_RISK_DELTA_2026[skill.name]):
  baseScore = SKILL_RISK_DELTA_2026[skill.name]

// Final clamp
finalScore = Math.min(99, Math.max(3, baseScore))
```

---

## Job Role Database
**File:** `src/data/jobRoleDatabase.ts` (referenced in CalculatorPage)

**250+ Job Roles** across 11 industries

**Data Structure:**

```typescript
interface JobRole {
  id: string                    // "finance_analyst_senior"
  name: string                  // "Senior Financial Analyst"
  industry: string              // "Finance"
  baseRiskScore: number         // 0-99 (from 2025 research)
  trend: 'rising' | 'stable' | 'declining'
  avgDisplacementYears: number  // e.g., 1.8 (time to likely displacement)
  affectedWorkers: number       // e.g., 2.3M globally
  description: string
  typicalSalary?: {
    min: number                 // USD annually
    max: number
    source: string              // "BLS 2025"
  }
}
```

**Industry Risk Multipliers:**

```typescript
const INDUSTRY_MULTIPLIERS = {
  'Finance': 1.35,           // High AI adoption
  'Accounting': 1.40,        // Highly automatable
  'Technology': 1.15,        // Differential: AI needed for some roles
  'Legal': 1.20,             // Document automation rising
  'Analytics': 1.25,         // Most data work automatable
  'Marketing': 1.20,         // Content creation AI-heavy
  'Creative': 1.30,          // But brand strategy safe
  'Healthcare': 0.70,        // Patient interaction required
  'Education': 0.75,         // Teaching relationship-critical
  'People Ops': 1.10,        // Some screening automatable
  'Sales': 1.05              // Closing still human
}

// Applied as: finalRisk = baseRisk * industryMultiplier
```

---

## Course Database
**File:** `src/data/courseDatabase.ts`

**50+ Real 2026 Courses** mapped to skills

**Skill-to-Course Mapping:**

```typescript
// For each high-risk skill, provide 2-3 alternative paths
courseDatabase = {
  'Code generation': [
    {
      title: 'Advanced Prompt Engineering',
      provider: 'DeepLearning.AI',
      duration: '4 hours',
      price: '$0',
      affiliateUrl: 'https://deeplearning.ai/short-courses/prompt-engineering',
      skillImpact: '+22 points',
      description: 'Master AI code assistants to stay 10x ahead',
      difficulty: 'intermediate'
    },
    {
      title: 'Code Review & Architecture',
      provider: 'Coursera',
      duration: '12 hours',
      price: '$49',
      affiliateUrl: 'https://coursera.org/code-review',
      skillImpact: '+18 points',
      description: 'Validate AI-generated code — humans still required',
      difficulty: 'advanced'
    }
  ],
  // 49+ more skills with courses
}
```

**Course Selection Criteria:**
- ✅ Must be real, 2026-current, active
- ✅ Price accurate as of Jan 2026
- ✅ Focus on **upskilling** (protective) or **pivoting** (displacement escape)
- ✅ Providers: Coursera, LinkedIn Learning, Udemy, O'Reilly, DeepLearning.AI, MasterClass, etc.
- ✅ Emphasize AI-adjacent skills (handling AI-generated outputs)

---

## Industry & Risk Insights
**File:** `src/data/skillInsights.ts`

**SKILL_INSIGHTS_2026** database:

```typescript
interface SkillInsight {
  skill: string
  why_protected?: string       // Why this skill resists automation
  threat?: string              // If high-risk, what's the threat
  pivot?: string               // How to escape the risk
  action?: string              // What to do now
  aiTools?: string[]           // AI tools doing this today
  source?: string              // Research citation
}

// Example:
SKILL_INSIGHTS_2026['Data entry'] = {
  threat: "Data entry is 97% automatable with RPA + OCR. Displacement by end 2026.",
  pivot: "Move from data entry → data validation → process optimization.",
  action: "Learn RPA tools (UiPath, Power Automate) to automate your own job.",
  aiTools: ['Zapier', 'Make', 'UiPath', 'Automation Anywhere'],
  source: "McKinsey 2025, Deloitte RPA Report"
}
```

---

# 🔌 BACKEND API

**File:** `src/server/routes/assessments.ts`

## Endpoint 1: POST /api/assessments
**Purpose:** Store user assessment (job risk, skill risk, human score)

```typescript
interface AssessmentPayload {
  userId?: string                // Optional: for persistence
  jobRiskScore?: number
  skillRiskScore?: number
  humanScore?: number
  selectedSkills?: SkillEntry[]
  humanDimensions?: Record<string, number>
  timestamp: number
}

interface AssessmentResponse {
  id: string                      // UUID
  message: string
  assessment: {
    jobRiskScore: number | null
    skillRiskScore: number | null
    humanScore: number | null
    timestamp: number
    assessmentId: string
  }
}

// Usage in frontend:
POST /api/assessments
{
  "jobRiskScore": 67,
  "skillRiskScore": 52,
  "humanScore": 78,
  "selectedSkills": [
    { id: 1, name: "Data entry", category: "Technical", riskScore: 97 },
    { id: 66, name: "Financial modelling", category: "Analytical", riskScore: 68 }
  ],
  "timestamp": 1704067200000
}

// Response:
{
  "message": "Assessment stored successfully",
  "assessment": {
    "jobRiskScore": 67,
    "skillRiskScore": 52,
    "humanScore": 78,
    "timestamp": 1704067200000,
    "assessmentId": "a1b2c3d4-e5f6-7890"
  }
}
```

## Endpoint 2: POST /api/digest
**Purpose:** Subscribe to monthly email digest

```typescript
interface DigestPayload {
  email: string
  frequency: 'weekly' | 'monthly' | 'quarterly'
  riskTriggers: boolean          // Alert on risk changes >5 points
  newResearch: boolean            // Alert on new research
}

interface DigestResponse {
  message: string
  subscriptionId: string
  confirmationEmailSent: boolean
}

// Usage:
POST /api/digest
{
  "email": "user@example.com",
  "frequency": "monthly",
  "riskTriggers": true,
  "newResearch": true
}

// Response:
{
  "message": "Subscription confirmed",
  "subscriptionId": "sub_123abc",
  "confirmationEmailSent": true
}
```

---

# 💾 DATA PERSISTENCE

## Client-Side (LocalStorage)

```typescript
// 1. Score History (accessed by ScoreDriftTracker)
localStorage['hp_scores'] = JSON.stringify([
  { timestamp: 1704067200000, score: 67, type: 'job', jobTitle: 'Analyst' },
  { timestamp: 1709251200000, score: 68, type: 'job', jobTitle: 'Analyst' },
  ...
])

// 2. Skill Selections (accessed by SkillRiskCalculator)
localStorage['hp_skill_selections'] = JSON.stringify([
  { id: 1, name: 'Data entry', weight: 1, riskScore: 97 },
  { id: 66, name: 'Financial modelling', weight: 2, riskScore: 68 }
])

// 3. Roadmap Progress (accessed by UpskillingRoadmap)
localStorage['hp_roadmap_progress'] = JSON.stringify({
  completedCourses: ['Advanced Prompt Engineering', 'Code Review & Architecture'],
  completedMilestones: ['Audit AI capabilities', 'Complete first AI-paired project']
})

// 4. Journal Entries (accessed by HumanEdgeJournal)
localStorage['hp_journal_entries'] = JSON.stringify([
  { promptId: 1, response: "...", timestamp: 1704067200000 },
  ...
])

// 5. Digest Subscription Status
localStorage['hp_digest_subscribed'] = 'true'
```

## Server-Side (Optional PostgreSQL)

```sql
-- Table: assessments
CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  user_email VARCHAR(255),
  job_risk_score INTEGER,
  skill_risk_score INTEGER,
  human_score INTEGER,
  selected_skills JSONB,  -- Full skill objects
  human_dimensions JSONB, -- Dimension breakdown
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  is_public BOOLEAN DEFAULT false
);

-- Table: digest_subscribers
CREATE TABLE digest_subscribers (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  frequency VARCHAR(50),  -- weekly, monthly, quarterly
  risk_triggers BOOLEAN,
  new_research BOOLEAN,
  subscribed_at TIMESTAMP,
  last_email_sent TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

---

# 🎨 UI DESIGN SYSTEM

## Color Palette (Cyberpunk Dark Theme)
```css
--bg: #0f0f23          /* Main background */
--surface: #1a1a35     /* Cards, panels */
--border: #2a2a4a      /* Subtle borders */
--border2: #3a3a5a     /* Medium borders */
--text: #e0e0ff        /* Main text */
--text2: #a0a0c0       /* Secondary text */
--cyan: #00F5FF        /* Primary accent */
--emerald: #00FF9F     /* Positive/safe */
--violet: #7C3AFF      /* Secondary accent */
--red: #FF4757         /* Danger/at-risk */
```

## Typography
```css
--mono: 'JetBrains Mono'    /* Code, data, numbers */
--syne: 'Syne'              /* Headings (700 weight) */
--body: 'Inter'             /* Body text (400, 500, 600) */
```

## Component Patterns
1. **Cards** - Subtle border, slight transparency background
2. **Buttons** - Outlined style, 8px border-radius
3. **Input Fields** - Transparent bg, cyan border on focus
4. **Charts** - Recharts with custom color overrides
5. **Dropdowns** - Absolute positioned, click-outside close
6. **Banners** - Sticky top, color-coded (cyan, red, emerald)

---

# 🔄 USER WORKFLOWS

## Workflow 1: First-Time Assessment
```
1. Land on HomePage
   └─ See hero + social proof + 5-D model explanation

2. Click "Calculate My Risk" → CalculatorPage
   └─ Select industry
   └─ Search job role
   └─ Submit: Job Risk Score saved

3. Auto-navigate to ToolsPage (Tab 1: Skill Risk)
   └─ Search & add skills (up to 50)
   └─ See weighted portfolio risk
   └─ See 2027/2029/2031 projections

4. Complete remaining tabs sequentially:
   └─ Tab 2: HII (answer 6 questions)
   └─ Tab 3: View roadmap (auto-generated from risk profile)
   └─ Tab 4: Journal (optional reflection)
   └─ Tab 5: Drift Tracker (shows first data point)
   └─ Tab 6: Digest signup (offered after 2 min)

5. Export assessment
   └─ Download JSON snapshot
   └─ Generate shareable link
   └─ (Optional) Email digest setup
```

## Workflow 2: Reassessment (3-6 Months Later)
```
1. Return to platform (localStorage retains history)

2. See drift tracker banner
   └─ "Your last assessment was 4 months ago"
   └─ Shows previous score: 67 → current score: 68 (↑1)

3. Optionally retake any assessment
   └─ Compare to previous results
   └─ Track trajectory

4. Read monthly digest email
   └─ New research highlights
   └─ Skill risk trends
   └─ Course recommendations
```

## Workflow 3: Upskilling Journey
```
1. Assess risk profile across all 6 tabs

2. Click "View Upskilling Roadmap" (Tab 3)
   └─ See phased courses based on risk intent
   └─ PROTECT (strengthen existing) vs PIVOT (change direction)

3. Enroll in Phase 1 courses
   └─ Mark progress in roadmap tracker

4. Complete courses + gain skills

5. Reassess → see risk scores improve over time

6. Track progress in Drift Tracker
   └─ Visible: "Risk improved 5 points from 68 → 63"
```

---

# 📊 SUMMARY: ALL FEATURES AT A GLANCE

| Feature | Location | Data | Output | Persistence |
|---------|----------|------|--------|-------------|
| **Job Risk Calculator** | CalculatorPage | 250 jobs, industry mult | Risk score 0-99 | localStorage history |
| **Skill Risk Calculator** | Tab 1 (SkillRiskCalculator) | 228 skills, custom scoring | Weighted portfolio risk + 1/3/5yr projections | localStorage (skills) |
| **Human Irreplaceability** | Tab 2 (HII) | 6 dimension questionnaire | 0-100 human factor score | localStorage + Context |
| **Upskilling Roadmap** | Tab 3 (UpskillingRoadmap) | 50+ courses, phased structure | Multi-phase learning plan | localStorage (progress) |
| **Human Edge Journal** | Tab 4 (Journal) | 10 reflection prompts | Narrative strength documentation | localStorage (entries) |
| **Score Drift Tracker** | Tab 5 (ScoreDriftTracker) | Assessment history | Trend visualization, alerts | localStorage history |
| **Digest Signup** | Tab 6 (DigestSignup) | Email + frequency prefs | Monthly email updates | Server + localStorage |
| **Export/Share** | All tabs | Current assessment snapshot | JSON, shareable link, PDF template | Derived on-demand |

---

# 🚀 TECHNICAL STACK

**Frontend:**
- React 18 (hooks, context API, suspense)
- Vite (fast dev server, hot reload)
- Recharts (data visualization)
- TypeScript (type safety)
- CSS (custom properties, no frameworks needed)

**Backend:**
- Express.js
- PostgreSQL (optional, for production)
- Node.js 18+

**Data:**
- LocalStorage API (client persistence)
- JSON (all data structures)
- Context API (Redux alternative)

**Deployment:**
- Replit (dev)
- Vercel/Netlify (frontend production)
- Railway/Heroku (backend production)

---

# ✅ VALIDATION & ERROR HANDLING

## Input Validation
```typescript
// Job Risk Score: must be 0-99
if (score < 0 || score > 99) {
  dispatch error message
  return
}

// Skill selections: max 50
if (selectedSkills.length > 50) {
  disable "Add" button
  show "Max 50 skills reached"
}

// Custom skill scoring: must be 3+ characters
if (customSkill.trim().length < 3) {
  disable "Add" button
}

// Email validation
if (!email.match(/@/)) {
  show "Invalid email"
}
```

## Data Consistency
```typescript
// Tab dependencies check
activeTab === 'roadmap' && !skillRiskScore
  → show "Complete Skill Risk assessment first"

activeTab === 'drift' && !jobRiskScore && !skillRiskScore
  → show "No assessments to track yet"

// Job-skill industry match
if (jobIndustry !== skillIndustry) {
  show warning: "This skill is uncommon in {job industry}"
}
```

---

# 🔮 FUTURE ENHANCEMENTS

1. **Mobile App** - React Native version
2. **Real-time Skill Data** - API integration with LinkedIn Learning API
3. **Peer Benchmarking** - Compare your risk to others in same role
4. **AI Job Coach** - Claude-powered personalized guidance
5. **Export Variants** - LinkedIn profile integrations, resume optimization
6. **Multiplayer Assessment** - Team/company-wide risk analysis
7. **Certification Tracking** - Link completed courses to profile
8. **Predictive Alerts** - "Your risk will increase 8 points if you don't upskill in next 6 months"

---

**Report Generated:** January 2026  
**Last Updated:** Latest deployment  
**Maintained by:** HumanProof Engineering Team
