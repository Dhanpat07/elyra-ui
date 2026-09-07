import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Sparkles, Database, Zap, Rocket, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string; // CSS selector for highlighting
}

const DEFAULT_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to LAALI AI! 👋",
    description: "Let us show you around. We'll help you discover AI agents that can transform your business in just 60 seconds.",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
  },
  {
    id: "connect",
    title: "Step 1: Connect Your Data",
    description: "Integrate your CRM, helpdesk, or knowledge base. We support Salesforce, Zendesk, Freshdesk, and 50+ more.",
    icon: <Database className="w-6 h-6 text-cyan-400" />,
  },
  {
    id: "choose",
    title: "Step 2: Choose a Personality",
    description: "Select from pre-built AI personalities or customize your own. Professional, friendly, or industry-specific.",
    icon: <Zap className="w-6 h-6 text-purple-400" />,
  },
  {
    id: "deploy",
    title: "Step 3: Deploy & Go Live",
    description: "One click to deploy. Your AI agent starts handling calls immediately with 24/7 availability.",
    icon: <Rocket className="w-6 h-6 text-primary" />,
  },
  {
    id: "complete",
    title: "You're All Set! 🎉",
    description: "Start with 100 free voice minutes. No credit card required. Let's create your first AI agent!",
    icon: <Check className="w-6 h-6 text-green-400" />,
  },
];

interface OnboardingTourProps {
  steps?: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string;
}

export function OnboardingTour({
  steps = DEFAULT_STEPS,
  onComplete,
  onSkip,
  storageKey = "laali-onboarding-complete",
}: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      // Small delay before showing tour
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
    onSkip?.();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={handleSkip}
      />

      {/* Tour Card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in zoom-in-95 fade-in duration-300">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Step indicator */}
            <div className="text-xs text-muted-foreground mb-4">
              Step {currentStep + 1} of {steps.length}
            </div>

            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple/20 border border-primary/30 flex items-center justify-center mb-4">
              {step.icon}
            </div>

            {/* Content */}
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pb-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === currentStep
                    ? "w-6 bg-primary"
                    : index < currentStep
                    ? "w-1.5 bg-primary/50"
                    : "w-1.5 bg-muted"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button
                variant="hero"
                size="sm"
                onClick={handleNext}
                className="gap-1"
              >
                {isLastStep ? "Get Started" : "Next"}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to control tour programmatically
export function useOnboardingTour(storageKey = "laali-onboarding-complete") {
  const [showTour, setShowTour] = useState(false);

  const resetTour = () => {
    localStorage.removeItem(storageKey);
    setShowTour(true);
  };

  const completeTour = () => {
    localStorage.setItem(storageKey, "true");
    setShowTour(false);
  };

  const isCompleted = () => {
    return localStorage.getItem(storageKey) === "true";
  };

  return {
    showTour,
    setShowTour,
    resetTour,
    completeTour,
    isCompleted,
  };
}

export default OnboardingTour;
