"use client";

import { useState } from "react";

export function useShoppingListSave() {
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  async function withSave(fn: () => Promise<void>) {
    setSaving(true);
    await fn();
    setSaving(false);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  }

  return { saving, saveFeedback, withSave };
}
