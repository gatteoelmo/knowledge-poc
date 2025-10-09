import { useState } from 'react';
import { API_BASE_URL, formatDigestResponse, isConfirmationResponse } from '../utils/constants';

export const useMessageHandler = (typingFunctions) => {
  const [loading, setLoading] = useState(false);
  const [waitingForWordConfirm, setWaitingForWordConfirm] = useState(false);
  const [waitingForDigestConfirm, setWaitingForDigestConfirm] = useState(false);
  const [lastDigest, setLastDigest] = useState(null);
  const [pendingQuery, setPendingQuery] = useState(null);

  const { addTypingAssistantMessage, addTypingAssistantMessageWithCallback } = typingFunctions;

  // Gestisce l'esportazione del digest in formato Word
  const handleWordExport = async () => {
    if (!lastDigest) return;
    
    addTypingAssistantMessage("Generating your Word document...");

    try {
      const response = await fetch(`${API_BASE_URL}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastDigest)
      });
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "maize_digest.docx";
      downloadLink.click();
      URL.revokeObjectURL(url);
      
      addTypingAssistantMessage("✅ Word document downloaded successfully! Feel free to ask me another question.");
    } catch (error) {
      console.error("Error generating Word document:", error);
      addTypingAssistantMessage("Sorry, there was an error generating the Word document. Please try again.", { isError: true });
    }
  };

  // Gestisce la generazione del digest strutturato
  const handleDigestGeneration = async (query, setMessages) => {
    try {
      const response = await fetch(`${API_BASE_URL}/digest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      
      if (data.error) {
        setMessages(prev => [...prev, {
          type: "assistant",
          content: `Sorry, I encountered an error: ${data.error}`,
          isError: true
        }]);
      } else {
        const result = data.result;
        setLastDigest(result);

        const digestContent = formatDigestResponse(result);
        
        // Mostra il digest (senza typing perché è formattato)
        setMessages(prev => [...prev, {
          type: "assistant",
          content: digestContent,
          isDigest: true,
          digestData: result
        }]);
        
        // Poi chiede conferma per l'esportazione con typing
        setTimeout(() => {
          addTypingAssistantMessage("Would you like me to export this digest as a Word document?", { isWordPrompt: true });
          setWaitingForWordConfirm(true);
        }, 1300);
      }
    } catch (error) {
      console.error("Error generating digest:", error);
      addTypingAssistantMessage("Sorry, there was an error generating the digest.", { isError: true });
    }
    setLoading(false);
  };

  // Gestisce l'invio dei messaggi
  const handleSendMessage = async (userMessage, setMessages) => {
    // === GESTIONE CONFERME ===
    
    // Gestione conferma esportazione Word
    if (waitingForWordConfirm) {
      if (isConfirmationResponse(userMessage)) {
        await handleWordExport();
      } else {
        setMessages(prev => [...prev, { type: "user", content: userMessage}]);
        addTypingAssistantMessage("No problem! Feel free to ask me another question.");
      }
      
      setWaitingForWordConfirm(false);
      setLastDigest(null);
      return;
    }

    // Gestione conferma creazione digest
    if (waitingForDigestConfirm) {
      setMessages(prev => [...prev, { type: "user", content: userMessage}]);
      
      if (isConfirmationResponse(userMessage)) {
        setLoading(true);
        await handleDigestGeneration(pendingQuery, setMessages);
      } else {
        addTypingAssistantMessage("Perfect! If you have any other questions, feel free to ask.");
      }
      
      setWaitingForDigestConfirm(false);
      setPendingQuery(null);
      return;
    }

    // === GESTIONE NUOVA QUERY ===
    
    setMessages(prev => [...prev, { type: "user", content: userMessage}]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage })
      });
      
      const data = await response.json();
      console.log("API Response:", data);

      if (data.error) {
        addTypingAssistantMessage(`Sorry, I encountered an error: ${data.error}`, { isError: true });
      } else {
        // Prima mostra la risposta naturale con effetto typing
        addTypingAssistantMessageWithCallback(data.response, () => {
          // Questo viene eseguito quando il primo messaggio ha finito di essere scritto
          setTimeout(() => {
            addTypingAssistantMessage("Would you like me to create a structured Word digest for this topic?", { isDigestPrompt: true });
            setWaitingForDigestConfirm(true);
            setPendingQuery(userMessage);
          }, 2000); // 2 secondi DOPO che il primo messaggio è finito
        });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      addTypingAssistantMessage("Sorry, I couldn't process your request. Please try again.", { isError: true });
    }

    setLoading(false);
  };

  return {
    loading,
    waitingForWordConfirm,
    waitingForDigestConfirm,
    handleSendMessage
  };
};