import {
  BookOpen,
  Calendar,
  Clock,
  Gamepad2,
  GraduationCap,
  Heart,
  Image,
  MessageCircle,
  Play,
  ShoppingBag,
  Users,
  Users2,
  Video,
} from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../redux/store";

const LeftBar: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const menuItems = [
    { icon: Users, label: "Bạn bè", color: "text-blue-600", to: "/friends" },
    { icon: Users2, label: "Nhóm", color: "text-green-600", to: "/groups" },
    {
      icon: ShoppingBag,
      label: "Chợ",
      color: "text-orange-600",
      to: "/marketplace",
    },
    { icon: Play, label: "Xem", color: "text-red-600", to: "/watch" },
    {
      icon: Clock,
      label: "Kỷ niệm",
      color: "text-purple-600",
      to: "/memories",
    },
  ];

  const shortcuts = [
    { icon: Calendar, label: "Sự kiện", color: "text-pink-600", to: "/events" },
    {
      icon: Gamepad2,
      label: "Trò chơi",
      color: "text-indigo-600",
      to: "/gaming",
    },
    {
      icon: Image,
      label: "Thư viện ảnh",
      color: "text-emerald-600",
      to: "/gallery",
    },
    { icon: Video, label: "Video", color: "text-cyan-600", to: "/videos" },
    {
      icon: MessageCircle,
      label: "Tin nhắn",
      color: "text-teal-600",
      to: "/messages",
    },
  ];

  const others = [
    {
      icon: Heart,
      label: "Gây quỹ",
      color: "text-rose-600",
      to: "/fundraiser",
    },
    {
      icon: BookOpen,
      label: "Hướng dẫn",
      color: "text-amber-600",
      to: "/tutorials",
    },
    {
      icon: GraduationCap,
      label: "Khóa học",
      color: "text-violet-600",
      to: "/courses",
    },
  ];

  const MenuItem = ({
    icon: Icon,
    label,
    color,
    to,
  }: {
    icon: any;
    label: string;
    color: string;
    to: string;
  }) => (
    <Link to={to} className="block">
      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100/80 dark:hover:bg-gray-800/60 cursor-pointer transition-all duration-200 group">
        <div
          className={`p-2 rounded-lg bg-slate-100/80 dark:bg-gray-800/60 group-hover:scale-110 transition-transform ${color}`}
        >
          <Icon size={20} />
        </div>
        <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
          {label}
        </span>
      </div>
    </Link>
  );

  return (
    <div className="h-full pt-4 overflow-y-auto overflow-x-hidden max-h-screen scrollbar-none">
      <div className="space-y-6 mb-20">
        {/* User Profile Section */}
        <Link to="/profile" className="block">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-gray-700/50 border border-blue-100 dark:border-gray-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-200 cursor-pointer">
            <div className="relative">
              <img
                src={
                  currentUser?.avatar?.path ||
                  `https://ui-avatars.com/api/?name=${currentUser?.firstName}+${currentUser?.lastName}&background=3b82f6&color=ffffff&size=64`
                }
                alt={`avatar`}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-200 dark:ring-blue-800"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <span className="text-gray-800 dark:text-gray-200 font-semibold">
              {`${currentUser?.firstName} ${currentUser?.lastName}`}
            </span>
          </div>
        </Link>

        {/* Main Menu */}
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              color={item.color}
              to={item.to}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/60 dark:border-gray-700/60"></div>

        {/* Shortcuts Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3">
            Lối tắt của bạn
          </h3>
          <div className="space-y-1">
            {shortcuts.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                label={item.label}
                color={item.color}
                to={item.to}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/60 dark:border-gray-700/60"></div>

        {/* Others Section */}
        <div className="space-y-3 pb-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3">
            Khác
          </h3>
          <div className="space-y-1">
            {others.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                label={item.label}
                color={item.color}
                to={item.to}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
