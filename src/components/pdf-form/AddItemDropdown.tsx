import React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Plus } from "lucide-react";

interface AddItemDropdownProps {
  onAddLongQuestion?: () => void;
  onAddFillQuestion?: () => void;
  onAddMultipleChoicesQuestion?: () => void;
}

export function AddItemDropdown({
  onAddLongQuestion,
  onAddFillQuestion,
  onAddMultipleChoicesQuestion,
}: AddItemDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-1 h-3 w-3" />
          項目追加
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {onAddLongQuestion && <DropdownMenuItem onClick={onAddLongQuestion}>長文問題</DropdownMenuItem>}
        {onAddFillQuestion && <DropdownMenuItem onClick={onAddFillQuestion}>穴埋め問題</DropdownMenuItem>}
        {onAddMultipleChoicesQuestion && (
          <DropdownMenuItem onClick={onAddMultipleChoicesQuestion}>多肢選択問題</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
