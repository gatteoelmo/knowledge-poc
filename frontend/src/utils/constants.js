// Configurazioni e costanti dell'applicazione
export const API_BASE_URL = "http://localhost:3001/api";

export const INITIAL_MESSAGE = "Hi! I'm your MAIZE Digest assistant. Ask me about any project or topic, and I'll create a structured digest for you.";

export const PLACEHOLDERS = {
  NORMAL: "Ask me about any project or topic...",
  WORD_CONFIRM: "Type 'yes' to export to Word...",
  DIGEST_CONFIRM: "Type 'yes' to create digest..."
};

// Funzioni helper per il formatting del digest
export function formatDigestResponse(result) {
  let formatted = "";
  
  if (result.executive) {
    formatted += `**Executive Summary**\n${result.executive}\n\n`;
  }
  
  if (result.opening) {
    formatted += `**Opening**\n${result.opening}\n\n`;
  }
  
  if (result.main) {
    formatted += `**Main Content**\n`;
    if (typeof result.main === 'object') {
      Object.entries(result.main).forEach(([key, value]) => {
        formatted += `*${key}:* ${value}\n\n`;
      });
    } else {
      formatted += `${result.main}`;
    }
  }
  
  return formatted;
}

// Utility per controllare se una risposta è una conferma
export const isConfirmationResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('yes') || 
         lowerMessage.includes('si') || 
         lowerMessage.includes('sì');
};