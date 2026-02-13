import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CreditCard, Shield, Zap, Globe, ArrowRight } from "lucide-react";

const features = [
  { icon: Shield, title: "Bank-Grade Security", desc: "Military-grade encryption protects every transaction." },
  { icon: Zap, title: "Instant Transfers", desc: "Move money in milliseconds, not days." },
  { icon: Globe, title: "Global Access", desc: "Send and receive from anywhere in the world." },
  { icon: CreditCard, title: "Smart Wallet", desc: "Track spending, manage budgets, earn rewards." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <header className="relative py-20 px-4 md:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-bounce">
            <Zap className="w-4 h-4" />
            Next-Gen Payment Infrastructure
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight">
            MY<span className="text-primary">BANK</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The most secure, lightning-fast financial platform for the modern era.
            Transfer funds globally with zero friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 shadow-primary-glow">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:shadow-primary-glow transition-all">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 text-center text-muted-foreground text-sm">
        <p>© 2026 MyBank. All rights reserved.</p>
      </footer>
    </div>
  );
}
