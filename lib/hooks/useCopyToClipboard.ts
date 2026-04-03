"use client";

import { useState } from "react";

export function useCopyToClipboard(timeoutMs = 2000) {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), timeoutMs);
  }

  return { copied, copy };
}
