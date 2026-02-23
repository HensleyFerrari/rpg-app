import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

export interface ServerActionResponse<T = any> {
  ok: boolean;
  message: string;
  data?: T;
}
