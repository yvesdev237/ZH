import toast from "react-hot-toast";
import { FaHeart } from "react-icons/fa6";
import brandPlaceholder from "../assets/brand.png";
import house1 from "../images/house1.jpg";

export const Card = ({
  id,
  imgsrc,
  price,
  title,
  description,
  status,
  onClick,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const handleClick = () => {
    if (onClick) {
      return onClick();
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-full h-60 rounded-lg flex flex-col bg-white ${onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}`}
    >
      <div className="w-full h-[70%] flex justify-center items-center p-2 pb-0">
        <img
          src={imgsrc || brandPlaceholder}
          alt={title}
          onError={(e) => {
            e.currentTarget.src = brandPlaceholder;
          }}
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
      <div className="w-full px-2 pt-0 flex flex-col justify-start items-start bg-white">
        <p className="text-lg text-gray-600 font-semibold">{title}</p>
        <p className="text-sm text-gray-500 italic capitalize line-clamp-1">
          {description}
        </p>
        <p className="font-bold text-xl text-blue-500">{price} Fcfa</p>
      </div>
      <div>
        <span className="absolute top-5 left-5 bg-blue-400 text-white p-1.5 px-4 rounded-lg">
          {status}
        </span>
      </div>
      <button
        type="button"
        onClick={handleFavoriteClick}
        className="absolute top-5 right-5 bg-white rounded-full p-2 shadow hover:shadow-lg transition"
      >
        {isFavorite ? (
          <FaHeart className="size-5 text-red-500" />
        ) : (
          <FaHeart className="size-5 text-slate-300" />
        )}
      </button>
    </div>
  );
};

export const CardLists = ({ title, imgsrc, price, location, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      return onClick();
    }
    toast.error("not yet available");
  };

  return (
    <div
      onClick={handleClick}
      className="ring-gray-600 flex h-28 p-3 justify-start items-center gap-3 overflow-hidden rounded-2xl bg-white shadow-sm cursor-pointer hover:shadow-md transition"
    >
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl">
        <img
          src={imgsrc || brandPlaceholder}
          alt={title || "House"}
          onError={(e) => {
            e.currentTarget.src = brandPlaceholder;
          }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-center flex-1 overflow-hidden">
        <p className="text-gray-600 font-semibold truncate">{title}</p>
        <p className="text-sm text-gray-500 italic capitalize truncate">
          {location || "Unknown location"}
        </p>
        <p className="font-bold text-lg text-blue-500 truncate">{price}</p>
      </div>
    </div>
  );
};

export const CardProps = () => {
  const imgsource =
    "https://xdgqmeffrevanejkvljy.supabase.co/storage/v1/object/public/listing-images/1781657332159-unnamed.jpg";
  return (
    <div className="relative w-full h-90 rounded-lg flex flex-col bg-white ">
      <div className="w-full h-[70%] flex justify-center items-center p-2 pb-0">
        <img
          src={imgsource}
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
      <div className="absolute top-5 right-5">
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
