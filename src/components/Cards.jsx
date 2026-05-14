import toast from "react-hot-toast";
import { FaHeart } from "react-icons/fa6";

export const Card = ({ imgsrc, price, title, description }) => {
  return (
    <div
      onClick={() => {
        toast.error("not yet available");
      }}
      className="relative w-full h-54 rounded-lg flex flex-col bg-white"
    >
      <div className="w-full h-[60%] flex justify-center items-center p-2 pb-0">
        <img
          src={imgsrc}
          alt={title}
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
      <div className="w-full px-2 pt-0 flex flex-col justify-start items-start bg-white">
        <p className="text-lg text-gray-600 font-semibold">{title}</p>
        <p className="text-sm text-gray-500 italic capitalize">
          {description}
        </p>
        <p className="font-bold text-xl text-blue-500">{price}</p>
      </div>
    </div>
  );
};

export const CardLists = () => {
  return (
    <div
      onClick={() => {
        toast.error("not yet available");
      }}
      className=" ring-gray-600 flex h-25 p-2 justify-center items-center gap-2 overflow-hidden rounded-2xl"
    >
      <div className="h-full w-30">
        <img
          src="../src/images/house1.jpg"
          alt="House"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
      <div className="flex flex-col justify-center flex-1 overflow-hidden items-start-safe">
        <p className=" text-gray-600 font-semibold">Modern Apartment</p>
        <p className="text-sm text-gray-500 italic capitalize">
          cabs junction , Bambili
        </p>
        <p className="font-bold text-xl text-blue-500">500,000 fcfa</p>
      </div>
    </div>
  );
};

export const CardProps = () => {
  return (
    <div className="relative w-full h-90 rounded-lg flex flex-col bg-white">
      <div className="w-full h-[70%] flex justify-center items-center p-2 pb-0">
        <img
          src="../src/images/house1.jpg"
          alt="House"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
      <div className="w-full px-2 pt-0 flex flex-col justify-start items-start bg-white">
        <p className="text-lg text-gray-600 font-semibold">Modern Apartment</p>
        <p className="text-lg text-gray-600 font-medium">
          Description of the property...
        </p>
        <p className="font-bold text-xl text-blue-500">500,000 fcfa</p>
        <p className="text-sm text-gray-500 italic capitalize">
          cabs junction , Bambili
        </p>
      </div>
      <div className = "absolute top-5 right-5">
        <button className="bg-blue-500 text-white p-2 rounded-full">
          <FaHeart className="size-5" />
        </button>
      </div>
      <div className="absolute top-5 left-5">
        <span className="bg-blue-500 text-white p-1.5 px-4 rounded-lg">
          For Sale
        </span>
      </div>
    </div>
  ); 
};
