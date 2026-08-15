import { useState, useRef, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { Send, Sparkles } from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState<{id: string, text: string, isBot: boolean}[]>([
    { id: '1', text: "Bonjour ! Je suis XAALISI, votre assistant IA personnel. Comment puis-je vous aider aujourd'hui ?", isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now().toString(), text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetchAPI('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage.text })
      });
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        isBot: true
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je rencontre des difficultés de connexion. Veuillez réessayer plus tard.",
        isBot: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', maxWidth: '900px', margin: '0 auto', backgroundColor: '#0B0F19', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: '#141820' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <Sparkles color="#D4AF37" size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', margin: 0 }}>Assistant XAALISI</h2>
          <span style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontWeight: 500 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
            Intelligence Artificielle Connectée
          </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', scrollBehavior: 'smooth' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isBot ? 'flex-start' : 'flex-end' }}>
            <div style={{ 
              maxWidth: '75%', 
              padding: '14px 18px', 
              borderRadius: '20px',
              borderBottomLeftRadius: msg.isBot ? '4px' : '20px',
              borderBottomRightRadius: !msg.isBot ? '4px' : '20px',
              backgroundColor: msg.isBot ? '#1F2937' : '#D4AF37',
              color: msg.isBot ? '#F9FAFB' : '#000',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              fontSize: '15px',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ padding: '14px 18px', borderRadius: '20px', borderBottomLeftRadius: '4px', backgroundColor: '#1F2937', color: '#8B95A5', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Sparkles size={14} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} /> Réflexion en cours...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '20px', backgroundColor: '#141820', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, backgroundColor: '#0B0F19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Posez votre question à l'IA..."
              style={{ width: '100%', border: 'none', backgroundColor: 'transparent', color: '#FFF', padding: '16px', minHeight: '60px', maxHeight: '150px', resize: 'vertical', outline: 'none', fontSize: '15px', fontFamily: 'inherit' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={!inputText.trim() || loading}
            style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: inputText.trim() && !loading ? '#D4AF37' : '#374151', color: inputText.trim() && !loading ? '#000' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: inputText.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s' }}
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
