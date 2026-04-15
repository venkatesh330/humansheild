# Human Edge Journal — Implementation Plan 2026

## 📋 Priority Matrix

| Priority | Phase               | Items | Timeline |
| -------- | ------------------- | ----- | -------- |
| 🔴 P0    | Critical Bugs       | 3     | Week 1   |
| 🟡 P1    | Backend Integration | 4     | Week 2-3 |
| 🟡 P2    | Data Improvements   | 5     | Week 3-4 |
| 🟢 P3    | Enhancements        | 6     | Week 4-6 |

---

## 🔴 PHASE 0: Critical Bugs (Week 1)

### BUG-01: localStorage Quota Handling

```typescript
// File: artifacts/humanproof/src/components/HumanEdgeJournal.tsx
// Add: try-catch wrapper for saveEntries

const saveEntries = (entries: JournalEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    // Quota exceeded - prune aggressively
    if (entries.length > 50) {
      const pruned = entries.slice(0, Math.floor(entries.length * 0.7));
      saveEntries(pruned);
      notifyUser("Storage full - older entries auto-pruned");
    }
  }
};
```

**Owner:** FE | **T:** 2 hrs

---

### BUG-02: Corrupted JSON Recovery

```typescript
// Add validation before loadEntries
const loadEntries = (): JournalEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid format");
    return parsed.filter(validateEntry).map(migrateEntry);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

const validateEntry = (e: any): boolean =>
  e?.id && e?.date && e?.dimension && e?.title && e?.body;

const migrateEntry = (e: any): JournalEntry => ({
  id: e.id,
  date: e.date,
  dimension: e.dimension || "empathic",
  title: e.title,
  body: e.body,
  tags: Array.isArray(e.tags) ? e.tags : [],
  humanScore: e.humanScore ?? null,
  jobRiskScore: e.jobRiskScore ?? null,
  skillRiskScore: e.skillRiskScore ?? null,
  assessmentDate: e.assessmentDate ?? null,
});
```

**Owner:** FE | **T:** 4 hrs

---

### BUG-03: Special Characters in Tags

```typescript
// Sanitize on save
const sanitizeTags = (input: string): string[] => {
  return input
    .split(",")
    .map((t) => t.trim().replace(/[#,;]/g, ""))
    .filter(Boolean)
    .slice(0, 10); // Max 10 tags per entry
};

// Validate on submit
const validateTags = (tags: string[]): boolean => {
  return tags.every(
    (t) => t.length > 0 && t.length <= 30 && /^[a-zA-Z0-9 ]+$/.test(t),
  );
};
```

**Owner:** FE | **T:** 2 hrs

---

## 🟡 PHASE 1: Backend Integration (Week 2-3)

### BACKEND-01: Create Database Schema

```sql
-- File: supabase/migrations/20260412090000_create_journal.sql

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dimension VARCHAR(20) NOT NULL CHECK (dimension IN (
    'empathic', 'moral', 'creative', 'physical', 'social', 'contextual'
  )),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  human_score SMALLINT,
  job_risk_score SMALLINT,
  skill_risk_score SMALLINT,
  assessment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_journal_user ON journal_entries(user_id);
CREATE INDEX idx_journal_dimension ON journal_entries(dimension);
CREATE INDEX idx_journal_created ON journal_entries(created_at DESC);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);
```

**Owner:** BE | **T:** 4 hrs

---

### BACKEND-02: API Routes

```typescript
// File: artifacts/api-server/src/routes/journal.ts

import { Router } from "express";
import { supabase } from "../config/supabase";

const router = Router();

// GET /api/journal - List user entries
router.get("/", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ entries: data });
});

// POST /api/journal - Create entry
router.post("/", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { dimension, title, body, tags, scores } = req.body;

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: userId,
      dimension,
      title: title.slice(0, 200),
      body: body.slice(0, 10000),
      tags: tags?.slice(0, 10),
      human_score: scores?.human,
      job_risk_score: scores?.job,
      skill_risk_score: scores?.skill,
      assessment_date: scores?.date || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ entry: data });
});

// PUT /api/journal/:id - Update entry
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.headers["x-user-id"];
  const { dimension, title, body, tags } = req.body;

  const { data, error } = await supabase
    .from("journal_entries")
    .update({
      dimension,
      title,
      body,
      tags,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ entry: data });
});

// DELETE /api/journal/:id - Delete entry
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.headers["x-user-id"];

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// POST /api/journal/sync - Bulk sync from localStorage
router.post("/sync", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { entries } = req.body;

  // Upsert entries (conflict = update)
  const operations = entries.map((e: any) => ({
    user_id: userId,
    id: e.id,
    dimension: e.dimension,
    title: e.title,
    body: e.body,
    tags: e.tags,
    human_score: e.humanScore,
    job_risk_score: e.jobRiskScore,
    skill_risk_score: e.skillRiskScore,
    assessment_date: e.assessmentDate,
  }));

  const { data, error } = await supabase
    .from("journal_entries")
    .upsert(operations, { onConflict: "id" })
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ synced: data?.length });
});

export default router;
```

**Owner:** BE | **T:** 6 hrs

---

### BACKEND-03: Frontend Service Layer

```typescript
// File: artifacts/humanproof/src/services/journalService.ts

import { supabase } from "../utils/supabase";
import type { JournalEntry } from "../components/HumanEdgeJournal";

class JournalService {
  private syncInProgress = false;

  async loadEntries(): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return this.mapFromDb(data || []);
  }

  async saveEntry(entry: Omit<JournalEntry, "id">): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from("journal_entries")
      .insert(this.mapToDb(entry))
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDb([data])[0];
  }

  async updateEntry(
    id: string,
    updates: Partial<JournalEntry>,
  ): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from("journal_entries")
      .update(this.mapToDb(updates))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDb([data])[0];
  }

  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async syncFromLocal(entries: JournalEntry[]): Promise<number> {
    if (this.syncInProgress) return 0;
    this.syncInProgress = true;

    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .upsert(
          entries.map((e) => this.mapToDb(e)),
          { onConflict: "id" },
        )
        .select();

      if (error) throw error;
      return data?.length || 0;
    } finally {
      this.syncInProgress = false;
    }
  }

  private mapToDb(entry: any): any {
    return {
      id: entry.id,
      dimension: entry.dimension,
      title: entry.title,
      body: entry.body,
      tags: entry.tags,
      human_score: entry.humanScore,
      job_risk_score: entry.jobRiskScore,
      skill_risk_score: entry.skillRiskScore,
      assessment_date: entry.assessmentDate,
    };
  }

  private mapFromDb(data: any[]): JournalEntry[] {
    return data.map((e) => ({
      id: e.id,
      date: e.created_at?.split("T")[0] || e.date,
      dimension: e.dimension,
      title: e.title,
      body: e.body,
      tags: e.tags || [],
      humanScore: e.human_score,
      jobRiskScore: e.job_risk_score,
      skillRiskScore: e.skill_risk_score,
      assessmentDate: e.assessment_date,
    }));
  }
}

export const journalService = new JournalService();
```

**Owner:** FE | **T:** 4 hrs

---

### BACKEND-04: Sync Strategy

```typescript
// File: artifacts/humanproof/src/hooks/useJournalSync.ts

import { useEffect, useCallback, useRef } from "react";
import { journalService } from "../services/journalService";
import { useHumanProof } from "../context/HumanProofContext";

export function useJournalSync() {
  const { state } = useHumanProof();
  const lastSyncRef = useRef<string | null>(null);

  const syncOnChange = useCallback(async (entries: JournalEntry[]) => {
    const currentHash = JSON.stringify(entries.map((e) => e.id).sort());
    if (currentHash === lastSyncRef.current) return;

    lastSyncRef.current = currentHash;
    await journalService.syncFromLocal(entries);
  }, []);

  // Auto-sync on background
  useEffect(() => {
    if (!state.userId) return;

    const interval = setInterval(async () => {
      const entries = loadEntries();
      await syncOnChange(entries);
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [state.userId]);

  return { syncOnChange };
}
```

**Owner:** FE | **T:** 3 hrs

---

## 🟡 PHASE 2: Data Improvements (Week 3-4)

### DATA-01: Add Entry Timestamps

```sql
-- Migration
ALTER TABLE journal_entries ADD COLUMN created_time TIME;
ALTER TABLE journal_entries ADD COLUMN timezone VARCHAR(50);
```

**Owner:** BE | **T:** 2 hrs

---

### DATA-02: Entry Linking

```sql
-- Add linked entities
ALTER TABLE journal_entries ADD COLUMN linked_course_id UUID;
ALTER TABLE journal_entries ADD COLUMN linked_roadmap_item_id UUID;
ALTER TABLE journal_entries ADD COLUMN linked_assessment_id UUID;
```

**Owner:** BE | **T:** 3 hrs

---

### DATA-03: Rich Tags Management

```typescript
// File: artifacts/humanproof/src/components/TagManager.tsx

interface Tag {
  name: string;
  count: number;
  lastUsed: string;
}

// Get all tags for user (with usage count)
const getUserTags = async (userId: string): Promise<Tag[]> => {
  const { data } = await supabase
    .from("journal_entries")
    .select("tags")
    .eq("user_id", userId);

  const tagMap = new Map<string, number>();
  data?.forEach((row) => {
    (row.tags || []).forEach((tag: string) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count, lastUsed: "" }))
    .sort((a, b) => b.count - a.count);
};

// Bulk tag rename
const renameTag = async (oldName: string, newName: string): Promise<number> => {
  const { data } = await supabase.rpc("rename_journal_tag", {
    old_tag: oldName,
    new_tag: newName,
  });
  return data;
};
```

**Owner:** FE | **T:** 4 hrs

---

### DATA-04: JSON Export

```typescript
const exportJSON = () => {
  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    entryCount: entries.length,
    userDimensions: state.humanDimensions,
    entries: entries.map((e) => ({
      id: e.id,
      date: e.date,
      dimension: e.dimension,
      title: e.title,
      body: e.body,
      tags: e.tags,
      scores: {
        human: e.humanScore,
        jobRisk: e.jobRiskScore,
        skillRisk: e.skillRiskScore,
      },
    })),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `human-edge-journal-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
};
```

**Owner:** FE | **T:** 2 hrs

---

### DATA-05: Character Limits with Counter

```typescript
// In form component
const TITLE_MAX = 200;
const BODY_MAX = 10000;
const TAG_MAX = 30;

const TitleCounter = ({ value }) => (
  <div className="counter">
    {value.length}/{TITLE_MAX}
    {value.length > TITLE_MAX && <span className="error"> (shorten)</span>}
  </div>
);
```

**Owner:** FE | **T:** 1 hr

---

## 🟢 PHASE 3: Enhancements (Week 4-6)

### ENH-01: AI Pattern Insights (Enhanced)

```typescript
// File: artifacts/humanproof/src/services/insightGenerator.ts

interface Insight {
  type: "pattern" | "recommendation" | "correlation";
  dimension?: string;
  message: string;
  confidence: number;
  evidence: string[];
}

const generateInsights = async (
  entries: JournalEntry[],
  dimensions: Record<string, number>,
): Promise<Insight[]> => {
  const { data } = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a career coach analyzing user's journal entries.
Dimensions: ${JSON.stringify(dimensions)}
Entries: ${JSON.stringify(entries.slice(0, 50))}
Generate 3 insights about their human edge patterns.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(data.choices[0].message.content).insights;
};
```

**Owner:** FE | **T:** 6 hrs

---

### ENH-02: Journey Timeline View

```typescript
// View: Calendar-style timeline of entries
const TimelineView = ({ entries }) => {
  const byMonth = entries.reduce((acc, e) => {
    const month = e.date.substring(0, 7);
    (acc[month] = acc[month] || []).push(e);
    return acc;
  }, {});

  return Object.entries(byMonth).map(([month, monthEntries]) => (
    <div key={month} className="month-group">
      <h3>{month}</h3>
      {monthEntries.map(e => <EntryCard key={e.id} entry={e} />)}
    </div>
  ));
};
```

**Owner:** FE | **T:** 4 hrs

---

### ENH-03: Streak Gamification

```typescript
// Track: consecutive days with entries
interface StreakData {
  current: number;
  longest: number;
  lastEntryDate: string;
  byDimension: Record<string, number>;
}

const calculateStreaks = (entries: JournalEntry[]): StreakData => {
  // Sort by date descending
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  let current = 0;
  let longest = 0;
  let temp = 1;
  let lastDate = "";

  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      const today = new Date().toISOString().split("T")[0];
      const diff =
        (new Date(today).getTime() - new Date(sorted[0].date).getTime()) /
        86400000;
      current = diff <= 1 ? 1 : 0;
      lastDate = sorted[0].date;
    }

    if (i > 0) {
      const diff =
        (new Date(sorted[i - 1].date).getTime() -
          new Date(sorted[i].date).getTime()) /
        86400000;
      if (diff === 1) {
        temp++;
      } else {
        longest = Math.max(longest, temp);
        temp = 1;
      }
    }
  }

  longest = Math.max(longest, temp);

  return { current, longest, lastEntryDate: lastDate, byDimension: {} };
};
```

**Owner:** FE | **T:** 3 hrs

---

### ENH-04: Dashboard Widget

```typescript
// Compact summary for homepage
const JournalWidget = ({ entries, onClick }) => {
  const thisWeek = entries.filter(e => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(e.date) >= weekAgo;
  });

  const topDim = Object.entries(dimFrequency)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="widget" onClick={onClick}>
      <div className="stat">{entries.length} entries</div>
      <div className="stat">{thisWeek.length} this week</div>
      <div className="stat">{topDim?.[0] || 'none'} dominant</div>
    </div>
  );
};
```

**Owner:** FE | **T:** 2 hrs

---

### ENH-05: Challenge Integration (Enhanced)

```typescript
// Link daily challenge directly to new entry with pre-filled dimension
const openChallengeEntry = (challenge: string, dimension: Dimension) => {
  setForm({
    dimension,
    title: challenge.substring(0, 80),
    body: `Daily Challenge: ${challenge}\n\n`,
    tags: "daily-challenge",
  });
  setEditingEntryId(null);
  setShowModal(true);
};
```

**Owner:** FE | **T:** 2 hrs

---

### ENH-06: Async PDF Generation

```typescript
// File: artifacts/humanproof/src/utils/pdfGenerator.ts

const generatePDFAsync = async (entries: JournalEntry[]): Promise<Blob> => {
  return new Promise((resolve) => {
    // Use web worker for heavy computation
    const worker = new Worker("/workers/pdf.worker.ts");

    worker.postMessage({ entries });
    worker.onmessage = (e) => resolve(e.data.blob);
  });
};

// Fallback: chunked generation
const generatePDFChunked = async (entries: JournalEntry[]): Promise<Blob> => {
  const doc = new jsPDF();
  const CHUNK_SIZE = 50;

  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    await new Promise((r) => setTimeout(r, 0)); // Yield to main thread
    const chunk = entries.slice(i, i + CHUNK_SIZE);
    addChunkToPDF(doc, chunk, i);
  }

  return doc.output("blob");
};
```

**Owner:** FE | **T:** 3 hrs

---

## 📊 Implementation Roadmap

```
Week 1  │███████████████│ Critical Bugs (3)
Week 2  │███████████████│ Backend Schema + API (BACKEND-01, 02)
Week 3  │██████████████│ Frontend Service + Sync (BACKEND-03, 04)
Week 4  │██████████████│ Data Improvements (DATA-01 to 05)
Week 5  │██████████████│ Enhancements (ENH-01, 02, 03)
Week 6  │██████████████│ Enhancements (ENH-04, 05, 06)
```

---

## ✅ Definition of Done

| Phase | Criteria                                                           |
| ----- | ------------------------------------------------------------------ |
| P0    | localStorage errors handled gracefully; no data loss on corruption |
| P1    | Entries sync to cloud; accessible from any device                  |
| P2    | JSON export works; tags manageable; timestamps precise             |
| P3    | Pattern insights via AI; timeline view; gamification active        |

---

## 🚀 Quick Wins (Start Immediately)

1. **Add character counters to form** — 1 hr
2. **Fix tag sanitization** — 2 hrs
3. **Add JSON export button** — 2 hrs
4. **Add try-catch to storage** — 2 hrs

**Total Quick Wins:** 7 hrs → Immediate user value
