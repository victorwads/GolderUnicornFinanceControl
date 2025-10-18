import { ArrowLeft, Bot, User as UserIcon, Code, Settings } from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ScrollArea } from "@components/ui/scroll-area";
import { cn } from "@lib/utils";

interface AICallsProps {
  model: AICallsViewModel;
}

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.type === "user";
  const isSystem = message.type === "system";
  const isTool = message.type === "tool";
  const isAssistant = message.type === "assistant";

  // Try to parse JSON for better display
  let displayContent = message.content;
  let isJson = false;
  try {
    const parsed = JSON.parse(message.content);
    displayContent = JSON.stringify(parsed, null, 2);
    isJson = true;
  } catch {
    // Not JSON, use as is
  }

  // System messages are full width, centered
  if (isSystem) {
    return (
      <div className="flex justify-center mb-4 animate-fade-in">
        <div className="w-full bg-muted/50 rounded-xl px-4 py-2.5 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs h-5">
              SYSTEM
            </Badge>
            {message.timestamp && (
              <span className="text-xs text-muted-foreground">{message.timestamp}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{displayContent}</p>
        </div>
      </div>
    );
  }

  // User and tool messages on the left, assistant on the right
  const isLeft = isUser || isTool;

  return (
    <div className={cn(
      "flex gap-3 mb-4 animate-fade-in",
      !isLeft && "flex-row-reverse"
    )}>
      {/* Avatar */}
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
        isUser && "bg-primary",
        isAssistant && "bg-accent",
        isTool && "bg-secondary"
      )}>
        {isUser && <UserIcon className="h-4 w-4 text-primary-foreground" />}
        {isAssistant && <Bot className="h-4 w-4 text-accent-foreground" />}
        {isTool && <Code className="h-4 w-4 text-secondary-foreground" />}
      </div>

      {/* Message Bubble */}
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-2.5 break-words",
        isUser && "bg-primary text-primary-foreground rounded-tl-sm",
        isAssistant && "bg-accent/50 text-foreground rounded-tr-sm",
        isTool && "bg-secondary/50 text-foreground rounded-tl-sm"
      )}>
        {/* Type Badge */}
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs h-5">
            {message.type.toUpperCase()}
          </Badge>
          {message.timestamp && (
            <span className="text-xs opacity-60">{message.timestamp}</span>
          )}
        </div>

        {/* Content */}
        {isJson ? (
          <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
            {displayContent}
          </pre>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
        )}
      </div>
    </div>
  );
};

export default function AICalls({ model }: AICallsProps) {
  const { navigate, selectedConversation, setSelectedConversation, conversations } = model;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(new ToHomeRoute())}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Calls</h1>
                <p className="text-sm text-muted-foreground">Visualize os registros completos das execuções do assistente</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {selectedConversation.model}
            </Badge>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
          {/* Conversations List */}
          <div className="border-r border-border bg-card lg:col-span-1">
            <div className="p-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Conversas</h2>
            </div>
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors",
                      selectedConversation.id === conv.id
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {conv.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conv.model}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>R$ {conv.cost.toFixed(4)}</span>
                      <span>•</span>
                      <span>{conv.timestamp.split(",")[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col bg-background min-h-0">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <h3 className="font-semibold text-foreground">{selectedConversation.title}</h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>Tokens: {selectedConversation.tokensIn}↓ {selectedConversation.tokensOut}↑</span>
                <span>Custo: R$ {selectedConversation.cost.toFixed(4)}</span>
                <span>{selectedConversation.timestamp}</span>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-4xl mx-auto space-y-2">
                {selectedConversation.messages.length === 0 ? (
                  <p className="text-center text-muted-foreground">Nenhuma mensagem encontrada</p>
                ) : (
                  selectedConversation.messages.map((message, index) => (
                    <MessageBubble key={index} message={message} />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface Message {
  type: "system" | "user" | "assistant" | "tool";
  content: string;
  timestamp?: string;
  toolCallId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  cost: number;
  tokensIn: number;
  tokensOut: number;
  timestamp: string;
  messages: Message[];
}

export interface AICallsViewModel {
  navigate: (route: AICallsRoute) => void;
  selectedConversation: Conversation;
  setSelectedConversation: (conversation: Conversation) => void;
  conversations: Conversation[];
}

// Navigation Routes
export class AICallsRoute {}

export class ToHomeRoute extends AICallsRoute {}
