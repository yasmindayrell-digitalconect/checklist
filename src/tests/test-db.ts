import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

console.log("ENV CHECK:", {
  host: process.env.RADAR_DB_HOST,
  user: process.env.RADAR_DB_USER,
  passType: typeof process.env.RADAR_DB_PASS,
  passLen: process.env.RADAR_DB_PASS?.length,
});

async function main() {
  console.log("🔌 Testando conexão com o RADAR DB...");

  // 👇 importa depois do dotenv garantir env em memória
  const { radarPool } = await import("../lib/Db");

  const ping = await radarPool.query(
    "select now() as now, current_database() as db, current_user as user"
  );
  console.log("✅ Conectou:", ping.rows[0]);

  await radarPool.end();
  console.log("🧹 Pool fechado com sucesso.");
}

main().catch(async (err) => {
  console.error("❌ Falhou:", err);
  process.exit(1);
});
