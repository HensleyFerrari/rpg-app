import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <div>Admin Dashboard</div>;
}

export default AdminPage;
