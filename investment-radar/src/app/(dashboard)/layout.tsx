import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { TopBar } from "@/components/TopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar email={user?.email ?? null} />
        <main className="flex-1 px-4 pb-20 pt-5 md:px-8 md:pb-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
