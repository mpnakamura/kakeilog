"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SetupForm() {
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const file = formData.get("image") as File;

    try {
      let imageUrl;
      if (file?.size) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(`public/${fileName}`, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("profiles")
          .getPublicUrl(`public/${fileName}`);

        imageUrl = publicUrl;
      }

      await saveProfile(name, imageUrl);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const saveProfile = async (name: string, imageUrl?: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("認証エラー");

    const { error } = await supabase.from("User").insert({
      id: user.id,
      name,
      image: imageUrl,
      email: user.email,
      emailVerified: user.email_confirmed_at,
    });

    if (error) throw error;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">名前</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="image">プロフィール画像</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
      </div>
      <Button type="submit" className="w-full">
        完了
      </Button>
    </form>
  );
}
