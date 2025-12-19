import { getCurrentUser } from "@/lib/auth";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-background-elevated border-b border-border px-6 md:px-12 h-20 flex items-center justify-between" role="banner">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 group">
          <div className="w-10 h-10 flex items-center justify-center">
            <NexusIcon size="lg" animated />
          </div>
          <div className="hidden md:block border-l border-border pl-4 group-hover:border-success-500/30 transition-colors duration-base">
            <BrandName variant="compact" />
          </div>
        </div>
        <div className="hidden lg:block border-l border-border pl-6 ml-4">
          <div>
            <h2 className="text-lg font-serif text-foreground font-normal">
              Welcome back, {user?.email?.split("@")[0] || "User"}
            </h2>
            <p className="text-sm text-foreground-muted font-brand font-normal capitalize" aria-label={`Your role: ${user?.role?.replace("_", " ") || "User"}`}>
              {user?.role?.replace("_", " ") || "User"}
            </p>
          </div>
        </div>
      </div>
      <nav className="flex items-center space-x-4" aria-label="User actions">
        <ThemeToggle />
        <LocaleSwitcher />
        <NotificationCenter />
      </nav>
    </header>
  );
}

