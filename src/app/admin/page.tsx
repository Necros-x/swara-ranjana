import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function AdminIndex() {
  const { profile } = await requireStaff();

  if (profile.role === "SCANNER") redirect("/admin/scanner");
  if (profile.role === "SELLER") redirect("/admin/sales");
  redirect("/admin/dashboard");
}
