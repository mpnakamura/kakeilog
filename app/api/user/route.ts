import { NextResponse } from "next/server";
import { fetchUserData } from "@/actions/actions";

export async function GET() {
  const { user, userData, error } = await fetchUserData();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ user, userData });
}