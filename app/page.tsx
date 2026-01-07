import Link from "next/link";
import { ArrowRight, Shield, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <span className="text-sm font-medium text-primary px-3 py-1 rounded-full bg-primary/10">
                Decentralized Escrow Platform
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
              Pay for student housing safely with{" "}
              <span className="text-primary">decentralized escrow</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Trust-minimized housing payments that protect both tenants and
              landlords through blockchain technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" asChild className="text-lg">
                <Link href="/listings">
                  Launch App
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg bg-transparent"
              >
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple, secure, and transparent in 3 easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-8 pb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Browse Listings</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Find your perfect student accommodation from verified
                  landlords. View photos, location, and pricing in stable MNEE
                  tokens.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-8 pb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Create Escrow</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Lock your payment in a smart contract escrow with a neutral
                  arbiter. Your funds are protected until move-in.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-8 pb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Move In Safely</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Once you confirm everything is as described, funds are
                  released to the landlord. Disputes are resolved by arbiter.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Escrow Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Use Escrow?</h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive scam prevention for peace of mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Protected Payments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your money is held securely in a smart contract until all
                conditions are met. No more fake listings or payment scams.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Automated Release</h3>
              <p className="text-muted-foreground leading-relaxed">
                Funds automatically release after the timeout period if no
                disputes arise, ensuring smooth transactions for everyone.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fair Arbitration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Independent arbiters resolve disputes fairly based on evidence.
                Both parties are protected from bad actors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to rent safely?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of students using UniCrow for secure housing
                transactions
              </p>
              <Button size="lg" asChild className="text-lg">
                <Link href="/listings">
                  Browse Listings
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <span className="text-primary-foreground font-bold text-lg">
                  U
                </span>
              </div>
              <span className="text-xl font-semibold">UniCrow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 UniCrow. Decentralized escrow for secure housing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
