// app/layout.tsx
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import Sidebar from "@/components/sidebar";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// モジュールスコープでGeistを呼び出す
const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="jp" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen">
          {user && <Sidebar className="w-64" />}
          <div className="flex-1 flex flex-col">
            <nav className="w-full flex justify-end border-b border-b-foreground/10 h-16 p-4">
              {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
            </nav>
            <main className={`flex-1 p-6 ${!user && "flex justify-center"}`}>
              {children}
              <Toaster />
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
