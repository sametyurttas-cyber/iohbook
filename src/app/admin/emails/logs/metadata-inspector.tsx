"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type MetadataInspectorProps = {
  payload: Record<string, unknown> | null | undefined;
};

export function MetadataInspector({ payload }: MetadataInspectorProps) {
  const [open, setOpen] = useState(false);

  // Filter out internal variables to only show relevant metadata parameters (API keys, secrets, or internal variables are kept hidden)
  const displayPayload = payload ? { ...payload } : {};
  delete displayPayload._variables;

  if (!displayPayload || Object.keys(displayPayload).length === 0) {
    return <span className="text-[#8a8fa0] text-[10px] font-mono">Boş</span>;
  }

  return (
    <div className="flex flex-col gap-1 items-start">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-[10px] font-mono text-[#8a8fa0] hover:text-[#f2efe8] hover:bg-[rgba(255,255,255,0.05)]"
        onClick={() => setOpen(!open)}
      >
        {open ? "Gizle [-]" : "İncele [+]"}
      </Button>
      {open && (
        <pre className="text-[10px] font-mono bg-black/40 border border-[rgba(242,239,232,0.08)] p-2 rounded text-left overflow-auto max-w-[280px] max-h-[150px] whitespace-pre-wrap break-all text-[#8a8fa0]">
          {JSON.stringify(displayPayload, null, 2)}
        </pre>
      )}
    </div>
  );
}
