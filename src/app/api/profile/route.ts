import { NextResponse } from "next/server";
import { getProfile, saveProfile } from "@/lib/db";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const body = (await req.json()) as Profile;
  await saveProfile(body);
  const profile = await getProfile();
  return NextResponse.json({ profile });
}
