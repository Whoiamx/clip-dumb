import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GENERIC_AUTH_ERROR = "Invalid credentials or authentication method.";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Verify the user's auth provider matches 'google'
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("auth_provider")
          .eq("user_id", user.id)
          .single();

        // If roleRow exists and provider is not google, reject
        if (roleRow && roleRow.auth_provider !== "google") {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent(GENERIC_AUTH_ERROR)}`
          );
        }
        // If roleRow is null, the trigger will create it with google — OK
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(GENERIC_AUTH_ERROR)}`
  );
}
