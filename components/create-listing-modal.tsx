"use client"

import type React from "react"
import { useState } from "react"
import { X, Upload, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/hooks/supabase"
import { useWallet } from "@/hooks/use-wallet"
import { title } from "process"

interface CreateListingModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ListingFormData {
  title: string
  location: string
  price: string
  deposit: string
  bedrooms: string
  bathrooms: string
  description: string
  photos: File[]
}

export function CreateListingModal({ isOpen, onClose }: CreateListingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { userId } = useWallet()
  // ✅ single formData object
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    location: "",
    price: "",
    deposit: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    photos: [],
  })

  const { toast } = useToast()

  if (!isOpen) return null

  const updateField = <K extends keyof ListingFormData>(
    key: K,
    value: ListingFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // 🔌 unified backend / api / smart contract hook
  const createListing = async (data: ListingFormData) => {
    const uuid = crypto.randomUUID()
    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/unicrow/listings/images/${uuid}`
    const { data: uploadData, error } = await supabase.storage.from('unicrow').upload(`listings/images/${uuid}`, data.photos[0])
    if (error) {
      throw error
    }

    console.log("Image uploaded to Supabase storage at URL:", imageUrl)

    const payload = {
      title: data.title,
      description: data.description,
      location: data.location,
      price: Number(data.price),
      bedrooms: Number(data.bedrooms),
      bathrooms: Number(data.bathrooms),
      image_url: imageUrl,
      status: "available",
    }

    console.log("Uploaded file data:", uploadData)

    // === Supabase example ===
    const { error: listingError } = await supabase.from("listings").insert(payload)
    if (listingError) {
      console.error("Error inserting listing into Supabase:", listingError)
      throw listingError
    }

    console.log("Submitting listing:", payload)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setIsLoading(true)

      await createListing(formData)

      setIsLoading(false)
      toast({
        title: "Listing Created",
        description: "Your property has been listed successfully.",
      })
      onClose()
    } catch (error) {
      setIsLoading(false)
      console.error("Error creating listing:", error)
      toast({
        title: "Error",
        description: "There was an issue creating your listing. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-2xl font-bold">Add New Listing</h2>
            <p className="text-sm text-muted-foreground mt-1">Post your property for student housing</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Property Title</Label>
              <Input
                placeholder="e.g. Modern Studio Near Campus"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                placeholder="e.g. Downtown University District"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Monthly Rent (MNEE)</Label>
              <Input
                type="number"
                placeholder="e.g. 850"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                required
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bedrooms</Label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={formData.bedrooms}
                  onChange={(e) => updateField("bedrooms", e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={formData.bathrooms}
                  onChange={(e) => updateField("bathrooms", e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the property, amenities, and proximity to campus..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                required
                className="mt-1.5 h-32"
              />
            </div>

            <div>
              <Label>Property Photos</Label>
              <label className="mt-1.5 border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload photos</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP up to 5MB</p>
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(e) =>
                    updateField("photos", Array.from(e.target.files ?? []))
                  }
                />
              </label>

              {/* ✅ image preview */}
              {formData.photos.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {formData.photos.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="h-24 w-full object-cover rounded-md border"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  New listings are reviewed to ensure trust and safety for students.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
