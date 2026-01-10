import { Navbar } from "@/components/navbar";
import { ListingCard } from "@/components/listing-card";
import { supabase } from "@/hooks/supabase";

export const dynamic = "force-dynamic";

async function getListings() {
  const { data, error } = await supabase
    .from("listings")
    .select(`*, profiles (address)`)
    .eq("status", "available")
    .setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }

  return data ?? [];
}

export default async function ListingsPage() {
  const data = await getListings();
  const dateNow = Date();

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20 lg:px-8 md:px-6 px-4">
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

          {data.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">No Listings at the moment</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                dateNow={dateNow}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
