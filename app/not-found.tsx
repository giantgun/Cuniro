import Link from "next/link"
import { Home, Search, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="max-w-2xl w-full bg-card border-border">
        <CardContent className="pt-16 pb-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-destructive font-bold text-sm">404</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Listing Not Found</h1>

          <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-md mx-auto">
            This housing listing doesn't exist or has been removed. The property might have been rented or the landlord
            withdrew it.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild>
              <Link href="/listings">
                <Search className="mr-2 h-5 w-5" />
                Browse Listings
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild className="bg-transparent">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Go Home
              </Link>
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Looking for something specific?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/dashboard" className="text-sm text-primary hover:underline">
                My Dashboard
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/manage-listings" className="text-sm text-primary hover:underline">
                Manage Listings
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/#how-it-works" className="text-sm text-primary hover:underline">
                How It Works
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
