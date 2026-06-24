import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getTrialInfo, type Profile } from "@/lib/access";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const { data: proposals } = await supabase
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const trialInfo = getTrialInfo(profile as Profile);

  return (
    <DashboardClient
      profile={profile as Profile}
      trialInfo={trialInfo}
      initialProposals={proposals ?? []}
    />
  );
}
