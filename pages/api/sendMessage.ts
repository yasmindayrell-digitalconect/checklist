// import type { NextApiRequest, NextApiResponse } from "next";
// import { sendTextMessage } from "../../lib/whatsapp";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") return res.status(405).end();

//   const { to, body } = req.body;

// //   if (!to || !body) return res.status(400).json({ error: "to e body são obrigatórios" });

//   try {
//     const result = await sendTextMessage(to, body);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Erro ao enviar mensagem" });
//   }
// }
