import axios from "axios";

const API_KEY = "UND5EN_sandbox"; // substitua pela sua chave
const MEU_NUMERO = "556196246646"; // seu número com código do país, ex: 5511999999999

async function enviarTexto(mensagem) {
  try {
    const response = await axios.post(
      "https://waba-sandbox.360dialog.io/v1/messages",
      {
        messaging_product: "whatsapp",
        to: MEU_NUMERO,
        type: "text",
        text: { body: mensagem }
      },
      {
        headers: {
          "D360-Api-Key": API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Mensagem enviada com sucesso:", response.data);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.response?.data || error.message);
  }
}

// ===== FUNÇÃO PARA ENVIAR TEMPLATE =====
async function enviarTemplate(nomeTemplate, parametroTexto) {
  try {
    const response = await axios.post(
      "https://waba-sandbox.360dialog.io/v1/messages",
      {
        messaging_product: "whatsapp",
        to: MEU_NUMERO,
        type: "template",
        template: {
          name: nomeTemplate,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: parametroTexto }
              ]
            }
          ]
        }
      },
      {
        headers: {
          "D360-Api-Key": API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Template enviado com sucesso:", response.data);
  } catch (error) {
    console.error("Erro ao enviar template:", error.response?.data || error.message);
  }
}

// ===== TESTES =====
enviarTexto("Olá! Teste de mensagem via Sandbox 360dialog.");
// enviarTemplate("first_welcome_messsage", "Yasmin");