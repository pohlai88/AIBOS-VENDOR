"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  CreditCard,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Statements", href: "/statements", icon: BarChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Focus trap for mobile sidebar
  useEffect(() => {
    if (!isMobileOpen) return;

    const sidebar = document.getElementById("mobile-sidebar");
    if (!sidebar) return;

    const focusableElements = sidebar.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when sidebar opens
    firstElement?.focus();
    sidebar.addEventListener("keydown", handleTab);
    return () => sidebar.removeEventListener("keydown", handleTab);
  }, [isMobileOpen]);

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

  const sidebarContent = (
    <>
      {/* Header with Branding */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-4 group" aria-label="NexusCanon Home">
          <div className="w-10 h-10 flex items-center justify-center">
            <NexusIcon size="lg" animated />
          </div>
          <div className="border-l border-border pl-4 group-hover:border-success-500/30 transition-colors duration-base">
            <BrandName variant="compact" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Navigate to ${item.name}`}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background-elevated min-h-[44px] ${
                isActive
                  ? "bg-background-hover text-foreground border-l-2 border-success-500"
                  : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
              }`}
            >
              <IconComponent className="w-5 h-5 mr-3" aria-hidden="true" />
              <span className="font-brand font-normal">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          aria-label="Sign out of your account"
          className="w-full flex items-center px-4 py-3 rounded-lg text-foreground-muted hover:bg-background-hover hover:text-foreground transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background-elevated min-h-[44px]"
        >
          <LogOut className="w-5 h-5 mr-3" aria-hidden="true" />
          <span className="font-brand font-normal">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background-elevated border border-border rounded-lg text-foreground hover:bg-background-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[44px] min-h-[44px]"
        aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMobileOpen}
        aria-controls="mobile-sidebar"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Menu className="w-5 h-5" aria-hidden="true" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile slide-in */}
      <div
        id="mobile-sidebar"
        className={`w-64 bg-background-elevated border-r border-border min-h-screen flex flex-col fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-base ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}

