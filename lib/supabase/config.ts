export function getSupabaseConfiguration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const missingVariables = [
    ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
    ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", supabasePublishableKey],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingVariables.length > 0) {
    throw new Error(
      `Supabase is not configured. Set ${missingVariables.join(" and ")} (see .env.example).`,
    );
  }

  return {
    supabaseUrl: supabaseUrl!,
    supabasePublishableKey: supabasePublishableKey!,
  };
}
