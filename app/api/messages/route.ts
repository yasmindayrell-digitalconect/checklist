import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const categoria = (formData.get("categoria") as string)?.trim();
    const texto = (formData.get("texto") as string)?.trim();
    const titulo = (formData.get("titulo") as string)?.trim();
    const imagemFile = formData.get("imagem") as File | null;

    if (!titulo || !categoria || !texto) {
      return NextResponse.json({ success: false, error: "Campos obrigatórios ausentes." }, { status: 400 });
    }

    let imagemUrl: string | null = null;

    if (imagemFile) {
      const ext = imagemFile.name.split(".").pop() || "bin";
      const fileName = `messages/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // dica: pega o contentType do próprio File
      const contentType = imagemFile.type || "application/octet-stream";

      const { error: uploadError } = await supabaseAdmin.storage
        .from("mensagens")
        .upload(fileName, imagemFile, {
          upsert: false,
          contentType,
        });

      if (uploadError) {
        console.error("uploadError", uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabaseAdmin.storage
        .from("mensagens")
        .getPublicUrl(fileName);

      imagemUrl = urlData.publicUrl; // precisa ser público (ou gerar signed URL)
    }

    const { data, error } = await supabaseAdmin
      .from("mensagens")
      .insert([{ titulo, categoria, texto, imagem: imagemUrl, status: "pending" }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error("Erro ao inserir mensagem:", err);
    return NextResponse.json({ success: false, error: err.message || "Erro desconhecido" }, { status: 500 });
  }
}
