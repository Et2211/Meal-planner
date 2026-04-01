import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

async function AuthRedirect(): Promise<never> {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/recipes");
  } else {
    redirect("/login");
  }
}

export default function Home() {
  return (
    <Suspense>
      <AuthRedirect />
    </Suspense>
  );
}
