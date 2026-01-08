"use client";

import { Navbar } from "@/components/navbar";
import { ListingCard } from "@/components/listing-card";
import { useEffect, useState } from "react";
import { supabase } from "@/hooks/supabase";
import { Spinner } from "@/components/ui/spinner";
import { CreateListingModal } from "@/components/create-listing-modal";

// Mock listings data - would come from API/database in production
const listings = [
  {
    id: "1",
    title: "Modern Studio Near Campus",
    location: "Downtown University District",
    price: "850", //850
    image: "/modern-studio-apartment.png",
    seller: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    description:
      "Fully furnished studio apartment just 5 minutes walk from campus. Includes WiFi, utilities, and access to gym facilities. Perfect for students looking for convenience and comfort.",
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: "2",
    title: "Shared 2BR Apartment",
    location: "West Side Campus",
    price: "600",
    image: "/shared-apartment-room.jpg",
    seller: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    description:
      "Spacious room in a 2-bedroom apartment shared with one other student. Close to public transport, shopping centers, and university. Laundry in building.",
    bedrooms: 2,
    bathrooms: 1,
  },
  {
    id: "3",
    title: "Private Room in Student House",
    location: "North Campus Area",
    price: "500",
    image: "/student-house-bedroom.jpg",
    seller: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    description:
      "Comfortable private room in a friendly 4-person student house. Shared kitchen, living room, and backyard. Great community atmosphere with study groups.",
    bedrooms: 4,
    bathrooms: 2,
  },
  {
    id: "4",
    title: "Luxury 1BR with Balcony",
    location: "City Center Premium",
    price: "1200",
    image: "/luxury-apartment-balcony.png",
    seller: "0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
    description:
      "Premium one-bedroom apartment with stunning city views from private balcony. High-end finishes, modern appliances, 24/7 security, and parking included.",
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: "5",
    title: "Cozy Studio with Study Space",
    location: "East Campus Quarter",
    price: "700",
    image: "/cozy-studio-desk.jpg",
    seller: "0x123463a4B065722E99115D6c222f267d9cABb524",
    description:
      "Bright and cozy studio with dedicated study area. Recently renovated with new furniture. Quiet building ideal for focused studying. Utilities included.",
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: "6",
    title: "3BR House Share",
    location: "Suburban Student Zone",
    price: "550",
    image: "/suburban-house-share.jpg",
    seller: "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
    description:
      "Large room in a 3-bedroom house with garden. Bike storage, off-street parking, and excellent bus connections to campus. Pet-friendly environment.",
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    id: "7",
    title: "Budget Single Room Near Campus",
    location: "South Campus Road",
    price: "350",
    image: "/budget-single-room.jpg",
    seller: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    description:
      "Affordable single room ideal for students on a budget. Shared kitchen and bathroom. Walking distance to campus and local grocery stores.",
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: "8",
    title: "Furnished Mini Flat",
    location: "Central Student Hub",
    price: "800",
    image: "/furnished-mini-flat.jpg",
    seller: "0x267be1C1D684F78cb4F6a176C4911b741E4Ffdc0",
    description:
      "Fully furnished mini flat with private kitchen and bathroom. Reliable power supply and water. Secure compound with gated access.",
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    id: "9",
    title: "Off-Campus Student Lodge",
    location: "Quiet Residential Area",
    price: "450",
    image: "/student-lodge-room.jpg",
    seller: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    description:
      "Well-maintained student lodge offering quiet and comfortable living. On-site security, shared common areas, and easy transport to campus.",
    bedrooms: 1,
    bathrooms: 1,
  },
];

export default function ListingsPage() {
  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(false);
  const dateNow = Date();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("listings")
          .select(`*, profiles (address) `)
          .eq("status", "available");

        if (error) {
          throw error;
        }
        console.log("Fetched listings from Supabase:", data);
        setData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [reloadFlag]);
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Student Housing Listings
              </h1>
              <p className="text-muted-foreground mt-1">
                Browse verified accommodations and rent with secure escrow
                protection
              </p>
            </div>
          </div>

          {(!data || data.length === 0) && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              {isLoading ? (
                <Spinner size="lg" className="m-auto" />
              ) : (
                <p className="text-muted-foreground">
                  No Listings at the moment
                </p>
              )}
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data &&
              data[0] &&
              data.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  dateNow={dateNow}
                />
              ))}
          </div>
        </div>
      </div>
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={() => {
          setReloadFlag(!reloadFlag);
        }}
      />
    </div>
  );
}
