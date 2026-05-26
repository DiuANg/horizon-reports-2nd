import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Module-level shared auth state so every useAuth() consumer sees the same
// session/user without each instance racing its own getSession() call.
type AuthState = { session: Session | null; user: User | null; loading: boolean };

let state: AuthState = { session: null, user: null, loading: true };
const listeners = new Set<(s: AuthState) => void>();
let initialized = false;

function setState(next: Partial<AuthState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l(state));
}

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  // Subscribe first so we never miss an auth event.
  supabase.auth.onAuthStateChange((_event, s) => {
    setState({ session: s, user: s?.user ?? null, loading: false });
  });
  // Then hydrate from storage.
  supabase.auth.getSession().then(({ data }) => {
    setState({
      session: data.session,
      user: data.session?.user ?? null,
      loading: false,
    });
  });
}

export function useAuth() {
  init();
  const [snap, setSnap] = useState<AuthState>(state);

  useEffect(() => {
    // Sync with latest state on mount (in case it changed between init and mount).
    setSnap(state);
    const listener = (s: AuthState) => setSnap(s);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session: snap.session, user: snap.user, loading: snap.loading, signOut };
}
