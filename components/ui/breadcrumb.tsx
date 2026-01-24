"use client";

import * as React from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  items: {
    label: string;
    href?: string;
  }[];
  showBackButton?: boolean;
}

function Breadcrumb({ items, className, showBackButton = true, ...props }: BreadcrumbProps) {
  const router = useRouter();

  return (
    <nav
      aria-label="breadcrumbs"
      className={cn(
        "mb-4 flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 mr-2 shrink-0"
          onClick={() => router.back()}
          title="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.label}>
            {item.href && !isLast ? (
              <>
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
              </>
            ) : (
              <span
                className={cn(
                  isLast && "text-foreground font-semibold bg-muted/50 px-2 py-0.5 rounded-md border border-border/50"
                )}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export { Breadcrumb };
