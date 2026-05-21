import React, { useEffect, useState } from "react";
import { SearchbarProps } from "../components/Searchbar";
import toast from "react-hot-toast";
import { Card } from "../components/Cards";
import { db } from "../services/database";
import brandPlaceholder from "../assets/brand.png";

const Explore = () => {
  const [listings, setListings] = useState([]);

  const fetchListings = async () => {
    const { data, error } = await db
      .from("listings")
      .select(`*,images:listings_images(image_url , listings_id)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error); 
      return ;
    }

    console.log("Explore fetched listings:", data);
    return data || [];
  };
  useEffect(() => {
    const loadingListings = async () => {
      const data = await fetchListings();
      setListings(data);
    };
    loadingListings();
  }, []);
  return (
    <main className="min-h-screen w-full p-2 flex flex-col pb-20">
      <h1 className="text-2xl text-gray-500 capitalize text-left w-full p-2 font-medium">
        discover <br />
        <span className="text-blue-500">properties</span>
      </h1>
      <SearchbarProps />
      <div className="w-full flex gap-2 items-start justify-start p-4">
        <button
          className="rounded-2xl bg-blue-400 p-1.5 w-20 text-white"
          onClick={() => {
            toast.error("coming soon...");
          }}
        >
          All
        </button>
        <button
          className="rounded-2xl bg-blue-400 p-1.5 w-20 text-white"
          onClick={() => {
            toast.error("coming soon...");
          }}
        >
          For Sale
        </button>
        <button
          className="rounded-2xl bg-blue-400 p-1.5 w-20 text-white"
          onClick={() => {
            toast.error("coming soon...");
          }}
        >
          For Rent
        </button>
      </div>
      <section className="w-full p-1 flex-1 flex flex-col">
        <h2 className="text-xl text-gray-500 capitalize text-left w-full p-2 font-medium">
          listed Properties ({listings.length})
        </h2>
        <div
          className={`w-full h-full flex items-start overflow-y-auto flex-col gap-5 p-2 ${listings.length === 0 && "justify-center"}`}
        >
          {listings.length === 0
            ? "There's nothing to show now "
            : listings.map((listing, index) => (
                <Card
                  key={listing.id}
                  imgsrc={
                    listing.images?.[0]?.image_url || brandPlaceholder
                  }
                  price={listing.price}
                  title={listing.title}
                  description={listing.description}
                  status={listing.status}
                />
              ))}
        </div>
      </section>
    </main>
  );
};

export default Explore;
