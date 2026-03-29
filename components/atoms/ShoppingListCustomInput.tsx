import { Plus } from "lucide-react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";

interface ShoppingListCustomInputProps {
  customInput: string;
  setCustomInput: (v: string) => void;
  addCustomItem: () => void;
}

export const ShoppingListCustomInput = ({
  customInput,
  setCustomInput,
  addCustomItem,
}: ShoppingListCustomInputProps) => {
  return (
    <div className="px-4 py-3 border-t border-stone-100 flex gap-2">
      <Input
        placeholder="Add a custom item..."
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") addCustomItem();
        }}
        className="flex-1"
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={addCustomItem}
        disabled={!customInput.trim()}
      >
        <Plus size={14} />
        Add
      </Button>
    </div>
  );
}
