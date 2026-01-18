 
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowUp, 
  Paperclip, 
  Globe, 
  ChevronDown,
  Sparkles,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  X,
  ArrowLeft,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { chatWithOpenRouter, OPENROUTER_MODELS, type OpenRouterMessage} from "@/services/ai-api";
import { logger } from "@/services/logger";
import { useToast } from "@/components/ui/use-toast";

// ============================================
// CONSTANTS
// ============================================
const SUGGESTIONS = [
  "Explain quantum entanglement simply",
  "Generate a creative app name for task management",
  "Translate 'Better late than never' into Latin",
  "Write a short riddle with the answer 'time'"
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  isWebSearch?: boolean;
}

// ============================================
// MODEL SELECTOR DROPDOWN
// ============================================
const ModelDropdown = ({ 
  selectedModel, 
  onSelect, 
  isOpen, 
  onToggle 
}: { 
  selectedModel: string; 
  onSelect: (modelId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const selected = OPENROUTER_MODELS.find(m => m.id === selectedModel);
  
  return (
    <div className="relative">
      <button 
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm"
      >
        <Sparkles size={12} />
        {selected?.name || 'Select Model'}
        <ChevronDown size={10} className={cn("text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-2 max-h-[300px] overflow-y-auto">
              <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select AI Model</p>
              {OPENROUTER_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelect(model.id);
                    onToggle();
                  }}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-xl text-left transition-colors flex items-center justify-between",
                    selectedModel === model.id 
                      ? "bg-black text-white" 
                      : "text-gray-700"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{model.name}</p>
                    <p className={cn("text-[10px]", selectedModel === model.id ? "text-gray-300" : "text-gray-400")}>
                      {model.provider}
                    </p>
                  </div>
                  {selectedModel === model.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// MAIN COMPONENT - FULL PAGE
// ============================================
export default function DashboardAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Send message to OpenRouter API
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      isWebSearch: webSearchEnabled,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    try {
      // Build system prompt - include web search context if enabled
      let systemPrompt = 'You are a helpful, creative, and knowledgeable AI assistant. Be concise but thorough.';
      
      if (webSearchEnabled) {
        systemPrompt += ` The user has enabled web search mode. When answering, act as if you have access to current web information. 
        Format your answers with relevant sources and be more detailed about current events, news, or real-time data.
        Include hypothetical URLs in markdown format [source](url) to simulate web references.`;
      }

      // Build conversation history for API
      const apiMessages: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user', content: content.trim() }
      ];

      const response = await chatWithOpenRouter(apiMessages, selectedModel);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.choices[0]?.message?.content || 'No response received.',
        timestamp: new Date(),
        model: selectedModel,
        isWebSearch: webSearchEnabled,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: webSearchEnabled ? "Web Search Complete" : "Response received",
        description: `From ${OPENROUTER_MODELS.find(m => m.id === selectedModel)?.name}`,
      });
    } catch (error) {
      logger.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to communicate with AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, selectedModel, isLoading, toast, webSearchEnabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // File attachment handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files]);
      toast({
        title: "File attached",
        description: `${files.length} file(s) added. Note: File content is not sent to AI yet.`,
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle web search
  const toggleWebSearch = () => {
    setWebSearchEnabled(prev => !prev);
    toast({
      title: webSearchEnabled ? "Web Search Disabled" : "Web Search Enabled",
      description: webSearchEnabled 
        ? "AI will use its training data only" 
        : "AI will simulate web search responses with current information style",
    });
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "Conversation has been reset.",
    });
  };

  // Copy message
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    });
  };

  // Regenerate last response
  const regenerateLastResponse = () => {
    if (messages.length < 2) return;
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setMessages(prev => prev.slice(0, -1));
      sendMessage(lastUserMessage.content);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white font-sans text-gray-900 overflow-hidden z-50">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-r from-yellow-100/30 via-orange-100/20 to-pink-100/30 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Header - Minimalist */}
      <div className="relative z-20 p-4 md:p-6 flex justify-between items-center border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <Link 
            to="/dashboard" 
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </Link>
          <div className="flex items-center gap-2 font-bold text-base">
            <div className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <span>AURION AI</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="p-2 text-gray-400 rounded-xl"
              title="Clear chat"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area or Empty State with Centered Input */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {messages.length > 0 ? (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-48">
            {messages.map((m, i) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", m.role === 'user' ? "justify-end" : "justify-start")}
              >
                {m.role === 'assistant' && (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg text-white",
                    m.isWebSearch 
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500" 
                      : "bg-gradient-to-br from-purple-500 to-pink-500"
                  )}>
                    {m.isWebSearch ? <Search size={14} /> : <Sparkles size={14} />}
                  </div>
                )}
                <div className="flex flex-col max-w-[80%]">
                  {m.isWebSearch && m.role === 'user' && (
                    <span className="text-[10px] text-blue-500 font-medium mb-1 flex items-center gap-1">
                      <Globe size={10} /> Web Search
                    </span>
                  )}
                  <div className={cn(
                    "px-5 py-3.5 text-[15px] leading-relaxed shadow-sm",
                    m.role === 'user' 
                      ? "bg-black text-white rounded-[24px] rounded-br-lg" 
                      : "bg-white border border-gray-100 text-gray-800 rounded-[24px] rounded-bl-lg"
                  )}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                  
                  {/* Message actions */}
                  {m.role === 'assistant' && (
                    <div className="flex gap-1 mt-2 ml-1">
                      <button 
                        onClick={() => copyMessage(m.content)}
                        className="p-1.5 text-gray-400 rounded-lg"
                        title="Copy"
                      >
                        <Copy size={14} />
                      </button>
                      {i === messages.length - 1 && (
                        <button 
                          onClick={regenerateLastResponse}
                          className="p-1.5 text-gray-400 rounded-lg"
                          title="Regenerate"
                        >
                          <RefreshCw size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                  webSearchEnabled 
                    ? "bg-gradient-to-br from-blue-500 to-cyan-500" 
                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                )}>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                </div>
                <div className="px-5 py-3.5 bg-white border border-gray-100 rounded-[24px] rounded-bl-lg shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>{webSearchEnabled ? "Searching the web..." : "Thinking..."}</span>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">
                      {OPENROUTER_MODELS.find(m => m.id === selectedModel)?.name}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* Empty State - CENTERED with Prompt */
          <div className="h-full flex flex-col items-center justify-center px-4 -mt-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center w-full max-w-2xl"
            >
              <h1 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight text-gray-900">
                What can I help with?
              </h1>
              <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto mb-10">
                Ask me anything. I can help with code, writing, analysis, creative projects, and more.
              </p>

              {/* ========== INPUT AREA - CENTERED ========== */}
              <div className="w-full max-w-[640px] mx-auto">
                {/* Attachments preview */}
                {attachments.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap justify-center">
                    {attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
                        <Paperclip size={12} />
                        <span className="max-w-[150px] truncate">{file.name}</span>
                        <button onClick={() => removeAttachment(i)} className="text-gray-400">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="bg-white rounded-[28px] shadow-xl border border-gray-200 p-2 ring-4 ring-gray-100/50">
                  <form onSubmit={handleSubmit}>
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask AI anything..."
                      className="w-full px-4 py-3 bg-transparent border-none resize-none focus:outline-none text-[15px] placeholder:text-gray-400 min-h-[56px] max-h-[200px]"
                      rows={1}
                      disabled={isLoading}
                    />
                    
                    <div className="flex items-center justify-between px-2 pb-1">
                      <div className="flex items-center gap-2">
                        <ModelDropdown 
                          selectedModel={selectedModel}
                          onSelect={setSelectedModel}
                          isOpen={isModelDropdownOpen}
                          onToggle={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        />
                        <button 
                          type="button" 
                          onClick={toggleWebSearch}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                            webSearchEnabled 
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                              : "bg-white border border-gray-200 text-gray-600"
                          )}
                          title="Toggle Web Search"
                        >
                          <Globe size={14} />
                          <span className="hidden sm:inline">{webSearchEnabled ? "Web Search ON" : "Deep Search"}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          onChange={handleFileSelect}
                          multiple
                        />
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 rounded-full text-gray-400"
                          title="Attach file"
                        >
                          <Paperclip size={18} />
                        </button>
                        <button 
                          type="submit"
                          disabled={(!input.trim() && attachments.length === 0) || isLoading}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            (input.trim() || attachments.length > 0) && !isLoading
                              ? "bg-black text-white shadow-lg" 
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={3} />}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Suggestions - NOW HIGHER */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6"
                >
                  <p className="text-xs font-semibold text-gray-400 mb-3 text-center">Examples of queries:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="px-4 py-2 bg-white/60 border border-gray-200/50 rounded-full text-sm text-gray-600 backdrop-blur-sm"
                      >
                        {suggestion} ›
                      </button>
                    ))}
                  </div>
                </motion.div>
                
                {/* Model indicator */}
                <p className="text-center text-[11px] text-gray-400 mt-6">
                  Using <span className="font-medium">{OPENROUTER_MODELS.find(m => m.id === selectedModel)?.name}</span> via OpenRouter
                  {webSearchEnabled && <span className="ml-2 text-blue-500">• Web Search Active</span>}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Input Area - Only shown when there ARE messages (fixed at bottom) */}
      {messages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-white via-white to-transparent pt-8">
          <div className="max-w-3xl mx-auto">
            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
                    <Paperclip size={12} />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button onClick={() => removeAttachment(i)} className="text-gray-400 hover:text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="bg-white rounded-[28px] shadow-xl border border-gray-200 p-2 ring-4 ring-gray-100/50">
              <form onSubmit={handleSubmit}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Continue the conversation..."
                  className="w-full px-4 py-3 bg-transparent border-none resize-none focus:outline-none text-[15px] placeholder:text-gray-400 min-h-[56px] max-h-[200px]"
                  rows={1}
                  disabled={isLoading}
                />
                
                <div className="flex items-center justify-between px-2 pb-1">
                  <div className="flex items-center gap-2">
                    <ModelDropdown 
                      selectedModel={selectedModel}
                      onSelect={setSelectedModel}
                      isOpen={isModelDropdownOpen}
                      onToggle={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    />
                    <button 
                      type="button" 
                      onClick={toggleWebSearch}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        webSearchEnabled 
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                      title="Toggle Web Search"
                    >
                      <Globe size={14} />
                      <span className="hidden sm:inline">{webSearchEnabled ? "ON" : "Search"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      onChange={handleFileSelect}
                      multiple
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                      title="Attach file"
                    >
                      <Paperclip size={18} />
                    </button>
                    <button 
                      type="submit"
                      disabled={(!input.trim() && attachments.length === 0) || isLoading}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        (input.trim() || attachments.length > 0) && !isLoading
                          ? "bg-black text-white shadow-lg" 
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={3} />}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer Links - Hidden on mobile and when there are messages */}
      {messages.length === 0 && (
        <div className="absolute bottom-4 right-6 text-[11px] text-gray-400 flex gap-4 z-10 font-medium hidden md:flex">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/help">Help</Link>
        </div>
      )}
    </div>
  );
}
