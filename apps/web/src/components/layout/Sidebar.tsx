"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Documents", href: "/documents", icon: "📄" },
  { name: "Statements", href: "/statements", icon: "📈" },
  { name: "Payments", href: "/payments", icon: "💳" },
  { name: "Messages", href: "/messages", icon: "💬" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      // Use proper error tracking
      import("@/lib/logger")
        .then(({ logError }) => logError("Logout failed", error))
        .catch(() => {
          // Fallback if logger fails
          console.error("Logout failed:", error);
        });
    }
  }, [router]);

  return (
    <div className="w-64 bg-background-elevated border-r border-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Vendor Portal</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Navigate to ${item.name}`}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background-elevated ${isActive
                ? "bg-primary-600 text-white"
                : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
                }`}
            >
              <span className="mr-3 text-lg" aria-hidden="true">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          aria-label="Sign out of your account"
          className="w-full flex items-center px-4 py-3 rounded-lg text-foreground-muted hover:bg-background-hover hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background-elevated"
        >
          <span className="mr-3" aria-hidden="true">🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

