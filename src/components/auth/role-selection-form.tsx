"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  SPORTXO_ROLES,
  type SportxoRoleId,
} from "@/constants/sportxo-roles";
import { RoleSelectionCard } from "@/components/auth/role-selection-card";
import { navigateAfterSignupSuccess } from "@/lib/auth-navigation";
import { cn } from "@/lib/cn";

export function RoleSelectionForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<SportxoRoleId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onContinue = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Role saved");
    setIsSubmitting(false);
    navigateAfterSignupSuccess(router);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-bold leading-snug tracking-tight text-sportxo-navy sm:text-[1.375rem]">
          How do you want to use Sportxo?
        </h1>
        <p className="text-sm leading-relaxed text-[#64748B]">
          Choose your role to personalize your Sportxo experience.
        </p>
      </header>

      <div className="space-y-2.5" role="group" aria-label="Select your role">
        {SPORTXO_ROLES.map((role) => (
          <RoleSelectionCard
            key={role.id}
            role={role}
            selected={selectedRole === role.id}
            onSelect={() => setSelectedRole(role.id)}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={!selectedRole || isSubmitting}
        onClick={onContinue}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center rounded-full bg-sportxo-blue text-sm font-bold text-white transition-colors",
          "hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/30 disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {isSubmitting ? "Continuing…" : "Continue"}
      </button>
    </div>
  );
}
