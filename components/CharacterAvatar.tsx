"use client";

import { useState } from "react";
import Image from "next/image";
import { User2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterAvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  isNpc?: boolean;
}

export function CharacterAvatar({
  src,
  alt = "Character",
  size = 40,
  className,
  isNpc = false
}: CharacterAvatarProps) {
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src && !error ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setError(true)}
          unoptimized
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {isNpc ? (
            <Shield className="text-slate-500" style={{ width: size * 0.5, height: size * 0.5 }} />
          ) : (
            <User2 className="text-slate-500" style={{ width: size * 0.5, height: size * 0.5 }} />
          )}
        </div>
      )}
    </div>
  );
}
