import { Layout } from "@/admin-site/components/Layout";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireStaff();

  return (
    <Layout
      user={{
        id: user.id,
        name: profile.display_name,
        email: user.email ?? "",
        role: profile.role,
      }}
    >
      {children}
    </Layout>
  );
}
