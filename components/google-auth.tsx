// components/GoogleSignInButton.tsx
"use client";

import { supabaseClient } from "@/utils/supabase/browser";
import { useRouter } from "next/navigation";

export default function GoogleSignInButton() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/google/callback`,
      },
    });

    if (error) {
      console.error("Googleログインエラー:", error);
      alert("Googleログインに失敗しました");
    }
    // 成功すると Google ログイン画面にリダイレクトされます
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      Googleでログイン
    </button>
  );
}
