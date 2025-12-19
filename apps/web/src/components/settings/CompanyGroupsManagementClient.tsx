"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@aibos/ui";
import Link from "next/link";

interface CompanyGroup {
  id: string;
  name: string;
  description: string | null;
  parent_group_id: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  organizations?: Array<{ id: string; name: string; type: string }>;
}

export function CompanyGroupsManagementClient() {
  const [companyGroups, setCompanyGroups] = useState<CompanyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_group_id: "",
  });

  useEffect(() => {
    fetchCompanyGroups();
  }, []);

  const fetchCompanyGroups = async () => {
    try {
      const response = await fetch("/api/company-groups");
      const result = await response.json();

      if (result.success) {
        setCompanyGroups(result.data.companyGroups || []);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to load company groups" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load company groups" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/company-groups/${editingId}` : "/api/company-groups";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          parent_group_id: formData.parent_group_id || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: editingId
            ? "Company group updated successfully"
            : "Company group created successfully",
        });
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", description: "", parent_group_id: "" });
        fetchCompanyGroups();
      } else {
        setMessage({ type: "error", text: result.error || "Failed to save company group" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save company group" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (group: CompanyGroup) => {
    setEditingId(group.id);
    setFormData({
      name: group.name,
      description: group.description || "",
      parent_group_id: group.parent_group_id || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company group?")) {
      return;
    }

    try {
      const response = await fetch(`/api/company-groups/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: "Company group deleted successfully" });
        fetchCompanyGroups();
      } else {
        setMessage({ type: "error", text: result.error || "Failed to delete company group" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete company group" });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-6">
          <p className="text-foreground-muted">Loading company groups...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link
          href="/settings"
          className="text-primary-600 hover:text-primary-700 text-sm mb-4 inline-block"
        >
          ← Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Company Groups</h1>
        <p className="text-foreground-muted">
          Manage company groups within your tenant for organizing multiple companies
        </p>
      </div>

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

      <div className="flex gap-6">
        <div className="flex-1">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Company Groups</h2>
              <Button
                variant="primary"
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setFormData({ name: "", description: "", parent_group_id: "" });
                }}
              >
                + New Group
              </Button>
            </div>

            {companyGroups.length === 0 ? (
              <p className="text-foreground-muted text-center py-8">
                No company groups yet. Create one to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {companyGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 border border-border rounded-lg bg-background-elevated"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-foreground-muted mb-2">{group.description}</p>
                        )}
                        {group.organizations && group.organizations.length > 0 && (
                          <p className="text-sm text-foreground-muted">
                            {group.organizations.length} organization
                            {group.organizations.length !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(group)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(group.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {showForm && (
          <div className="w-96 flex-shrink-0">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {editingId ? "Edit Company Group" : "New Company Group"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={saving}
                />

                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={saving}
                />

                <div className="flex gap-2">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ name: "", description: "", parent_group_id: "" });
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
