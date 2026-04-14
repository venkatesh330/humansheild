-- ── ROADMAP PROGRESS SYNC TABLE ──
-- Stores user roadmap progress for cloud sync across devices
-- Uses Supabase Auth for user ownership

CREATE TABLE IF NOT EXISTS public.roadmap_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_key TEXT NOT NULL,
    completed_courses JSONB NOT NULL DEFAULT '[]',
    completed_milestones JSONB NOT NULL DEFAULT '[]',
    course_completion_dates JSONB NOT NULL DEFAULT '{}',
    milestone_completion_dates JSONB NOT NULL DEFAULT '{}',
    current_phase INTEGER DEFAULT 1,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role_key)
);

-- Enable RLS
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;

-- Users can read their own progress
CREATE POLICY "Users can read own roadmap progress"
ON public.roadmap_progress FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own roadmap progress"
ON public.roadmap_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own roadmap progress"
ON public.roadmap_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own roadmap progress"
ON public.roadmap_progress FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast user progress lookup
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_user_role
ON public.roadmap_progress(user_id, role_key);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_roadmap_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roadmap_progress_modtime
    BEFORE UPDATE ON public.roadmap_progress
    FOR EACH ROW
    EXECUTE PROCEDURE update_roadmap_progress_updated_at();

-- ── CAREER PATH SAVES TABLE ──
-- Users can save and track multiple career path explorations

CREATE TABLE IF NOT EXISTS public.career_path_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_role_key TEXT NOT NULL,
    to_role_key TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'saved',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.career_path_saves ENABLE ROW LEVEL SECURITY;

-- Users can read their own career path saves
CREATE POLICY "Users can read own career path saves"
ON public.career_path_saves FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own career path saves
CREATE POLICY "Users can insert own career path saves"
ON public.career_path_saves FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own career path saves
CREATE POLICY "Users can update own career path saves"
ON public.career_path_saves FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own career path saves
CREATE POLICY "Users can delete own career path saves"
ON public.career_path_saves FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_career_path_saves_user
ON public.career_path_saves(user_id);