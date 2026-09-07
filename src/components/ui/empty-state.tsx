import { 
  FileText, 
  CreditCard, 
  BarChart3, 
  Inbox, 
  Search,
  Plus,
  Sparkles,
  Rocket,
  MessageSquare,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "hero" | "outline";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// Base empty state component
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center",
      className
    )}>
      {/* Animated icon container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-purple/20 border border-primary/30 flex items-center justify-center">
          {icon || <Inbox className="w-10 h-10 text-primary" />}
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      
      <div className="flex items-center gap-3">
        {action && (
          <Button 
            variant={action.variant || "hero"} 
            onClick={action.onClick}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button 
            variant="outline" 
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Pre-built empty states for common scenarios

export function NoInvoicesState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="w-10 h-10 text-primary" />}
      title="No invoices yet"
      description="Your invoices will appear here once you make your first payment or upgrade your plan."
      action={onAction ? {
        label: "View Plans",
        onClick: onAction,
      } : undefined}
    />
  );
}

export function NoPaymentMethodsState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<CreditCard className="w-10 h-10 text-primary" />}
      title="No payment methods"
      description="Add a payment method to enable automatic billing and unlock premium features."
      action={onAction ? {
        label: "Add Payment Method",
        onClick: onAction,
      } : undefined}
    />
  );
}

export function NoUsageDataState() {
  return (
    <EmptyState
      icon={<BarChart3 className="w-10 h-10 text-primary" />}
      title="No usage data yet"
      description="Start using LAALI Voice AI to see your usage statistics and analytics here."
      action={{
        label: "Create Your First Agent",
        onClick: () => {},
      }}
    />
  );
}

export function NoSearchResultsState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={<Search className="w-10 h-10 text-muted-foreground" />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
      action={{
        label: "Clear Search",
        onClick: onClear,
        variant: "outline",
      }}
    />
  );
}

export function NoAgentsState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles className="w-10 h-10 text-primary" />}
      title="No AI agents yet"
      description="Create your first AI voice agent in minutes. Connect your data, choose a personality, and deploy."
      action={onAction ? {
        label: "Create Agent",
        onClick: onAction,
      } : undefined}
    />
  );
}

export function NoCallsState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Phone className="w-10 h-10 text-primary" />}
      title="No calls recorded"
      description="Your call history and recordings will appear here once your AI agent starts handling calls."
      action={onAction ? {
        label: "Test Your Agent",
        onClick: onAction,
      } : undefined}
    />
  );
}

export function NoConversationsState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="w-10 h-10 text-primary" />}
      title="No conversations yet"
      description="Chat transcripts and conversation history will be displayed here."
    />
  );
}

export function WelcomeState({ userName, onGetStarted }: { userName?: string; onGetStarted: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple/30 blur-3xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-gold-600 flex items-center justify-center shadow-glow-gold">
          <Rocket className="w-12 h-12 text-primary-foreground" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-foreground mb-2">
        Welcome{userName ? `, ${userName}` : ''}! 🎉
      </h2>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        You're just 3 minutes away from deploying your first AI voice agent. Let's get started!
      </p>
      
      <Button variant="hero" size="lg" onClick={onGetStarted} className="gap-2 shadow-glow-gold">
        <Sparkles className="w-5 h-5" />
        Start Building
      </Button>
      
      {/* Quick stats */}
      <div className="flex items-center gap-8 mt-12 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>100 free minutes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>1 free agent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>No credit card required</span>
        </div>
      </div>
    </div>
  );
}

// Error state
export function ErrorState({ 
  title = "Something went wrong",
  description = "We encountered an error loading this data. Please try again.",
  onRetry 
}: { 
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mb-6">
        <span className="text-4xl">😕</span>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
