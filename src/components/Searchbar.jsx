import React from "react";
import toast from "react-hot-toast";
import { FaFilter , FaSearchengin } from "react-icons/fa6";

export const Searchbar = () => {
  return (
    <div className="w-full flex items-center justify-center gap-2 p-2 outline outline-gray-300 rounded-lg shadow-sm">
      <FaSearchengin className="size-7 text-gray-400" />
      <input
        type="text"
        className="flex-1 outline-none p-1 text-gray-500"
        placeholder="Search city , area...."
      />
      <button className="bg-black p-2 w-10 rounded-lg flex justify-center">
        <FaFilter className="size-5 text-gray-300" />
      </button>
    </div>
  );
};

export const SearchbarProps = () => {
   return (
    <div onClick={() => {
      toast.error('coming soon...')
    }} className="w-full flex items-center justify-center gap-2 px-4 p-1 outline outline-gray-300 rounded-3xl shadow-sm">
      <FaSearchengin className="size-7 text-gray-400" />
      <input
        type="text"
        className="flex-1 outline-none p-1 text-gray-500"
        placeholder="what are you looking for ?"
        readOnly
      />
    </div>
  );
};
