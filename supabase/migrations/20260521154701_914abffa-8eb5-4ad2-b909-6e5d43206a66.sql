
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migrate bookmarks: drop existing data + policies, switch to user_id
DROP POLICY IF EXISTS "Anyone can view bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Anyone can insert bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Anyone can delete bookmarks" ON public.bookmarks;

TRUNCATE TABLE public.bookmarks;

ALTER TABLE public.bookmarks DROP COLUMN user_session_id;
ALTER TABLE public.bookmarks ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);

CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Per-user API keys (e.g. Currents API key)
CREATE TABLE public.user_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own api keys"
  ON public.user_api_keys FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api keys"
  ON public.user_api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys"
  ON public.user_api_keys FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys"
  ON public.user_api_keys FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_api_keys_updated_at
  BEFORE UPDATE ON public.user_api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
