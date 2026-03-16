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
    const action = searchParams.get("action");
    setIsCreateBattleModalOpen(action === "new-battle");
  }, [searchParams]);

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
