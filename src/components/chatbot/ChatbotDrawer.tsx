import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareHeart,
  X,
  Send,
  Trash2,
  ShieldCheck,
  Phone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { processChatbotMessage, type ChatMessage } from '../../services/chatbotEngine';

export interface ChatbotDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleClose = useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [controlledOnClose]);

  const getInitialMessage = (): ChatMessage => ({
    id: 'welcome',
    sender: 'bot',
    text: t(
      'chatbot.welcome',
      'Halo, saya RIMA AI Companion. Saya dapat membantumu memahami kecemasan, latihan pernapasan, teknik grounding, welas asih diri, atau panduan konsultasi BPJS. Ada yang sedang membebani pikiranmu hari ini?'
    ),
    timestamp: Date.now(),
    stage: 'GROUNDED_RAG',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSendMessage = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: Date.now(),
      stage: 'GROUNDED_RAG',
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Simulate low-stimulation thinking transition (250ms)
    setTimeout(() => {
      const activeLang = i18n.language ? i18n.language.split('-')[0] : 'id';
      const botResponse = processChatbotMessage(trimmed, activeLang);
      setMessages(prev => [...prev, botResponse]);
      setIsThinking(false);
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleClearHistory = () => {
    setMessages([getInitialMessage()]);
  };

  const handleActionClick = (route?: string) => {
    if (route) {
      handleClose();
      navigate(route);
    }
  };

  const suggestedChips = [
    { key: 'chipPanic', text: t('chatbot.chipPanic', 'Cara atasi serangan panik (5-4-3-2-1)') },
    { key: 'chipCft', text: t('chatbot.chipCft', 'Latihan welas asih saat merasa gagal') },
    { key: 'chipBa', text: t('chatbot.chipBa', 'Mengatasi mager & rasa hampa') },
    { key: 'chipBpjs', text: t('chatbot.chipBpjs', 'Alur rujukan BPJS ke psikolog/psikiater') },
  ];

  return (
    <>
      {/* Floating Trigger Button (when uncontrolled and closed) */}
      {controlledIsOpen === undefined && !isOpen && (
        <button
          type="button"
          onClick={() => setInternalIsOpen(true)}
          className="chat-float-btn"
          aria-label={t('chatbot.triggerAria', 'Buka Pendamping Psikoedukasi AI (RIMA AI)')}
          title={t('chatbot.title', 'RIMA AI Companion')}
        >
          <MessageSquareHeart size={24} />
        </button>
      )}

      {/* Drawer Overlay & Panel */}
      {isOpen && (
        <div className="chat-drawer-wrapper" role="presentation">
          <div
            className="chat-drawer-backdrop"
            onClick={handleClose}
            aria-hidden="true"
          />

          <aside
            className="chat-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-drawer-title"
          >
            {/* Header */}
            <header className="chat-drawer-header">
              <div className="chat-header-identity">
                <div className="chat-avatar-icon">
                  <MessageSquareHeart size={20} />
                </div>
                <div>
                  <h2 id="chat-drawer-title" className="chat-header-title">
                    {t('chatbot.title', 'RIMA AI Companion')}
                  </h2>
                  <p className="chat-header-subtitle">
                    {t('chatbot.subtitle', 'Pendamping Psikoedukasi Berbasis Bukti • Non-Medis')}
                  </p>
                </div>
              </div>

              <div className="chat-header-actions">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="chat-header-btn"
                  title={t('chatbot.clearAria', 'Hapus riwayat percakapan')}
                  aria-label={t('chatbot.clearAria', 'Hapus riwayat percakapan')}
                >
                  <Trash2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="chat-header-btn"
                  title={t('chatbot.closeAria', 'Tutup percakapan')}
                  aria-label={t('chatbot.closeAria', 'Tutup percakapan')}
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* Clinical Safety Banner */}
            <div className="chat-safety-banner">
              <ShieldCheck size={15} className="chat-shield-icon" />
              <span>
                {t(
                  'chatbot.safetyNotice',
                  'AI ini beroperasi offline & berbasis bukti sains. Bukan pengganti diagnosis medis atau resep dokter (Sp.KJ).'
                )}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="chat-messages-area" role="log" aria-live="polite">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`chat-bubble-row ${msg.sender === 'user' ? 'chat-row-user' : 'chat-row-bot'}`}
                >
                  <div
                    className={`chat-bubble ${
                      msg.sender === 'user'
                        ? 'chat-bubble-user'
                        : msg.isEmergency
                        ? 'chat-bubble-emergency'
                        : 'chat-bubble-bot'
                    }`}
                  >
                    {/* Message Body Text */}
                    <div className="chat-bubble-text">
                      {msg.text.split('\n\n').map((para, i) => (
                        <p key={i} className="chat-paragraph">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Verified Clinical Source Citation Badge */}
                    {msg.sourceCitation && (
                      <div className="chat-source-badge">
                        <Sparkles size={12} />
                        <span>{msg.sourceCitation}</span>
                      </div>
                    )}

                    {/* Interactive Action Button (e.g. Grounding / Breathe / BPJS) */}
                    {msg.actionRoute && msg.actionLabel && (
                      <button
                        type="button"
                        onClick={() => handleActionClick(msg.actionRoute)}
                        className="chat-action-btn"
                      >
                        <span>{msg.actionLabel}</span>
                        <ArrowRight size={14} />
                      </button>
                    )}

                    {/* Crisis Emergency Calling Box */}
                    {msg.isEmergency && (
                      <div className="chat-emergency-box">
                        <a
                          href="tel:119,8"
                          className="chat-emergency-dial-btn"
                        >
                          <Phone size={15} />
                          <span>SEJIWA 119 Ext 8</span>
                        </a>
                        <a
                          href="tel:112"
                          className="chat-emergency-dial-btn chat-emergency-dial-alt"
                        >
                          <Phone size={15} />
                          <span>Darurat 112</span>
                        </a>
                        <small className="chat-emergency-note">
                          {t('chatbot.emergencyDialNotice', 'Tekan 8 saat nada sambung berbunyi')}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking Indicator */}
              {isThinking && (
                <div className="chat-bubble-row chat-row-bot">
                  <div className="chat-bubble chat-bubble-bot chat-bubble-thinking">
                    <span className="chat-pulse-dot" />
                    <span className="chat-pulse-dot" />
                    <span className="chat-pulse-dot" />
                    <span className="chat-thinking-text">
                      {t('chatbot.thinking', 'Mencari panduan klinis terverifikasi...')}
                    </span>
                  </div>
                </div>
              )}

              {/* Suggested Topic Chips (when user hasn't asked yet) */}
              {messages.length === 1 && !isThinking && (
                <div className="chat-suggested-section">
                  <p className="chat-suggested-label">
                    {t('chatbot.suggestedTitle', 'Topik Panduan Populer')}
                  </p>
                  <div className="chat-chips-grid">
                    {suggestedChips.map(chip => (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => handleSendMessage(chip.text)}
                        className="chat-chip-btn"
                      >
                        {chip.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input Form */}
            <footer className="chat-drawer-footer">
              <form onSubmit={handleSubmit} className="chat-input-container">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t('chatbot.inputPlaceholder', 'Ketik pertanyaan atau ceritakan perasaanmu...')}
                  aria-label={t('chatbot.inputPlaceholder', 'Ketik pertanyaan atau ceritakan perasaanmu...')}
                  className="chat-input-field"
                  disabled={isThinking}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className="chat-send-btn"
                  aria-label={t('chatbot.sendAria', 'Kirim pesan')}
                >
                  <Send size={16} />
                </button>
              </form>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
};
