import Headers from "@/modules/layout/components/header";
import React from "react";
import { currentUser } from "@/authetication/actions";
import { initializeWorkspace } from "@/modules/workspace/actions";
import TabbedLeftPanel from "@/modules/workspace/components/tabbed-left-panel";

const WorkspaceLayout = async ({ children }: { children: React.ReactNode }) => {
  const workspace = await initializeWorkspace();
  const user = await currentUser();

  return (
    <div className="flex flex-col h-screen">
      <Headers user={user} />

      {/* Body: left nav + content */}
      <main className="max-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] flex flex-1 overflow-hidden">
        <div className="flex h-full w-full">
          <div className="w-12 border-r border-zinc-800 bg-zinc-900">
            <TabbedLeftPanel />
          </div>
          <div className="flex-1 bg-zinc-950">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default WorkspaceLayout;
