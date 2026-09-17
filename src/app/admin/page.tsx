import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function AdminIndex() {
  const { profile } = await requireStaff();

  redirect(profile.role === "SCANNER" ? "/admin/scanner" : "/admin/dashboard");
}
