"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CharacterModal } from "../personagens/_components/character-modal";
import { CreateBattleModal } from "../battles/components/create-battle-modal";

export function GlobalModals() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Create Battle Modal Logic
  const [isCreateBattleModalOpen, setIsCreateBattleModalOpen] = useState(false);
  const [createBattleDraft, setCreateBattleDraft] = useState<any>(null);

  useEffect(() => {
    if (searchParams.get("action") === "new-battle") {
      setIsCreateBattleModalOpen(true);
    } else {
      // If the param is removed (e.g. browser back button), close it.
      // However, we also have manual onOpenChange logic below.
      // It's safer to sync state to param if param dictates existence.
      // But for closing, we usually use the modal's internal close.
      if (isCreateBattleModalOpen && searchParams.get("action") !== "new-battle") {
        setIsCreateBattleModalOpen(false);
      }
    }
  }, [searchParams, isCreateBattleModalOpen]);

  const handleCreateBattleOpenChange = (open: boolean) => {
    setIsCreateBattleModalOpen(open);
    if (!open) {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("action") === "new-battle") {
        params.delete("action");
        // Use replace to avoid adding another history entry for the close action
        router.replace(`${pathname}?${params.toString()}`);
      }
    }
  };

  // CharacterModal handles its own openness based on URL params internally ('new' or 'edit'),
  // so we just render it.

  return (
    <>
      <CharacterModal />
      <CreateBattleModal
        open={isCreateBattleModalOpen}
        onOpenChange={handleCreateBattleOpenChange}
        draftData={createBattleDraft}
        onSaveDraft={setCreateBattleDraft}
      />
    </>
  );
}
