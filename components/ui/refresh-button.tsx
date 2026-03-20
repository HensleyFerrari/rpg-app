"use client";

import { Button } from "./button";
import { RefreshCcw } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const RefreshButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const handleRefresh = () => {
    router.push(pathname);
  };

  return (
    <Button onClick={handleRefresh}>
      <RefreshCcw className="mr-2 h-4 w-4" />
      Atualizar
    </Button>
  );
};

export default RefreshButton;
