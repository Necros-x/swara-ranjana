import Login from "@/admin-site/pages/Login";

export const metadata = { title: "Admin Login" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <Login
      nextPath={params.next}
      initialError={
        params.error === "not-authorized"
          ? "This account is not an active Swara Ranjana staff account."
          : undefined
      }
    />
  );
}
