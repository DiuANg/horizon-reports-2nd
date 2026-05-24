import { Link } from "@tanstack/react-router";
import { LogOut, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return (
      <Link
        to="/auth"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      >
        <UserIcon className="w-4 h-4" /> {t("auth.signIn")}
      </Link>
    );
  }

  const meta = user.user_metadata ?? {};
  const name = (meta.full_name as string) || (meta.name as string) || user.email || "User";
  const avatar = meta.avatar_url as string | undefined;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <Avatar className="h-8 w-8">
        {avatar && <AvatarImage src={avatar} alt={name} />}
        <AvatarFallback className="text-xs">{initial}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{name}</p>
      </div>
      <button
        onClick={signOut}
        aria-label={t("auth.signOut")}
        className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
