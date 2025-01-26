import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import GoogleSignInButton from "@/components/google-auth";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return <GoogleSignInButton />;
}
