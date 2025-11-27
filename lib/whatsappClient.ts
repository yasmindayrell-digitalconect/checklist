import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_360DIALOG_API_KEY; // coloque sua key no .env
const BASE_URL = "https://waba-sandbox.360dialog.io/v1";

export const sendMessage = async (to: string, message: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/messages`,
      {
        to,
        type: "text",
        text: { body: message },
        messaging_product: "whatsapp",
      },
      {
        headers: {
          "D360-Api-Key": API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Erro ao enviar mensagem:", error.response?.data || error.message);
    throw error;
  }
};
