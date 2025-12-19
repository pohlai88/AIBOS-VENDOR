import { getCurrentUser } from "@/lib/auth";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-background-elevated border-b border-border px-6 py-4" role="banner">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Welcome back, {user?.email || "User"}
          </h2>
          <p className="text-sm text-foreground-muted capitalize" aria-label={`Your role: ${user?.role?.replace("_", " ") || "User"}`}>
            {user?.role?.replace("_", " ") || "User"}
          </p>
        </div>
        <nav className="flex items-center space-x-4" aria-label="User actions">
          <ThemeToggle />
          <LocaleSwitcher />
          <NotificationCenter />
        </nav>
      </div>
    </header>
  );
}

