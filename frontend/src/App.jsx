import { useState, useRef, useEffect } from "react";
import "./App.css";

// Import dei componenti e hook personalizzati
import { MessageBubble, LoadingIndicator } from './components/MessageComponents';
import { ChatInput } from './components/ChatInput';
import { useTypingAnimation } from './hooks/useTypingAnimation';
import { useMessageHandler } from './hooks/useMessageHandler';
import { INITIAL_MESSAGE } from './utils/constants';

function App() {
  // === STATO PRINCIPALE ===
  const [messages, setMessages] = useState([
    {
      type: "assistant",
      content: INITIAL_MESSAGE,
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  
  // === RIFERIMENTI DOM ===
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // === HOOK PERSONALIZZATI ===
  const typingAnimation = useTypingAnimation();
  const { 
    loading, 
    waitingForWordConfirm, 
    waitingForDigestConfirm, 
    handleSendMessage 
  } = useMessageHandler({
    addTypingAssistantMessage: (content, extraProps) => 
      typingAnimation.addTypingAssistantMessage(content, setMessages, extraProps),
    addTypingAssistantMessageWithCallback: (content, callback, extraProps) => 
      typingAnimation.addTypingAssistantMessageWithCallback(content, setMessages, callback, extraProps)
  });

  // === UTILITY FUNCTIONS ===
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingAnimation.typingMessages]);

  // === GESTIONE INVIO MESSAGGI ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    await handleSendMessage(userMessage, setMessages);
  };

  return (
    <div className="app-container">
      {/* === AREA MESSAGGI CHAT === */}
      <div className="messages-container">
        {messages.map((message, index) => (
          <MessageBubble 
            key={index} 
            message={message} 
            typingMessages={typingAnimation.typingMessages}
          />
        ))}

        {/* Indicatore di caricamento */}
        {loading && <LoadingIndicator />}
        
        {/* Elemento per lo scroll automatico */}
        <div ref={messagesEndRef} />
      </div>

      {/* === AREA INPUT === */}
      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSubmit={handleSubmit}
        loading={loading}
        waitingForWordConfirm={waitingForWordConfirm}
        waitingForDigestConfirm={waitingForDigestConfirm}
        inputRef={inputRef}
      />
    </div>
  );
}

export default App;
