"use client";

import { useState } from "react";
import { Card } from "@aibos/ui";
import { ProfileSection } from "./ProfileSection";
import { SecuritySection } from "./SecuritySection";
import { NotificationsSection } from "./NotificationsSection";
import { ActivitySection } from "./ActivitySection";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  organizationName: string;
}

interface SettingsClientProps {
  initialProfile: UserProfile;
}

type TabType = "profile" | "security" | "notifications" | "activity";

export function SettingsClient({ initialProfile }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "activity", label: "Activity", icon: "📋" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-foreground-muted">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left ${activeTab === tab.id
                    ? "bg-primary-600 text-white"
                    : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
                    }`}
                >
                  <span className="mr-3 text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card className="p-6">
            {activeTab === "profile" && (
              <ProfileSection profile={profile} onProfileUpdate={setProfile} />
            )}
            {activeTab === "security" && <SecuritySection />}
            {activeTab === "notifications" && <NotificationsSection />}
            {activeTab === "activity" && <ActivitySection />}
          </Card>
        </div>
      </div>
    </div>
  );
}
