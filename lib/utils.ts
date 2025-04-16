import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripHtml(html: string) {
  if (!html) return "";
  return (
    html
      // Replace <br> and </p> tags with newlines
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      // Remove all other HTML tags
      .replace(/<[^>]*>/g, "")
      // Replace multiple newlines with max two newlines
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      // Replace multiple spaces with single space
      .replace(/\s+/g, " ")
      // Replace special HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  );
}
