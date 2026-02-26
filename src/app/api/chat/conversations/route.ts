import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey, unauthorized } from "@/lib/utils";

export async function GET(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const body = await req.json().catch(() => ({}));

  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({ title: body.title || "New conversation" })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
