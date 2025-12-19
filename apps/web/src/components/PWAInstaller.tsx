"use client";

import { useState, useEffect } from "react";
import { Button } from "@aibos/ui";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA installed");
    } else {
      console.log("PWA installation declined");
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background-elevated border border-border rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            Install App
          </h3>
          <p className="text-sm text-foreground-muted mb-3">
            Install this app on your device for a better experience and offline access.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleInstall}>
            Install
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDeferredPrompt(null);
              setIsInstallable(false);
            }}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
