"use client";

import { useEffect, useState } from "react";
import { signOutAction } from "@/actions/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { usePathname } from "next/navigation";

interface UserData {
  name: string | null;
  image: string | null;
}

const GuestHeader = () => (
  <header className="flex items-center justify-between w-full px-6 py-4">
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/img/logo.png"
        alt="Logo"
        width={300}
        height={80}
        className="object-contain pt-3"
        priority
      />
    </Link>
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">ログイン</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">登録</Link>
      </Button>
    </div>
  </header>
);

const LoadingHeader = () => (
  <header className="flex items-center justify-end w-full px-6 py-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-20 h-8 rounded" />
    </div>
  </header>
);

const UserHeader = ({ userData }: { userData: UserData | null }) => (
  <header className="flex items-center justify-end w-full px-6 py-4">
    <div className="flex items-center gap-4">
      {userData?.image ? (
        <Image
          src={userData.image}
          alt={`${userData.name || "User"} のプロフィール画像`}
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
        </div>
      )}
      {userData?.name ? (
        <span className="font-medium">{userData.name}</span>
      ) : (
        <span className="font-medium">ユーザー</span>
      )}
      <form action={signOutAction}>
        <Button type="submit" variant="outline">
          ログアウト
        </Button>
      </form>
    </div>
  </header>
);

const DisabledHeader = () => (
  <header className="flex items-center justify-between w-full px-6 py-4">
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/img/logo.png"
        alt="Logo"
        width={300}
        height={80}
        className="object-contain pt-3"
        priority
      />
    </Link>
    <div className="flex gap-4 items-center">
      <div className="flex gap-2">
        <Button
          asChild
          size="sm"
          variant="outline"
          disabled
          className="opacity-75 cursor-none pointer-events-none"
        >
          <Link href="/sign-in">サインイン</Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="default"
          disabled
          className="opacity-75 cursor-none pointer-events-none"
        >
          <Link href="/sign-up">サインアップ</Link>
        </Button>
      </div>
    </div>
  </header>
);

export default function HeaderWithAuth() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (!hasEnvVars) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user", {
        cache: "no-store",
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          setUserData(null);
        } else {
          console.error("Error response:", response.status);
          setError("エラーが発生しました");
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.user) {
        setUser({ email: data.user.email });
        setUserData(data.userData || null);
        setError(null);
      } else {
        setUser(null);
        setUserData(null);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("データ取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  if (loading) return <LoadingHeader />;
  if (!hasEnvVars) return <DisabledHeader />;
  if (user) return <UserHeader userData={userData} />;
  return <GuestHeader />;
}
