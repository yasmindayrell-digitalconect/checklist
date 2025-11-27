//lib.testSupabase.js

import { supabase } from "./supabaseClient.ts";
import "dotenv/config"


async function listarClientes() {
  const { data, error } = await supabase.from("clientes").select("*");

  if (error) {
    console.error("❌ Erro ao buscar clientes:", error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log("✅ Clientes encontrados (10 primeiros):");
    console.table(data.slice(0, 10)); // pega apenas os 10 primeiros
  } else {
    console.log("Nenhum cliente cadastrado ainda.");
  }
}

async function listaMensagens() {
  const { data, error } = await supabase.from("mensagens").select("*");

  if (error) {
    console.error("❌ Erro ao buscar mensagens:", error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log("✅ Mensagens encontradas (10 primeiras):");
    console.table(data.slice(0, 10)); // pega apenas os 10 primeiros
  } else {
    console.log("Nenhuma mensagem cadastrado ainda.");
  }
}

async function listaEnvios() {
  const { data, error } = await supabase.from("envios").select("*");

  if (error) {
    console.error("❌ Erro ao buscar envios:", error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log("✅ envios encontrados (10 primeiros):");
    console.table(data.slice(0, 10)); // pega apenas os 10 primeiros
  } else {
    console.log("Nenhum envio cadastrado ainda.");
  }
}

listarClientes();
listaMensagens();
listaEnvios();