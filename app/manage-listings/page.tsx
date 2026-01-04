"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Edit2, Trash2, Home, MapPin, Users, Activity } from "lucide-react"
import { CreateListingModal } from "@/components/create-listing-modal"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/hooks/supabase"
import { useWallet } from "@/hooks/use-wallet"

// Mock landlord listings
const initialListings = [
  {
    id: "1",
    title: "Modern Studio Near Campus",
    location: "Downtown University District",
    price: "850",
    status: "active",
    views: 124,
    rented: 0,
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: "4",
    title: "Luxury 1BR with Balcony",
    location: "City Center Premium",
    price: "1200",
    status: "rented",
    views: 342,
    rented: 1,
    bedrooms: 1,
    bathrooms: 1,
  },
]

export default function ManageListingsPage() {
  const [listings, setListings] = useState(initialListings)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [data, setData] = useState<any[] | null>(null);
  const { account } = useWallet();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`*, profiles (address) `)
          .eq("profiles.address", account);
        if (error) {
          throw error
        }
        console.log("Fetched listings from Supabase:", data)
        setData(data)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData()

  }, [])
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Manage Listings</h1>
              <p className="text-muted-foreground mt-1">Create and manage your property listings for students.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add New Listing
            </Button>
          </div>

          {/* Stats Section - Bento Grid style inspired by image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Listings</p>
                    <p className="text-2xl font-bold">{listings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                    <p className="text-2xl font-bold">{listings.filter((l) => l.status === "active").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{listings.reduce((acc, curr) => acc + curr.views, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listings Table/List */}
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle>Your Properties</CardTitle>
              <CardDescription>A list of all your properties and their current performance.</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left m-auto">
                <thead>
                  <tr className="border-b border-border bg-muted/10">
                    <th className="p-4 font-medium text-sm">Property</th>
                    <th className="p-4 font-medium text-sm">Status</th>
                    <th className="p-4 font-medium text-sm">Price</th>
                    {/* <th className="p-4 font-medium text-sm">Views</th> */}
                    <th className="p-4 font-medium text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data && data.map((listing) => (
                    <tr key={listing.id} className="hover:bg-muted/5 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{listing.title}</span>
                          <span className="text-xs text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" /> {listing.location}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                          {listing.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-sm">{listing.price} MNEE</td>
                      {/* <td className="p-4 text-sm text-muted-foreground">{listing.views}</td> */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {listings.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground">You haven't added any listings yet.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>

      <CreateListingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
