import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/UseAuth";
import { permissionCheck } from "../utils/PermissionCheck";
import {
  FaBuilding,
  FaCompass,
  FaHeart,
  FaHouse,
  FaUser,
} from "react-icons/fa6";

export const Navbar = () => {
  const location = useLocation();
  const { user, role } = useAuth();
  const hideNavbar = location.pathname.startsWith("/dashboard/property/");
  const isAgent = user?.user_metadata?.role === "agent" || role === "agent";

  if (hideNavbar) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      path: "home",
      permission: "view_property",
      icon: FaHouse,
    },
    ...(isAgent
      ? [
          {
            label: "My Property",
            path: "my-properties",
            permission: "view_property",
            icon: FaBuilding,
            agentOnly: true,
          },
        ]
      : []),
    {
      label: "Explore",
      path: "explore",
      permission: "view_property",
      icon: FaCompass,
    },
    {
      label: "Favorites",
      path: "favorite",
      permission: "saved_property",
      icon: FaHeart,
    },
    {
      label: "profile",
      path: "profiles",
      permission: "view_profile",
      icon: FaUser,
    },
  ];

  return (
    <nav className="flex justify-between px-3 p-2 bg-black/30 backdrop-blur-lg shadow-lg rounded-4xl fixed bottom-2 right-3 left-3">
      <div className="flex gap-4 justify-center items-center w-full">
        {navItems.map((item) => {
          if (!permissionCheck({ user, role, permission: item.permission })) {
            return null;
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col justify-center items-center capitalize transition-all ease-in gap-1 rounded-4xl ${isActive ? " text-blue-500 -translate-y-1.5 " : "text-gray-500"}`
              }
            >
              <Icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
