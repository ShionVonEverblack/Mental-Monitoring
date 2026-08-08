-- RIMA (Ruang Interaksi Mental Aman) — Database Schema for Supabase

-- 1. Mood Entries Table
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  emoji TEXT NOT NULL,
  note TEXT,
  factors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Journal Entries Table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  template TEXT NOT NULL DEFAULT 'free',
  mood_id UUID REFERENCES public.mood_entries(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Forum Posts Table (Anonymous Support)
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  reactions JSONB DEFAULT '{"support": 0, "strength": 0, "hug": 0}'::jsonb,
  comment_count INT DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Forum Comments Table
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_supportive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Safety Plans Table
CREATE TABLE IF NOT EXISTS public.safety_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  warning_signs TEXT[] DEFAULT '{}',
  coping_strategies TEXT[] DEFAULT '{}',
  social_contacts JSONB DEFAULT '[]'::jsonb,
  professional_contacts JSONB DEFAULT '[]'::jsonb,
  safe_environment TEXT[] DEFAULT '{}',
  reasons_to_live TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_plans ENABLE ROW LEVEL SECURITY;

-- Forum Policies (Public Read/Write for anonymous support)
CREATE POLICY "Allow public read forum_posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert forum_posts" ON public.forum_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read forum_comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert forum_comments" ON public.forum_comments FOR INSERT WITH CHECK (true);

-- User-owned Data Policies
CREATE POLICY "Users manage own mood_entries" ON public.mood_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own journal_entries" ON public.journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own safety_plans" ON public.safety_plans FOR ALL USING (auth.uid() = user_id);
