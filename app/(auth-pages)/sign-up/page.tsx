import { signUpAction } from "@/actions/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="w-full max-w-lg flex flex-col gap-6 mt-12 p-12 shadow-md">
        <h1 className="text-2xl font-medium">アカウント登録</h1>
        <p className="text-sm text text-foreground">
          すでにアカウントをお持ちですか？
          <Link className="text-primary font-medium underline" href="/sign-in">
            ログイン
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">メールアドレス</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">パスワード</Label>
          <Input
            type="password"
            name="password"
            placeholder="あなたのパスワード"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="登録中...">
            登録
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
