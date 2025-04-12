import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  items: {
    label: string;
    href?: string;
  }[];
}

function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumbs"
      className={cn(
        "mb-4 flex items-center space-x-1 text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.label}>
            {item.href && !isLast ? (
              <>
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <span className={cn(isLast && "text-foreground font-medium")}>
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
