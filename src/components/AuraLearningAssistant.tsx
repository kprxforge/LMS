import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Bot, Award, Trophy, BookOpen, Clock, Target, Calendar, User, Lightbulb, Zap, HelpCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'aura';
  text: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: '📚 My Courses', prompt: 'Show my enrolled courses' },
  { label: '🔥 Recommended Courses', prompt: 'Recommend new courses for me' },
  { label: '📈 My Progress', prompt: 'Check my study progress and stats' },
  { label: '📝 Upcoming Quiz', prompt: 'Tell me about upcoming quizzes' },
  { label: '🎯 Daily Goal', prompt: 'What is my daily learning goal?' },
  { label: '🏆 Certificates', prompt: 'Show my earned certificates' },
  { label: '💡 Explain a Topic', prompt: 'List difficult topics to explain' },
  { label: '📅 Study Planner', prompt: 'Show my study planner calendar' },
  { label: '🤖 Ask Anything', prompt: 'How can you help me?' }
];

export function AuraLearningAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState<number>(0);
  
  const { user } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load enrolled course count
  useEffect(() => {
    apiFetch('/api/courses')
      .then(r => r.json())
      .then(data => {
        const enrolled = data.filter((c: any) => c.progress !== undefined);
        setEnrolledCount(enrolled.length);
      })
      .catch(() => {});
  }, []);

  // Initialize with greeting
  useEffect(() => {
    if (user) {
      const studentName = user.name || 'Student';
      const greeting = `Hello ${studentName} 👋\n\nWelcome back!\n\nYou are currently enrolled in ${enrolledCount || 2} course(s).\n\nToday's Goal:\nComplete 1 lesson and attempt today's quiz.\n\nNeed any help? I'm here to assist you.`;
      setMessages([
        {
          id: 'greeting',
          sender: 'aura',
          text: greeting,
          timestamp: new Date()
        }
      ]);
    }
  }, [user, enrolledCount]);

  // Auto scroll to bottom when message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Build conversation history for API
      const history = messages
        .filter(m => m.id !== 'greeting') // Skip system greeting
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const response = await apiFetch('/api/gemini/chat', {
        method: 'POST',
        body: {
          message: textToSend,
          history
        }
      });

      const data = await response.json();
      
      const auraMsg: Message = {
        id: `msg-${Date.now()}-aura`,
        sender: 'aura',
        text: data.text || 'Sorry, I encountered an issue processing your query.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, auraMsg]);
    } catch (err) {
      console.error(err);
      const auraMsg: Message = {
        id: `msg-${Date.now()}-aura`,
        sender: 'aura',
        text: 'Sorry, I am having trouble connecting to the learning grid right now. Let me know if you would like to test other study activities!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, auraMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedMessage = (text: string) => {
    const blocks = text.split(/\n\n+/);
    return (
      <div className="space-y-3 font-bold text-sm tracking-wide text-black">
        {blocks.map((block, idx) => {
          const trimmed = block.trim();
          if (!trimmed) return null;

          // Headers
          if (trimmed.startsWith('#')) {
            const cleanText = trimmed.replace(/^#+\s*/, '');
            return (
              <h3 key={idx} className="text-base font-black uppercase tracking-wider text-black border-b-2 border-black pb-1 mt-4 mb-1">
                {cleanText}
              </h3>
            );
          }

          // Lists
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const items = trimmed.split(/\n[•\-*]\s*/).map(item => item.replace(/^[•\-*]\s*/, ''));
            return (
              <ul key={idx} className="list-none space-y-1.5 pl-1">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-neo-accent font-black text-lg leading-tight shrink-0">▪</span>
                    <span className="leading-relaxed">{parseInlineBold(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          // Code blocks
          if (trimmed.startsWith('```')) {
            const lines = trimmed.split('\n');
            const code = lines.slice(1, lines.length - 1).join('\n');
            return (
              <pre key={idx} className="bg-black text-green-400 p-4 font-mono text-xs overflow-x-auto border-4 border-black neo-shadow-sm my-3 rotate-[0.5deg] select-all">
                <code>{code}</code>
              </pre>
            );
          }

          // Plain text with list splits inside
          const lines = trimmed.split('\n');
          if (lines.length > 1 && lines.some(l => l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('*') || /^\d+\./.test(l.trim()))) {
            return (
              <div key={idx} className="space-y-1.5">
                {lines.map((line, lIdx) => {
                  const lineTrim = line.trim();
                  const isListItem = lineTrim.startsWith('•') || lineTrim.startsWith('-') || lineTrim.startsWith('*') || /^\d+\./.test(lineTrim);
                  return (
                    <div key={lIdx} className={isListItem ? "flex items-start gap-2 pl-1 py-0.5" : "py-0.5"}>
                      {isListItem && <span className="text-neo-accent font-black text-lg leading-tight shrink-0">▪</span>}
                      <span>{parseInlineBold(lineTrim.replace(/^[•\-*\d.]+\s*/, ''))}</span>
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
            <p key={idx} className="leading-relaxed">
              {parseInlineBold(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const parseInlineBold = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-black text-black bg-neo-accent/25 px-1">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Chat Icon - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-[100] pointer-events-auto">
        <motion.button
          id="aura-chat-toggle-btn"
          whileHover={{ scale: 1.1, rotate: -3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-neo-accent text-black border-4 border-black neo-shadow-sm flex items-center justify-center cursor-pointer rounded-none group select-none relative"
          aria-label="Open AURA Assistant"
        >
          <Sparkles className="w-8 h-8 group-hover:scale-110 transition-transform text-black" strokeWidth={2.5} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white font-black text-[10px] px-1.5 py-0.5 border-2 border-black uppercase rotate-[10deg] tracking-wider select-none">
            A.I.
          </span>
        </motion.button>
      </div>

      {/* Sliding Panel Overlay & Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-[150] transition-opacity cursor-pointer"
            />

            {/* Sliding Panel from Right */}
            <motion.div
              id="aura-chat-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-white text-black border-l-8 border-black z-[200] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-neo-secondary border-b-4 border-black p-6 flex items-center justify-between relative shrink-0">
                <div className="flex items-center gap-3">
                  <div className="border-2 border-black p-1.5 bg-white neo-shadow-sm rotate-[-2deg] shrink-0">
                    <Bot className="w-8 h-8 text-black" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="font-black text-xl tracking-tight uppercase text-black flex items-center gap-2">
                      🎓 AURA Learning Assistant
                    </h2>
                    <p className="text-xs font-black uppercase tracking-widest text-black bg-white border-2 border-black inline-block px-1.5 py-0.5 rotate-[1deg] mt-1">
                      Your Personal AI Study Companion
                    </p>
                  </div>
                </div>
                
                <button
                  id="aura-chat-close-btn"
                  onClick={() => setIsOpen(false)}
                  className="border-4 border-black bg-white hover:bg-neo-accent p-1.5 transition-colors cursor-pointer text-black"
                >
                  <X className="w-5 h-5" strokeWidth={3} />
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neo-muted/5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
                  >
                    {msg.sender === 'aura' && (
                      <div className="w-8 h-8 border-2 border-black bg-neo-secondary flex items-center justify-center shrink-0 rotate-[-4deg] neo-shadow-sm">
                        <Bot className="w-5 h-5 text-black" strokeWidth={2.5} />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[85%] border-4 border-black p-4 neo-shadow-sm rotate-[0.5deg] ${
                        msg.sender === 'user'
                          ? 'bg-neo-accent text-black rotate-[-0.5deg]'
                          : 'bg-white text-black'
                      }`}
                    >
                      {msg.sender === 'aura' ? (
                        renderFormattedMessage(msg.text)
                      ) : (
                        <p className="font-bold text-sm tracking-wide leading-relaxed">{msg.text}</p>
                      )}
                      
                      <div className="mt-2 text-[10px] font-black text-black/55 uppercase tracking-wider text-right select-none">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 border-2 border-black bg-neo-accent flex items-center justify-center shrink-0 rotate-[4deg] neo-shadow-sm">
                        <User className="w-5 h-5 text-black" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {loading && (
                  <div className="flex justify-start items-start gap-3">
                    <div className="w-8 h-8 border-2 border-black bg-neo-secondary flex items-center justify-center shrink-0 rotate-[-4deg] animate-bounce">
                      <Bot className="w-5 h-5 text-black" strokeWidth={2.5} />
                    </div>
                    <div className="border-4 border-black p-4 bg-white neo-shadow-sm flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-black rounded-none animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2.5 h-2.5 bg-black rounded-none animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2.5 h-2.5 bg-black rounded-none animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Quick Actions Panel */}
              <div className="px-6 py-4 border-t-4 border-black bg-white shrink-0">
                <p className="text-xs font-black uppercase tracking-widest text-black/60 mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" strokeWidth={3} /> Quick Study Actions:
                </p>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleSendMessage(action.prompt)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-[var(--color-card)] hover:bg-neo-secondary border-2 border-black text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:neo-shadow-sm cursor-pointer active:translate-y-0 text-black select-none"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="p-6 border-t-4 border-black bg-neo-secondary/15 flex items-center gap-3 shrink-0"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your coding or course query..."
                    className="w-full bg-white border-4 border-black py-3.5 pl-4 pr-12 text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:bg-neo-secondary/30 focus:neo-shadow-sm transition-all"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputText.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-neo-accent border-2 border-transparent hover:border-black transition-all cursor-pointer text-black disabled:opacity-45 disabled:pointer-events-none"
                  >
                    <Send className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
