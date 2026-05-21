
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session_id TEXT NOT NULL,
  article_url TEXT NOT NULL,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  country TEXT,
  language TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookmarks_session ON public.bookmarks(user_session_id);
CREATE INDEX idx_bookmarks_created ON public.bookmarks(created_at DESC);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Session-based access: allow all operations (session ID is the access token, validated client-side)
CREATE POLICY "Anyone can view bookmarks"
ON public.bookmarks FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert bookmarks"
ON public.bookmarks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete bookmarks"
ON public.bookmarks FOR DELETE
USING (true);
