function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env.local before using Supabase features.`,
    );
  }

  return value;
}

export function getSupabasePublicEnv() {
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    url: required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    publicKey: required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      publicKey,
    ),
  };
}

export function getSupabaseAdminEnv() {
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    ...getSupabasePublicEnv(),
    secretKey: required("SUPABASE_SECRET_KEY", secretKey),
  };
}
