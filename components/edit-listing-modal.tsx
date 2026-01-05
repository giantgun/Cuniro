"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { X, Upload, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/hooks/supabase";
import { useWallet } from "@/hooks/use-wallet";
import { Spinner } from "./ui/spinner";

interface CreateListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    listin: any;
    onEdit: () => void;
}

interface ListingFormData {
    title: string;
    location: string;
    price: string;
    deposit: string;
    bedrooms: string;
    bathrooms: string;
    description: string;
    photo: File | null;
    status: string
}

export function EditListingModal({
    isOpen,
    onClose,
    listin,
    onEdit,
}: CreateListingModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { userId } = useWallet();
    const { toast } = useToast();

    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState<ListingFormData>({
        title: listin!.title,
        location: listin!.location,
        price: listin!.price,
        deposit: listin!.deposit,
        bedrooms: listin!.bedrooms,
        bathrooms: listin!.bathrooms,
        description: listin.description,
        photo: null,
        status: ""
    });

    useEffect(() => {
        const fetchData = () => {
            try {
                setIsLoading(true);
                const listingTo = localStorage.getItem("listingToEdit");
                const listing = listingTo ? JSON.parse(listingTo) : {};

                console.log("Fetched listing from localStorage:", listing);

                setFormData({
                    title: listing.title,
                    location: listing.location,
                    price: listing.price,
                    deposit: listing.deposit,
                    bedrooms: listing.bedrooms,
                    bathrooms: listing.bathrooms,
                    description: listing.description,
                    photo: null,
                    status: listing.status
                });

                setExistingImageUrl(listing.image_url ?? null);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) fetchData();
    }, [isOpen]);

    if (!isOpen) return null;

    const updateField = <K extends keyof ListingFormData>(
        key: K,
        value: ListingFormData[K],
    ) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const editListing = async (data: ListingFormData) => {
        let imageUrl = existingImageUrl;

        if (data.photo) {
            const parts = existingImageUrl?.split("/");
            const uuid = parts![parts!.length - 1];
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
            if (userError) throw userError;

            const { error } = await supabase.storage
                .from("unicrow")
                .upload(`${user!.id}/listings/images/${uuid}`, data.photo, {
                    upsert: true,
                });

            if (error) throw error;

            console.log("Image uploaded to Supabase storage at URL:", imageUrl);
        }

        const payload = {
            title: data.title,
            description: data.description,
            location: data.location,
            price: Number(data.price),
            bedrooms: Number(data.bedrooms),
            bathrooms: Number(data.bathrooms),
            image_url: imageUrl,
            status: data.status,
        };

        const { error: listingError } = await supabase
            .from("listings")
            .update(payload)
            .eq("id", listin.id);

        if (listingError) throw listingError;

        console.log("Updated listing:", payload);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            setIsLoading(true);

            await editListing(formData);

            onEdit();

            toast({
                title: "Listing Updated",
                description: "Your property has been updated successfully.",
            });

            onClose();
        } catch (error) {
            console.error("Error updating listing:", error);
            toast({
                title: "Error",
                description: "There was an issue updating your listing.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                    <div>
                        <h2 className="text-2xl font-bold">Edit Listing</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Edit your posted property
                        </p>
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
                                value={formData.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                required
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label>Location</Label>
                            <Input
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
                                value={formData.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                required
                                className="mt-1.5 h-32"
                            />
                        </div>

                        <div>
                            <Label>Property Photo</Label>
                            <label className="mt-1.5 border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">
                                    Click to upload a new photo (overwrites existing)
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) =>
                                        updateField("photo", e.target.files?.[0] ?? null)
                                    }
                                />
                            </label>

                            {(formData.photo || existingImageUrl) && (
                                <div className="mt-3">
                                    <img
                                        src={
                                            formData.photo
                                                ? URL.createObjectURL(formData.photo)
                                                : existingImageUrl!
                                        }
                                        alt="Preview"
                                        className="h-40 w-full object-cover rounded-md border"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex gap-3">
                                <Info className="h-5 w-5 text-primary mt-0.5" />
                                <p className="text-xs text-muted-foreground">
                                    Updated listings may be reviewed to maintain trust and safety.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="text-primary bg-transparent"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" className="text-primary-foreground" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
