import { useState } from 'react';
import { API_BASE_URL } from '../utils/constants';

export const useMessageHandler = (typingFunctions) => {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const { addTypingAssistantMessage } = typingFunctions;

  // Gestisce l'invio dei messaggi
  const handleSendMessage = async (userMessage, setMessages) => {
    setMessages(prev => [...prev, { type: "user", content: userMessage}]);
    setLoading(true);

    try {
      // Prepara i dati per mantenere la conversazione
      const requestBody = {
        query: userMessage,
        sessionId: sessionId
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      console.log("API Response:", data);

      if (data.error) {
        addTypingAssistantMessage(`Sorry, I encountered an error: ${data.error}`, { isError: true });
      } else {
        // Aggiorna sessionId se è il primo messaggio
        if (!sessionId && data.sessionId) {
          setSessionId(data.sessionId);
        }
        
        // Mostra la risposta con effetto typing
        addTypingAssistantMessage(data.response, { sources: data.sources });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      addTypingAssistantMessage("Sorry, I couldn't process your request. Please try again.", { isError: true });
    }

    setLoading(false);
  };

  // Funzione per resettare la conversazione
  const resetConversation = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_BASE_URL}/reset-conversation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        });
      } catch (error) {
        console.error("Error resetting conversation:", error);
      }
    }
    setSessionId(null);
  };

  return {
    loading,
    handleSendMessage,
    resetConversation,
    hasActiveSession: !!sessionId
  };
};