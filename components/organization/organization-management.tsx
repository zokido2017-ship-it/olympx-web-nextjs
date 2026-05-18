"use client";

import * as React from "react";
import {
  Building2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { initialOrganizations } from "@/lib/data/organizations.mock";
import { cn } from "@/lib/utils";
import type { Organization, OrganizationKind, OrganizationStatus } from "@/types/organization";

const KIND_LABELS: Record<OrganizationKind, string> = {
  club: "Club",
  league: "League",
  federation: "Federation",
  brand: "Brand",
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type FormState = {
  name: string;
  slug: string;
  kind: OrganizationKind;
  description: string;
  status: OrganizationStatus;
  city: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  kind: "club",
  description: "",
  status: "active",
  city: "",
};

function orgToForm(o: Organization): FormState {
  return {
    name: o.name,
    slug: o.slug,
    kind: o.kind,
    description: o.description,
    status: o.status,
    city: o.city,
  };
}

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose(): void;
};

function DashboardModal({ title, children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="org-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog overlay"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl ring-1 ring-slate-200 sm:max-h-[85dvh] sm:max-w-lg sm:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:rounded-t-2xl">
          <h2 id="org-modal-title" className="text-lg font-black text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function OrganizationManagementPanel() {
  const [orgs, setOrgs] = React.useState<Organization[]>(() => [...initialOrganizations]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | OrganizationStatus>("all");
  const [kindFilter, setKindFilter] = React.useState<"all" | OrganizationKind>("all");

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Organization | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Organization | null>(null);

  const [form, setForm] = React.useState<FormState>(emptyForm);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return orgs.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (kindFilter !== "all" && o.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.slug.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
      );
    });
  }, [orgs, search, statusFilter, kindFilter]);

  const openCreate = () => {
    setForm(emptyForm);
    setCreateOpen(true);
  };

  const openEdit = (o: Organization) => {
    setForm(orgToForm(o));
    setEditTarget(o);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }
    if (orgs.some((o) => o.slug === form.slug.trim())) {
      toast.error("Slug must be unique.");
      return;
    }
    const next: Organization = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `org-${Date.now()}`,
      name: form.name.trim(),
      slug: form.slug.trim(),
      kind: form.kind,
      description: form.description.trim(),
      status: form.status,
      memberCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      city: form.city.trim() || "—",
    };
    setOrgs((prev) => [next, ...prev]);
    setCreateOpen(false);
    toast.success("Organization created.");
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }
    const slugTaken = orgs.some((o) => o.id !== editTarget.id && o.slug === form.slug.trim());
    if (slugTaken) {
      toast.error("Slug must be unique.");
      return;
    }
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === editTarget.id
          ? {
              ...o,
              name: form.name.trim(),
              slug: form.slug.trim(),
              kind: form.kind,
              description: form.description.trim(),
              status: form.status,
              city: form.city.trim() || "—",
            }
          : o,
      ),
    );
    setEditTarget(null);
    toast.success("Organization updated.");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setOrgs((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("Organization removed.");
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Management
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Organizations
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Create and manage clubs, leagues, federations, and brand partners.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          New organization
        </button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search name, slug, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Type</span>
              <select
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All types</option>
                {(Object.keys(KIND_LABELS) as OrganizationKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3 text-right">Members</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                    No organizations match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">{o.name}</p>
                          <p className="truncate font-mono text-xs text-slate-500">{o.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{KIND_LABELS[o.kind]}</td>
                    <td className="px-4 py-3 text-slate-600">{o.city}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-800">
                      {o.memberCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          o.status === "active"
                            ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80",
                        )}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">{o.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => openEdit(o)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                          aria-label={`Edit ${o.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(o)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${o.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white py-12 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/80">
            No organizations match your filters.
          </div>
        ) : (
          filtered.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">{o.name}</p>
                  <p className="font-mono text-xs text-slate-500">{o.slug}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                      {KIND_LABELS[o.kind]}
                    </span>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 font-bold uppercase tracking-wide",
                        o.status === "active" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {o.city} · {o.memberCount.toLocaleString()} members · {o.createdAt}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(o)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(o)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {createOpen ? (
        <DashboardModal title="New organization" onClose={() => setCreateOpen(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <OrgFormFields
              form={form}
              setForm={setForm}
              onSlugFromName={() => setForm((f) => ({ ...f, slug: slugify(f.name) }))}
            />
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </form>
        </DashboardModal>
      ) : null}

      {editTarget ? (
        <DashboardModal title="Edit organization" onClose={() => setEditTarget(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <OrgFormFields
              form={form}
              setForm={setForm}
              onSlugFromName={() => setForm((f) => ({ ...f, slug: slugify(f.name) }))}
            />
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
              >
                Save changes
              </button>
            </div>
          </form>
        </DashboardModal>
      ) : null}

      {deleteTarget ? (
        <DashboardModal title="Remove organization?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-slate-600">
            This removes <span className="font-bold text-slate-900">{deleteTarget.name}</span> from
            the list. This demo does not call a server — data resets on refresh.
          </p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="h-11 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </DashboardModal>
      ) : null}
    </div>
  );
}

function OrgFormFields({
  form,
  setForm,
  onSlugFromName,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSlugFromName(): void;
}) {
  return (
    <>
      <div>
        <label htmlFor="org-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Name
        </label>
        <input
          id="org-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          required
        />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label htmlFor="org-slug" className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Slug
          </label>
          <button
            type="button"
            onClick={onSlugFromName}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Generate from name
          </button>
        </div>
        <input
          id="org-slug"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="org-kind" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Type
          </label>
          <select
            id="org-kind"
            value={form.kind}
            onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as OrganizationKind }))}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            {(Object.keys(KIND_LABELS) as OrganizationKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="org-status" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Status
          </label>
          <select
            id="org-status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OrganizationStatus }))}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="org-city" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          City / region
        </label>
        <input
          id="org-city"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div>
        <label htmlFor="org-desc" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Description
        </label>
        <textarea
          id="org-desc"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </>
  );
}
