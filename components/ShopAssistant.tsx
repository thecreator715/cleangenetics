import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Plus, X, Eye, Minus, ShoppingBag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Product } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { SEED_CATALOG } from '../constants';
import StrainArt from './StrainArt';

interface ShopAssistantProps {
  onAddToCart: (product: Product, quantity: number) => void;
  onViewProduct: (product: Product) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ProductSuggestionProps {
  product: Product;
  onAdd: (p: Product, q: number) => void;
  onView: (p: Product) => void;
}

// Sub-component to manage individual product quantity in chat
const ProductSuggestion: React.FC<ProductSuggestionProps> = ({ product, onAdd, onView }) => {
  const [qty, setQty] = useState(1);

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-4 group hover:border-emerald-500/50 transition-colors shadow-lg animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <StrainArt id={product.id} type={product.type} still glyph={0.7} className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-base font-bold text-white leading-tight">{product.name}</span>
            <span className="text-xs text-emerald-500 font-mono mt-1">${product.price} / seed</span>
          </div>
        </div>
        <button 
           onClick={() => onView(product)}
           className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
           title="View Full Details"
        >
           <Eye className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-black/40 rounded-lg p-1.5 border border-zinc-800/50">
          <div className="flex items-center flex-1 min-w-[100px]">
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center text-sm font-bold text-white font-mono">{qty}</span>
              <button 
                onClick={() => setQty(qty + 1)}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
          </div>
          
          <button 
            onClick={() => onAdd(product, qty)}
            className="flex-1 min-w-[100px] bg-emerald-500 hover:bg-emerald-400 text-black h-8 px-4 rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 whitespace-nowrap"
          >
             Add <ShoppingBag className="w-3 h-3" />
          </button>
      </div>
    </div>
  );
};

const ShopAssistant: React.FC<ShopAssistantProps> = ({ onAddToCart, onViewProduct, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "I am actively scanning the collection. Looking for a heavy Indica for sleep or an energetic Sativa? Let me guide you.",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(messages, input);
      setMessages(prev => [...prev, {
        role: 'model',
        text: responseText,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getMentionedProducts = (text: string): Product[] => {
    return SEED_CATALOG.filter(product => 
      text.toLowerCase().includes(product.name.toLowerCase())
    );
  };

  // Visibility classes
  // Desktop: Fixed right, slide in/out width (Wider 500px)
  // Mobile: Fixed top, slide down/up height (Drawer style)
  const containerClasses = `
    fixed z-[60] glass-strong transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]
    lg:top-3 lg:right-3 lg:h-[calc(100%-1.5rem)] lg:rounded-[2rem]
    ${isOpen ? 'lg:translate-x-0' : 'lg:translate-x-[110%] pointer-events-none'}
    lg:w-[500px]
    
    max-lg:inset-x-2 max-lg:top-2 max-lg:h-[85vh] max-lg:rounded-[2rem]
    ${isOpen ? 'max-lg:translate-y-0' : 'max-lg:-translate-y-[110%]'}
  `;

  return (
    <>
      {/* Overlay for mobile when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <div className={containerClasses}>
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
            <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-300 to-teal-500 blur-md rounded-full animate-pulse opacity-70" />
                  <span className="relative z-10 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center"><Bot className="w-5 h-5 text-[#04140e]" /></span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-wide">AI Budtender</h3>
                  <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-zinc-500 font-mono">LIVE ANALYSIS</span>
                  </div>
                </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
            {messages.map((msg, idx) => {
                const mentionedProducts = msg.role === 'model' ? getMentionedProducts(msg.text) : [];
                return (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[90%] text-sm p-4 rounded-2xl shadow-md ${
                        msg.role === 'user' 
                        ? 'bg-gradient-to-br from-emerald-600/80 to-teal-600/70 text-white rounded-tr-md border border-white/20' 
                        : 'bg-white/[0.06] border border-white/10 text-zinc-200 rounded-tl-md'
                    }`}>
                        {msg.role === 'model' ? <div className="md-body"><ReactMarkdown>{msg.text}</ReactMarkdown></div> : msg.text}
                    </div>

                    {/* Detected Product Quick Actions */}
                    {mentionedProducts.length > 0 && (
                        <div className="mt-4 flex flex-col gap-3 w-full max-w-[90%]">
                          {mentionedProducts.map(product => (
                              <ProductSuggestion 
                                key={product.id} 
                                product={product} 
                                onAdd={onAddToCart}
                                onView={onViewProduct}
                              />
                          ))}
                        </div>
                    )}
                  </div>
                );
            })}
            {isLoading && (
                <div className="flex items-center gap-3 text-emerald-300 text-xs px-4 py-2 bg-white/[0.05] rounded-full w-fit border border-white/10">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="animate-pulse tracking-wider font-mono">SYNTHESIZING RESPONSE...</span>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-white/[0.03]">
            <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Describe desired effects..."
                  className="w-full bg-white/[0.06] border border-white/10 rounded-full h-14 pl-5 pr-14 text-sm text-white transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 bottom-2 aspect-square btn-primary !p-0 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopAssistant;