import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PROVIDER = "currents";
const LOCAL_KEY = "currentsApiKey";

export type ApiKeyStatus = "env" | "remote" | "local" | "mock";

export function getEnvApiKey(): string | null {
  return (import.meta.env.VITE_CURRENTS_API_KEY as string | undefined) || null;
}

/** Per-user API key, stored in Supabase when signed in, localStorage otherwise. */
export function useApiKey() {
  const { user, loading: authLoading } = useAuth();
  const [key, setKey] = useState<string | null>(null);
  const [status, setStatus] = useState<ApiKeyStatus>("mock");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const envKey = getEnvApiKey();
    if (envKey) { setKey(envKey); setStatus("env"); setLoading(false); return; }
    if (user) {
      const { data } = await supabase
        .from("user_api_keys")
        .select("api_key")
        .eq("user_id", user.id)
        .eq("provider", PROVIDER)
        .maybeSingle();
      if (data?.api_key) { setKey(data.api_key); setStatus("remote"); setLoading(false); return; }
    }
    if (typeof window !== "undefined") {
      const local = localStorage.getItem(LOCAL_KEY);
      if (local) { setKey(local); setStatus("local"); setLoading(false); return; }
    }
    setKey(null); setStatus("mock"); setLoading(false);
  }, [user]);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  const save = useCallback(async (newKey: string) => {
    const v = newKey.trim();
    if (!v) return;
    if (user) {
      await supabase.from("user_api_keys").upsert(
        { user_id: user.id, provider: PROVIDER, api_key: v },
        { onConflict: "user_id,provider" }
      );
    } else {
      localStorage.setItem(LOCAL_KEY, v);
    }
    await load();
  }, [user, load]);

  const clear = useCallback(async () => {
    if (user) {
      await supabase.from("user_api_keys").delete()
        .eq("user_id", user.id).eq("provider", PROVIDER);
    } else {
      localStorage.removeItem(LOCAL_KEY);
    }
    await load();
  }, [user, load]);

  return { key, status, loading, save, clear, isAuthed: !!user };
}
