import { forgotPasswordAction } from "@/actions/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <form className="w-full max-w-lg flex flex-col gap-6 mt-12 p-12 shadow-md">
        <h1 className="text-2xl font-medium">パスワードリセット</h1>
        <p className="text-sm text-secondary-foreground">
          すでにアカウントをお持ちですか？
          <Link className="text-primary underline" href="/sign-in">
            ログイン
          </Link>
        </p>

        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">メールアドレス</Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton formAction={forgotPasswordAction}>
            パスワードリセット
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
