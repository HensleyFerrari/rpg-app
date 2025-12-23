import { getSystemById } from "@/lib/actions/system.actions";
import { notFound } from "next/navigation";
import SystemBuilder from "./components/system-builder";

export const dynamic = 'force-dynamic';

export default async function SystemEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const system = await getSystemById(id);

  if (!system) {
    notFound();
  }

  return <SystemBuilder initialData={system} />;
}
