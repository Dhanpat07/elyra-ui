import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    onClick?: () => void;
    href?: string;
  };
  stats?: Array<{
    value: string;
    label: string;
    gradient?: "gold" | "purple" | "blue";
  }>;
  backgroundImage?: string;
}

const Hero = ({
  title = "We Build Your",
  subtitle = "AI Applications",
  description = "Custom AI chatbots, intelligent automation, and enterprise solutions tailored for your business. From concept to deployment, we handle everything.",
  primaryCTA = { text: "Get Started", href: "/auth" },
  secondaryCTA = { text: "Learn More", onClick: () => {} },
  stats = [
    { value: "100+", label: "AI Solutions Delivered", gradient: "gold" },
    { value: "24/7", label: "Support & Maintenance", gradient: "purple" },
    { value: "99.9%", label: "Uptime Guarantee", gradient: "gold" },
  ],
  backgroundImage,
}: HeroProps) => {
  const gradientClasses = {
    gold: "bg-gradient-gold bg-clip-text text-transparent",
    purple: "bg-gradient-purple bg-clip-text text-transparent",
    blue: "bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent",
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with mesh gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-mesh">
        {backgroundImage && (
          <img 
            src={backgroundImage} 
            alt="Background" 
            className="w-full h-full object-cover opacity-30"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background"></div>
      </div>

      {/* Floating orbs for depth */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Content */}
      <div className="container relative z-10 px-6 py-32 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-royal/10 border border-primary/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Enterprise AI Solutions</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
            {title}
            <span className="block bg-gradient-royal bg-clip-text text-transparent mt-2">
              {subtitle}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to={primaryCTA.href}>
              <Button 
                variant="hero" 
                size="lg"
                className="group shadow-glow-gold"
              >
                {primaryCTA.text}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            {secondaryCTA.href ? (
              <Link to={secondaryCTA.href}>
                <Button 
                  variant="hero-outline" 
                  size="lg"
                  className="shadow-glow-purple"
                >
                  {secondaryCTA.text}
                </Button>
              </Link>
            ) : (
              <Button 
                variant="hero-outline" 
                size="lg"
                className="shadow-glow-purple"
                onClick={secondaryCTA.onClick}
              >
                {secondaryCTA.text}
              </Button>
            )}
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50"
                >
                  <div className={`text-3xl font-bold ${gradientClasses[stat.gradient || "gold"]}`}>
                    {stat.value}
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
