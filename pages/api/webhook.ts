// import type { NextApiRequest, NextApiResponse } from "next";
// import { supabase } from "../../lib/supabaseClient";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") return res.status(405).end();

//   try {
//     const body = req.body;

//     console.log("Recebido webhook:", body);

//     return res.status(200).json({ status: "ok" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Erro interno" });
//   }
// }
