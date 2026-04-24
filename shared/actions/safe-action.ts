import { connectDB } from "@/shared/db/mongodb";
import { ServerActionResponse } from "@/shared/utils/utils";

export async function safeAction<T = any>(
  handler: () => Promise<ServerActionResponse<T>>,
): Promise<ServerActionResponse<T>> {
  try {
    await connectDB();
    return await handler();
  } catch (error: any) {
    console.error("Action Error:", error);
    return {
      ok: false,
      message: error.message || "Ocorreu um erro interno no servidor",
    };
  }
}
