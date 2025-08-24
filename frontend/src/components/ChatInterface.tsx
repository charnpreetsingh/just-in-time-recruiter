import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, ChevronDown, XCircle, Filter, Clock, TrendingDown } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface FilterAction {
  type: string;
  value: any;
}

interface ChatInterfaceProps {
  onFilterAction: (action: FilterAction) => void;
  onNewQuestion?: () => void;
}

// Define welcome message outside component to avoid recreating it on each render
const DEFAULT_WELCOME_MESSAGE: Message = {
  id: "welcome",
  content: "Hi! I can help you filter talent and companies. Try asking me things like 'Show me people from Google' or 'Find candidates with React experience who are approaching their average tenure'.",
  sender: 'ai' as const,
  timestamp: new Date()
};

export const ChatInterface = ({ onFilterAction, onNewQuestion }: ChatInterfaceProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // Use the constant welcome message to ensure consistent hook calls
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages when new message added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Focus input when chat opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Call onNewQuestion to reset search filters if provided
    if (onNewQuestion) {
      onNewQuestion();
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    // Process the user message to determine filter actions
    processMessage(input);
  };
  
  const processMessage = (message: string) => {
    // Simple rule-based processing
    const lowerMessage = message.toLowerCase();
    
    // Wait a moment to simulate processing
    setTimeout(() => {
      let responseContent = "";
      const actions: FilterAction[] = [];
      
      // Company filters
      const companyMatches = lowerMessage.match(/from\s+([a-z0-9\s]+)/i) || 
                            lowerMessage.match(/at\s+([a-z0-9\s]+)/i) ||
                            lowerMessage.match(/work(?:ing|ed)?\s+(?:at|for)\s+([a-z0-9\s]+)/i);
      
      if (companyMatches) {
        const company = companyMatches[1].trim();
        responseContent += `I'll filter for talent from ${company}. Switching to the Company Watch tab. `;
        actions.push({ type: 'company', value: company });
        // Auto-switch to Company Watch tab when searching for a company
        actions.push({ type: 'tab', value: 'companies' });
      }
      
      // Skill filters
      const skillMatches = lowerMessage.match(/with\s+([a-z0-9\s]+)\s+(?:skill|experience)/i) ||
                          lowerMessage.match(/who\s+know[s]?\s+([a-z0-9\s]+)/i);
      
      if (skillMatches) {
        const skill = skillMatches[1].trim();
        responseContent += `Looking for candidates with ${skill} skills. `;
        actions.push({ type: 'skill', value: skill });
      }
      
      // Layoff filters
      if (lowerMessage.includes("layoff") || lowerMessage.includes("laid off")) {
        responseContent += "Filtering for candidates affected by layoffs. ";
        actions.push({ type: 'layoff', value: true });
      }
      
      // Tenure filters
      if (lowerMessage.includes("tenure") || lowerMessage.includes("approaching average")) {
        responseContent += "Showing candidates approaching their average tenure. ";
        actions.push({ type: 'approaching_tenure', value: true });
      }
      
      // Sentiment filters
      if (lowerMessage.includes("sentiment") || lowerMessage.includes("low morale") || lowerMessage.includes("company issues")) {
        responseContent += "Filtering for candidates from companies with sentiment issues. ";
        actions.push({ type: 'sentiment_issues', value: true });
      }
      
      // Switch between tabs
      if (lowerMessage.includes("role") || lowerMessage.includes("job") || lowerMessage.includes("position")) {
        responseContent += "Switching to the Open Roles tab. ";
        actions.push({ type: 'tab', value: 'roles' });
      }
      
      if (lowerMessage.includes("company") || lowerMessage.includes("companies") || lowerMessage.includes("watch")) {
        responseContent += "Switching to the Company Watch tab. ";
        actions.push({ type: 'tab', value: 'companies' });
      }
      
      // Default response if no filters matched
      if (responseContent === "") {
        responseContent = "I'm not sure how to filter based on that. Try asking about specific companies, skills, layoffs, tenure, or sentiment issues.";
      } else {
        // Apply actions
        actions.forEach(action => onFilterAction(action));
      }
      
      // Add AI response
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        content: responseContent,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 800);
  };

  // Use the constant welcome message to ensure consistent object references
  const clearChat = () => {
    // Create a new welcome message with current timestamp
    const freshWelcome = {
      ...DEFAULT_WELCOME_MESSAGE,
      timestamp: new Date()
    };
    setMessages([freshWelcome]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-72 sm:w-80 md:w-96 shadow-lg border-primary/20 flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between bg-card p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="text-primary h-5 w-5" />
              <h3 className="font-medium">AI Assistant</h3>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearChat}>
                <XCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[60vh] sm:max-h-96 flex flex-col gap-3">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}
              >
                {msg.sender === 'ai' && (
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div 
                  className={`${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  } p-3 rounded-lg max-w-[80%]`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                {msg.sender === 'user' && (
                  <div className="bg-background border p-1 rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start items-center gap-2">
                <div className="bg-primary/10 p-1 rounded-full">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask me to find candidates..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isProcessing || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}
      
      {/* Quick filter chips removed */}
    </div>
  );
};