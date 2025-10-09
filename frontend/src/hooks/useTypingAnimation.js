import { useState, useRef } from 'react';

// Configurazioni per l'effetto typing
const TYPING_CONFIG = {
  MIN_DELAY: 5,    // Velocità minima (ms)
  MAX_DELAY: 10,    // Velocità massima (ms)
  PAUSE_CHANCE: 0.05, // Probabilità di pause più lunghe
  LONG_PAUSE: 50 // Durata pause lunghe (ms)
};

export const useTypingAnimation = () => {
  const [typingMessages, setTypingMessages] = useState(new Map());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeouts = useRef(new Map());

  // Funzione per simulare la scrittura carattere per carattere
  const typeWriter = (text, messageId, onComplete) => {
    let currentIndex = 0;
    const textArray = text.split('');
    
    // Cancella timeout precedente se esiste
    if (typingTimeouts.current.has(messageId)) {
      clearTimeout(typingTimeouts.current.get(messageId));
    }

    const typeNextChar = () => {
      if (currentIndex < textArray.length) {
        const currentText = textArray.slice(0, currentIndex + 1).join('');
        
        // Aggiorna il testo del messaggio in fase di typing
        setTypingMessages(prev => new Map(prev.set(messageId, currentText)));
        
        currentIndex++;
        
        // Calcola delay random con possibilità di pause
        let delay = Math.random() * (TYPING_CONFIG.MAX_DELAY - TYPING_CONFIG.MIN_DELAY) + TYPING_CONFIG.MIN_DELAY;
        if (Math.random() < TYPING_CONFIG.PAUSE_CHANCE) {
          delay = TYPING_CONFIG.LONG_PAUSE;
        }
        
        const timeoutId = setTimeout(typeNextChar, delay);
        typingTimeouts.current.set(messageId, timeoutId);
      } else {
        // Typing completato
        setTypingMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete(messageId);
          return newMap;
        });
        setIsTyping(false);
        onComplete && onComplete();
      }
    };

    setIsTyping(true);
    typeNextChar();
  };

  // Funzione helper per aggiungere un messaggio assistant con effetto typing
  const addTypingAssistantMessage = (content, setMessages, extraProps = {}) => {
    const messageId = Date.now() + Math.random(); // ID unico per il messaggio
    
    // Separa le props che devono essere aggiunte solo alla fine del typing
    const { isDigest, digestData, ...immediateProps } = extraProps;
    
    // Aggiungi il messaggio vuoto prima (senza isDigest)
    const newMessage = {
      type: "assistant",
      content: "",
      isTyping: true,
      messageId,
      ...immediateProps
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Avvia l'animazione typing
    setTimeout(() => {
      typeWriter(content, messageId, () => {
        // Al completamento, aggiorna il messaggio con il contenuto finale e tutte le props
        setMessages(prev => prev.map(msg => 
          msg.messageId === messageId 
            ? { ...msg, content, isTyping: false, isDigest, digestData }
            : msg
        ));
      });
    }, 1000); // Piccolo delay prima di iniziare il typing
  };

  // Funzione helper con callback per quando il typing è completato
  const addTypingAssistantMessageWithCallback = (content, setMessages, onTypingComplete, extraProps = {}) => {
    const messageId = Date.now() + Math.random(); // ID unico per il messaggio
    
    // Separa le props che devono essere aggiunte solo alla fine del typing
    const { isDigest, digestData, ...immediateProps } = extraProps;
    
    // Aggiungi il messaggio vuoto prima (senza isDigest)
    const newMessage = {
      type: "assistant",
      content: "",
      isTyping: true,
      messageId,
      ...immediateProps
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Avvia l'animazione typing
    setTimeout(() => {
      typeWriter(content, messageId, () => {
        // Al completamento, aggiorna il messaggio con il contenuto finale e tutte le props
        setMessages(prev => prev.map(msg => 
          msg.messageId === messageId 
            ? { ...msg, content, isTyping: false, isDigest, digestData }
            : msg
        ));
        // Chiama il callback quando il typing è finito
        if (onTypingComplete) {
          onTypingComplete();
        }
      });
    }, 1000); // Piccolo delay prima di iniziare il typing
  };

  // Cleanup function per cancellare tutti i timeout
  const cleanupTimeouts = () => {
    typingTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
    typingTimeouts.current.clear();
  };

  return {
    typingMessages,
    isTyping,
    addTypingAssistantMessage,
    addTypingAssistantMessageWithCallback,
    cleanupTimeouts
  };
};