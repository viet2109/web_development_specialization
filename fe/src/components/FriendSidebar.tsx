import React, { Fragment } from "react";
import { FiChevronRight } from "react-icons/fi";
import { PiUserList } from "react-icons/pi";
import { RiUserReceived2Line, RiUserShared2Line } from "react-icons/ri";
import { NavLink } from "react-router";
import routers from "../configs/router";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
}

function FriendSidebar() {
  const navItems: NavItem[] = [
    {
      icon: <PiUserList size={20} />,
      label: "Danh sách bạn bè",
      to: routers.friends,
    },
    {
      icon: <RiUserReceived2Line />,
      label: "Lời mời được nhận",
      to: routers.friendsReceived,
    },
    {
      icon: <RiUserShared2Line />,
      label: "Lời mời đã gửi",
      to: routers.friendsSended,
    },
  ];

  return (
    <div className="pt-6 space-y-3">
      {navItems.map((item, index) => (
        <NavLink
          end
          key={index}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center justify-between p-4 rounded-xl transition-colors ${
              isActive
                ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <div
                  className={`${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`font-medium line-clamp-1 ${
                    isActive
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-600 dark:bg-blue-500 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                    {item.badge > 10 ? "10+" : item.badge}
                  </span>
                )}
                <FiChevronRight
                  className={`${
                    isActive
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                />
              </div>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export default FriendSidebar;
