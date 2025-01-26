import Link from "next/link";

export default function Header() {
  return (
    <div className="flex flex-col gap-8 items-center">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
        My家計簿
      </h1>
      <p className="text-xl text-center text-muted-foreground">
        シンプルで使いやすい家計簿アプリ
      </p>
      <Link
        href="/sign-in"
        className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
      >
        ログインして始める
      </Link>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </div>
  );
}
