"use client";

import { AiChat } from "@/components/ai/AiChat";
import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function AiAssistantPage() {
  return (
    <MemberGuard>
      <DashboardShell>
        <AiChat />
      </DashboardShell>
    </MemberGuard>
  );
}

