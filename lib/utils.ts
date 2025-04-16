import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripHtml(html: string) {
  if (!html) return "";
  return (
    html
      // Replace paragraph tags with double newlines
      .replace(/<p[^>]*>/g, "")
      .replace(/<\/p>/g, "\n\n")
      // Replace br tags with newlines
      .replace(/<br\s*\/?>/g, "\n")
      // Remove other HTML tags
      .replace(/<[^>]*>/g, "")
      // Replace special HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&NewLine;/g, "\n")
      // Replace multiple spaces with single space
      .replace(/\s+/g, " ")
      // Replace multiple consecutive newlines with max two newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
