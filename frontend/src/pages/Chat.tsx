import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { MinecraftHeading } from "@/components/MinecraftHeading";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

const MAX_PROMPT_LENGTH = 2000;

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [chatApiUrl, setChatApiUrl] = useState<string>("");

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/config.json");
        if (response.ok) {
          const config = await response.json();
          if (config.localapi) {
            setChatApiUrl(config.localapi);
          }
        }
      } catch (error) {
        console.error("Failed to load config:", error);
      }
    };
    loadConfig();
  }, []);

  const examplePrompts = [
    "What are the latest programming trends?",
    "Help me understand AI and machine learning",
    "How do I optimize my code for performance?"
  ];

  const typeMessage = async (messageId: number, fullText: string) => {
    setTypingMessageId(messageId);
    for (let i = 0; i < fullText.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 10));
      setMessages(prev =>
        prev.map((msg, idx) =>
          idx === messageId
            ? { ...msg, content: fullText.slice(0, i + 1) }
            : msg
        )
      );
    }
    setTypingMessageId(null);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!chatApiUrl) {
      alert("Chat API URL not loaded. Please refresh the page.");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const promptText = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${chatApiUrl}chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText
        })
      });

      const data = await response.json();
      
      let responseText = "";
      if (response.ok && data.success) {
        responseText = data.response || "[empty]";
      } else {
        responseText = `Error: ${data.error || response.statusText}`;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      const newMessageId = messages.length + 1;
      await typeMessage(newMessageId, responseText);
      
    } catch (error) {
      console.error("Chat error:", error);
      const errorText = `Server error: ${error instanceof Error ? error.message : "Unknown error"}`;
      
      const errorMessage: Message = {
        role: "assistant",
        content: "",
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      
      const newMessageId = messages.length + 1;
      await typeMessage(newMessageId, errorText);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleInputChange = (e: any) => {
    const text = e.target.value;
    if (text.length <= MAX_PROMPT_LENGTH) {
      setInput(text);
    }
  };

  const parseMarkdown = (text: string) => {
    const elements: any[] = [];
    let lastIndex = 0;

    const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }

      if (match[1]) {
        elements.push(
          <strong key={match.index} className="font-bold">
            {match[1]}
          </strong>
        );
      } else if (match[2]) {
        elements.push(
          <em key={match.index} className="italic">
            {match[2]}
          </em>
        );
      } else if (match[3]) {
        elements.push(
          <code
            key={match.index}
            className="bg-muted-foreground/20 px-1.5 py-0.5 rounded font-mono text-sm"
          >
            {match[3]}
          </code>
        );
      } else if (match[4]) {
        elements.push(
          <del key={match.index} className="line-through">
            {match[4]}
          </del>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements.length > 0 ? elements : text;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="pixel-border p-8 text-center max-w-md">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign in to Chat</h3>
          <p className="text-muted-foreground">Please log in to access the chat assistant.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <Card className="pixel-border flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <MinecraftHeading className="text-lg flex items-center gap-2">
              <img src="/mooshroom.png" alt="Mooshroom" className="h-6 w-6" />
              Mooshroom
            </MinecraftHeading>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <MessageSquare className="h-16 w-16 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Start a conversation with Mooshroom</h3>
                  <p className="text-muted-foreground mb-6">
                    Ask any question about technology or programming
                  </p>
                  <div className="space-y-2 max-w-lg mx-auto">
                    {examplePrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full text-left justify-start h-auto py-3 px-4"
                        onClick={() => handleExampleClick(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {parseMarkdown(message.content)}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2 flex-col">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {input.length} / {MAX_PROMPT_LENGTH}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
