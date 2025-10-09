// Componente per mostrare il testo in fase di typing
export function TypingMessage({ text }) {
  return (
    <div className="message-content">
      {text}
      <span className="typing-cursor">|</span>
    </div>
  );
}

// Componente per il rendering del contenuto del digest
export function DigestContent({ digestData }) {
  return (
    <div>
      <div className="digest-section-title">
        Executive Summary
      </div>
      <div className="digest-section-content">
        {digestData.executive}
      </div>

      <div className="digest-section-title">
        Opening
      </div>
      <div className="digest-section-content">
        {digestData.opening}
      </div>

      <div className="digest-section-title">
        Main Content
      </div>
      <div className="digest-section-content">
        {typeof digestData.main === 'object' ? (
          Object.entries(digestData.main).map(([key, value]) => (
            <div key={key} className="digest-main-item">
              <strong>{key}:</strong> {value}
            </div>
          ))
        ) : (
          digestData.main
        )}
      </div>
    </div>
  );
}

// Componente per il bubble del messaggio
export function MessageBubble({ message, typingMessages }) {
  const isUser = message.type === "user";
  
  return (
    <div className={`message-row ${isUser ? "message-row-user" : ""}`}>
      <div className={`message-bubble ${isUser ? "message-bubble-user" : "message-bubble-assistant"}`}>
        {message.isTyping && message.messageId && typingMessages.has(message.messageId) ? (
          <TypingMessage text={typingMessages.get(message.messageId)} />
        ) : message.isDigest && message.digestData ? (
          <DigestContent digestData={message.digestData} />
        ) : (
          <div className="message-content">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente per l'indicatore di caricamento
export function LoadingIndicator() {
  return (
    <div className="loading-container">
      <div className="loading-bubble">
        <div className="loading-dots">
          <span className="loading-dot">●</span>
          <span className="loading-dot loading-dot-2">●</span>
          <span className="loading-dot loading-dot-3">●</span>
        </div>
      </div>
    </div>
  );
}