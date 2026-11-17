"use client";

import { useState } from "react";

export function CopyButton({ value, label = "کپی لینک" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // clipboard might be unavailable in insecure contexts
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={copy} className="btn btn-outline btn-sm">
      {copied ? "✓ کپی شد" : label}
    </button>
  );
}
