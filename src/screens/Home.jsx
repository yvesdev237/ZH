import React from "react";
import { Searchbar } from "../components/Searchbar";
import { Card, CardLists } from "../components/Cards";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import { useAuth } from "../context/UseAuth";
import house1 from "../images/house1.jpg";
import house2 from "../images/house2.jpg";

const Home = () => {
  const { user } = useAuth();

  const userName = user.user_metadata?.username || "user";
  const items = [
    {
      imgsrc: house1,
      price: "$500,000",
      title: "Modern Apartment",
      description: "Beautiful modern apartment in the heart of the city.",
    },
    {
      imgsrc: house2,
      price: "$500,000",
      title: "Modern Apartment",
      description: "Beautiful modern apartment in the heart of the city.",
    },
    {
      imgsrc: house2,
      price: "$500,000",
      title: "Modern Apartment",
      description: "Beautiful modern apartment in the heart of the city.",
    },
    {
      imgsrc: house2,
      price: "$500,000",
      title: "Modern Apartment",
      description: "Beautiful modern apartment in the heart of the city.",
    },
  ];

  return (
    <main className="min-h-screen w-full p-3 flex flex-col items-start overflow-y-auto pb-20">
      <h1 className="text-2xl text-gray-500 capitalize text-left w-full p-2 font-medium">
        welcome ! <br />
        <span className="text-blue-500">{userName}</span>
      </h1>
      <Searchbar />
      <section className="w-full mt-5">
        <h2 className="text-xl text-gray-500 capitalize text-left w-full p-2 font-medium">
          Featured Properties
        </h2>
        <div className="w-full flex gap-4 p-2 overflow-x-auto scrollbar-hide">
          {items.map((item, index) => (
            <div key={index} className="shrink-0 w-72">
              <Card
                imgsrc={item.imgsrc}
                price={item.price}
                title={item.title}
                description={item.description}
              />
            </div>
          ))}
        </div>
      </section>
      <section className="w-full p-2">
        <h2 className="text-xl text-gray-500 capitalize text-left w-full p-2 font-medium">
          Latest Listings
        </h2>
        <div className="h-auto w-full">
          {items.map((item, index) => (
            <CardLists
              key={index}
              imgsrc={item.imgsrc}
              price={item.price}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>
      {user.user_metadata?.role === "agent" && (
        <Link
          to={"/add"}
          className="fixed bottom-20 right-7 text-3xl z-10 bg-blue-500 text-white p-2 rounded-full"
        >
          <FaPlus />
        </Link>
      )}
    </main>
  );
};

export default Home;
