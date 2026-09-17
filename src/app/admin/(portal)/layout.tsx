import type { Metadata } from "next";
import { Layout } from "@/admin-site/components/Layout";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getAdminNotifications } from "@/lib/admin/notifications";

export const metadata: Metadata = {
  title: "Admin Portal",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireStaff();
  const notifications = await getAdminNotifications(profile.role, user.id);

  return (
    <Layout
      user={{
        id: user.id,
        name: profile.display_name,
        email: user.email ?? "",
        role: profile.role,
      }}
      notifications={notifications}
    >
      {children}
    </Layout>
  );
}
