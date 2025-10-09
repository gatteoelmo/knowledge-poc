import { PLACEHOLDERS } from '../utils/constants';

export function ChatInput({ 
  inputValue, 
  setInputValue, 
  onSubmit, 
  loading, 
  waitingForWordConfirm, 
  waitingForDigestConfirm,
  inputRef 
}) {
  const getPlaceholder = () => {
    if (waitingForWordConfirm) return PLACEHOLDERS.WORD_CONFIRM;
    if (waitingForDigestConfirm) return PLACEHOLDERS.DIGEST_CONFIRM;
    return PLACEHOLDERS.NORMAL;
  };

  const isWaiting = waitingForWordConfirm || waitingForDigestConfirm;

  return (
    <form onSubmit={onSubmit} className="input-form">
      {/* Campo di input con placeholder dinamico */}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={getPlaceholder()}
        className={`input-field ${isWaiting ? "input-field-waiting" : "input-field-normal"}`}
        disabled={loading}
      />
      
      {/* Pulsante di invio con stato dinamico */}
      <button
        type="submit"
        disabled={loading || !inputValue.trim()}
        className={`send-button ${loading || !inputValue.trim() ? "send-button-disabled" : "send-button-active"}`}
      >
        
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            style={{ width: '20px', height: '20px', pointerEvents: 'none' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
          </svg>
      </button>
    </form>
  );
}