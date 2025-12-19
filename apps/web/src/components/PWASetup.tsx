"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa";
import { PWAInstaller } from "./PWAInstaller";

export function PWASetup() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <PWAInstaller />;
}
