import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from("watchlist").select("*").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ watchlist: data });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const body = await req.json();
  const { symbol, asset_type } = body as { symbol: string; asset_type: string };

  if (!symbol || !["acao_br", "acao_us", "cripto"].includes(asset_type)) {
    return NextResponse.json({ error: "symbol e asset_type válidos são obrigatórios" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("watchlist")
    .insert({ user_id: user.id, symbol: symbol.toUpperCase(), asset_type })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

  const { error } = await supabase.from("watchlist").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
