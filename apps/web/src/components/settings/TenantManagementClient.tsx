"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input, Select } from "@aibos/ui";
import Link from "next/link";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "deleted";
  subscription_tier: "free" | "basic" | "professional" | "enterprise";
  max_users: number;
  max_companies: number;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function TenantManagementClient() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    subscription_tier: "free" as const,
    max_users: 10,
    max_companies: 5,
  });

  useEffect(() => {
    fetchTenant();
  }, []);

  const fetchTenant = async () => {
    try {
      const response = await fetch("/api/tenants");
      const result = await response.json();

      if (result.success && result.data.tenant) {
        const tenantData = result.data.tenant;
        setTenant(tenantData);
        setFormData({
          name: tenantData.name,
          subscription_tier: tenantData.subscription_tier,
          max_users: tenantData.max_users,
          max_companies: tenantData.max_companies,
        });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to load tenant" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load tenant information" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setTenant(result.data.tenant);
        setMessage({ type: "success", text: "Tenant settings updated successfully" });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update tenant" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update tenant settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6">
          <p className="text-foreground-muted">Loading tenant information...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/settings"
          className="text-primary-600 hover:text-primary-700 text-sm mb-4 inline-block"
        >
          ← Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Tenant Management</h1>
        <p className="text-foreground-muted">
          Manage your tenant settings, subscription tier, and limits
        </p>
      </div>

      <Card className="p-6">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${message.type === "success"
                ? "bg-success-900/50 border-success-700 text-success-200"
                : "bg-error-900/50 border-error-700 text-error-200"
              }`}
          >
            {message.text}
          </div>
        )}

        {tenant && (
          <div className="mb-6 p-4 bg-background-elevated rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-foreground-muted">Tenant ID:</span>
                <p className="text-foreground font-mono text-xs mt-1">{tenant.id}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Slug:</span>
                <p className="text-foreground font-mono text-xs mt-1">{tenant.slug}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Status:</span>
                <p className="text-foreground mt-1 capitalize">{tenant.status}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Created:</span>
                <p className="text-foreground mt-1">
                  {new Date(tenant.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Tenant Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={saving}
          />

          <Select
            label="Subscription Tier"
            value={formData.subscription_tier}
            onChange={(e) =>
              setFormData({ ...formData, subscription_tier: e.target.value as any })
            }
            options={[
              { value: "free", label: "Free" },
              { value: "basic", label: "Basic" },
              { value: "professional", label: "Professional" },
              { value: "enterprise", label: "Enterprise" },
            ]}
            disabled={saving}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Users"
              type="number"
              value={formData.max_users}
              onChange={(e) =>
                setFormData({ ...formData, max_users: parseInt(e.target.value) || 0 })
              }
              min={1}
              required
              disabled={saving}
            />

            <Input
              label="Max Companies"
              type="number"
              value={formData.max_companies}
              onChange={(e) =>
                setFormData({ ...formData, max_companies: parseInt(e.target.value) || 0 })
              }
              min={1}
              required
              disabled={saving}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => tenant && setFormData({
                name: tenant.name,
                subscription_tier: tenant.subscription_tier,
                max_users: tenant.max_users,
                max_companies: tenant.max_companies,
              })}
              disabled={saving}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
