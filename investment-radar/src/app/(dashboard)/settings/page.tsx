import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/SettingsForm";

export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-5">
      <div>
        <p className="font-display text-3xl italic text-text">Configurações</p>
        <p className="mt-1 text-sm text-text-muted">{user.email}</p>
      </div>
      <SettingsForm
        userId={user.id}
        initialDisplayName={settings?.display_name ?? ""}
        initialNotify={settings?.notify_on_thesis_change ?? true}
      />
    </div>
  );
}
