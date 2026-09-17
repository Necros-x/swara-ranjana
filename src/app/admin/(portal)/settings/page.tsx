import Settings from "@/admin-site/pages/Settings";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function Page() {
  await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  return <Settings />;
}
