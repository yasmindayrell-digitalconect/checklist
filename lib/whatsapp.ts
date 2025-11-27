// import fetch from "node-fetch";

// const API_URL = "https://waba-sandbox.360dialog.io/v1/messages";
// const API_KEY = process.env.D360_API_KEY!;

// export async function sendTextMessage(to: string, body: string) {
//   const payload = {
//     messaging_product: "whatsapp",
//     to,
//     type: "text",
//     text: { body },
//   };

//   const response = await fetch(API_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "D360-Api-Key": API_KEY,
//     },
//     body: JSON.stringify(payload),
//   });

//   return response.json();
// }

// export async function sendTemplateMessage(to: string, templateName: string, placeholders: string[] = []) {
//   const payload: any = {
//     messaging_product: "whatsapp",
//     to,
//     type: "template",
//     template: {
//       name: templateName,
//       language: { code: "en" },
//       components: [],
//     },
//   };

//   if (placeholders.length > 0) {
//     payload.template.components.push({
//       type: "body",
//       parameters: placeholders.map((text) => ({ type: "text", text })),
//     });
//   }

//   const response = await fetch(API_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "D360-Api-Key": API_KEY,
//     },
//     body: JSON.stringify(payload),
//   });

//   return response.json();
// }
