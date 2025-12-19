import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { KeyboardShortcutsProvider } from "./KeyboardShortcutsProvider";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <KeyboardShortcutsProvider>
      <div className="flex min-h-screen bg-background text-foreground font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          <Header />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </KeyboardShortcutsProvider>
  );
}

