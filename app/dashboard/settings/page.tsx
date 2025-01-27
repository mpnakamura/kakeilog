"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { EditIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface UserData {
  name: string | null;
  email: string | null;
  image: string | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          if (response.status === 401) {
            setUser(null);
          } else {
            const data = await response.json();
            setError(data.error || "エラーが発生しました");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUser(data.user ? { email: data.user.email } : null);
        setUserData(data.userData || null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("データ取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-96 p-6 space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full rounded" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-96 p-6 space-y-4">
          <p className="text-red-500">エラー: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            再試行
          </Button>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-96 p-6 space-y-4">
          <p className="text-gray-700">ログインしていません。</p>
          <Button asChild variant="default">
            <Link href="/sign-in">サインイン</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="h-24 w-24">
            {userData?.image ? (
              <AvatarImage
                src={userData.image}
                alt={`${userData.name || "User"} のプロフィール画像`}
              />
            ) : (
              <AvatarFallback>
                {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <h2 className="mt-4 text-xl font-semibold">
            {userData?.name || "ユーザー"}
          </h2>
          <p className="text-gray-500">{user.email}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 現在は表示のみ。将来的に編集機能を追加可能 */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">名前</label>
            <Input value={userData?.name || ""} disabled />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">メールアドレス</label>
            <Input value={user.email} disabled />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">プロフィール画像</label>
            {userData?.image ? (
              <img
                src={userData.image}
                alt="プロフィール画像"
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <p className="text-gray-500">画像が設定されていません</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end items-center">
          {/* 将来の編集機能のためのボタン（現在は非アクティブ） */}
          <Button variant="outline" disabled>
            <EditIcon className="h-4 w-4 mr-2" />
            編集
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
