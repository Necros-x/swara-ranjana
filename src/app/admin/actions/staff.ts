"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/requireStaff";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { StaffRole, StaffStatus } from "@/types/database";

const STAFF_ROLES: StaffRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "BOX_OFFICE",
  "SCANNER",
];
const STAFF_STATUSES: StaffStatus[] = ["ACTIVE", "DISABLED"];

function cleanEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured?.startsWith("http://") || configured?.startsWith("https://")) {
    return configured.replace(/\/$/, "");
  }
  return "https://swara-ranjana.vercel.app";
}

function staffRedirect(kind: "success" | "error", message: string): never {
  redirect(`/admin/staff?${kind}=${encodeURIComponent(message)}`);
}

function inviteHtml(name: string, code: string, setupUrl: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#0E1721;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6f8;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FEFFFF;border:1px solid #d8dee3;border-top:4px solid #2271B1;">
            <tr>
              <td style="padding:28px;background:#0E1721;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#FEFFFF;letter-spacing:.03em;">SWARA RANJANA</div>
                <div style="margin-top:8px;font-size:10px;line-height:1.4;color:#62B6F3;letter-spacing:3px;text-transform:uppercase;">Staff Portal Invitation</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:27px;line-height:1.3;color:#0E1721;">Your staff access is ready</div>
                <div style="margin-top:14px;font-size:14px;line-height:1.7;color:#667481;">Hello ${name}. Use the one-time code below to finish setting up your Swara Ranjana staff account.</div>
                <div style="margin-top:26px;padding:20px;text-align:center;background:#F7F9FA;border-left:4px solid #2271B1;font-size:34px;line-height:1.2;font-weight:700;letter-spacing:10px;color:#0E1721;">${code}</div>
                <div style="margin-top:24px;text-align:center;">
                  <a href="${setupUrl}" style="display:inline-block;background:#0E1721;color:#ffffff;text-decoration:none;padding:13px 22px;font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;">Set up staff account</a>
                </div>
                <div style="margin-top:24px;font-size:12px;line-height:1.7;color:#7D8A95;">Do not share this code. If you were not expecting staff access, ignore this email.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function inviteStaff(formData: FormData) {
  await requireStaff(["SUPER_ADMIN"]);

  const email = cleanEmail(formData.get("email"));
  const displayName = String(formData.get("displayName") ?? "").trim();
  const role = String(formData.get("role") ?? "") as StaffRole;

  if (!email.includes("@") || email.length > 254) {
    staffRedirect("error", "Enter a valid staff email address.");
  }
  if (displayName.length < 2 || displayName.length > 80) {
    staffRedirect("error", "Enter the staff member's display name.");
  }
  if (!STAFF_ROLES.includes(role)) {
    staffRedirect("error", "Choose a valid staff role.");
  }

  const admin = createAdminClient();
  const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (usersError) {
    console.error("Staff user lookup failed:", usersError);
    staffRedirect("error", "Unable to check existing staff accounts.");
  }

  let authUser = usersData.users.find(
    (candidate) => candidate.email?.toLowerCase() === email,
  );

  if (!authUser) {
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      });

    if (createError || !created.user) {
      console.error("Staff auth user creation failed:", createError);
      staffRedirect(
        "error",
        createError?.message ?? "Unable to create the staff account.",
      );
    }
    authUser = created.user;
  }

  const { error: profileError } = await admin.from("staff_profiles").upsert(
    {
      user_id: authUser.id,
      display_name: displayName,
      role,
      status: "ACTIVE",
    },
    { onConflict: "user_id" },
  );

  if (profileError) {
    console.error("Staff profile upsert failed:", profileError);
    staffRedirect("error", "Unable to save the staff profile.");
  }

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  const code = linkData?.properties?.email_otp;
  if (linkError || !code) {
    console.error("Staff setup code generation failed:", linkError);
    staffRedirect("error", "Staff access was saved, but the setup code could not be generated.");
  }

  const setupUrl = `${siteUrl()}/admin/accept-invite?email=${encodeURIComponent(email)}`;
  const delivery = await sendTransactionalEmail({
    to: email,
    subject: `${code} is your Swara Ranjana staff setup code`,
    html: inviteHtml(displayName, code, setupUrl),
    text: [
      "Swara Ranjana — Staff Portal",
      "",
      `Hello ${displayName},`,
      `Your one-time staff setup code is: ${code}`,
      "",
      `Finish setup: ${setupUrl}`,
      "Do not share this code.",
    ].join("\n"),
  });

  if (!delivery.ok) {
    console.error("Staff invite email failed:", delivery.error);
    staffRedirect(
      "error",
      "Staff access was saved, but the invitation email could not be sent. Submit the same email again to resend it.",
    );
  }

  revalidatePath("/admin/staff");
  staffRedirect("success", `Invitation sent to ${email}.`);
}

export async function updateStaffMember(formData: FormData) {
  const { user } = await requireStaff(["SUPER_ADMIN"]);
  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "") as StaffRole;
  const status = String(formData.get("status") ?? "") as StaffStatus;
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!userId || !STAFF_ROLES.includes(role) || !STAFF_STATUSES.includes(status)) {
    staffRedirect("error", "Invalid staff update.");
  }
  if (displayName.length < 2 || displayName.length > 80) {
    staffRedirect("error", "Enter a valid display name.");
  }
  if (userId === user.id && (role !== "SUPER_ADMIN" || status !== "ACTIVE")) {
    staffRedirect("error", "You cannot demote or disable your own super-admin account.");
  }

  const admin = createAdminClient();
  const { data: current, error: currentError } = await admin
    .from("staff_profiles")
    .select("role, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (currentError || !current) {
    staffRedirect("error", "Staff member not found.");
  }

  const removingActiveSuperAdmin =
    current.role === "SUPER_ADMIN" &&
    current.status === "ACTIVE" &&
    (role !== "SUPER_ADMIN" || status !== "ACTIVE");

  if (removingActiveSuperAdmin) {
    const { count, error: countError } = await admin
      .from("staff_profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "SUPER_ADMIN")
      .eq("status", "ACTIVE");

    if (countError) {
      staffRedirect("error", "Unable to verify super-admin coverage.");
    }
    if ((count ?? 0) <= 1) {
      staffRedirect("error", "At least one active super admin must remain.");
    }
  }

  const { error } = await admin
    .from("staff_profiles")
    .update({ display_name: displayName, role, status })
    .eq("user_id", userId);

  if (error) {
    console.error("Staff update failed:", error);
    staffRedirect("error", "Unable to update this staff member.");
  }

  revalidatePath("/admin/staff");
  staffRedirect("success", "Staff access updated.");
}

export async function completeStaffInvite(formData: FormData) {
  const email = cleanEmail(formData.get("email"));
  const code = String(formData.get("code") ?? "").replace(/\s+/g, "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fail = (message: string): never => {
    redirect(
      `/admin/accept-invite?email=${encodeURIComponent(email)}&error=${encodeURIComponent(message)}`,
    );
  };

  if (!email.includes("@") || !/^\d{6,8}$/.test(code)) {
    fail("Enter the email address and setup code from your invitation.");
  }
  if (password.length < 10) {
    fail("Use a password with at least 10 characters.");
  }
  if (password !== confirmPassword) {
    fail("The passwords do not match.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "magiclink",
  });

  if (error || !data.user) {
    console.error("Staff setup verification failed:", error);
    fail("That setup code is invalid or has expired. Ask a super admin to resend the invitation.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("status")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.status !== "ACTIVE") {
    await supabase.auth.signOut();
    fail("This account does not have active Swara Ranjana staff access.");
  }

  const { error: passwordError } = await supabase.auth.updateUser({
    password,
  });

  if (passwordError) {
    console.error("Staff password setup failed:", passwordError);
    fail(passwordError.message || "Unable to save this password.");
  }

  await supabase.auth.signOut();
  redirect("/admin/login?setup=complete");
}
