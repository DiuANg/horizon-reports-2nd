import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Globe2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — World News Dashboard" },
      { name: "description", content: "Sign in or create an account to save bookmarks and your API key." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [signupSent, setSignupSent] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Move Supabase session from localStorage to sessionStorage when "remember me" is off,
  // so the session is cleared when the browser/tab closes.
  const applyRememberPreference = () => {
    if (remember || typeof window === "undefined") return;
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) {
          const v = localStorage.getItem(k);
          if (v) sessionStorage.setItem(k, v);
          localStorage.removeItem(k);
        }
      }
    } catch {
      /* ignore */
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        if (!data.session) {
          setSignupSent(email);
          toast.success("Check your email to confirm your account");
        } else {
          applyRememberPreference();
          toast.success("Account created");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        applyRememberPreference();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Globe2 className="w-5 h-5" /> World News
        </div>
        <div className="flex gap-1 p-1 bg-secondary rounded-lg">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                mode === m ? "bg-card text-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>


        {signupSent && mode === "signup" && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-foreground">
            Check your email (<span className="font-medium">{signupSent}</span>) to confirm your account before signing in.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {mode === "signin" && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground select-none cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-primary"
              />
              Remember me
            </label>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          <Link to="/" className="hover:underline">Back to globe</Link>
        </p>
      </div>
    </div>
  );
}
