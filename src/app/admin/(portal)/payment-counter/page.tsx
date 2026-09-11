import PaymentCounter from "@/admin-site/pages/PaymentCounter";
import { requireStaff } from "@/lib/auth/requireStaff";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  await requireStaff([
    "SUPER_ADMIN",
    "ADMIN",
    "BOX_OFFICE",
  ]);

  return <PaymentCounter />;
}
