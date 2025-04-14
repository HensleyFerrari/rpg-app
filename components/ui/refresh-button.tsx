"use client";

import { Button } from "./button";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

const RefreshButton = () => {
  const router = useRouter();
  const handleRefresh = () => {
    const currentPath = window.location.pathname;
    router.push(currentPath);
  };

  return (
    <Button onClick={handleRefresh}>
      <RefreshCcw className="mr-2 h-4 w-4" />
      Atualizar
    </Button>
  );
};

export default RefreshButton;
