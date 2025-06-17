import {
  Bell,
  Grid3X3,
  Home,
  LogOut,
  Mail,
  MessageCircle,
  Search,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { webSocketService } from "../api/socket";
import routers from "../configs/router";
import { useAppDispatch } from "../hook/hook";
import { logOutSuccess } from "../redux/authSlice";
import { RootState } from "../redux/store";
import { Contact } from "../types";
import ChatBox from "./Message";
import MessengerUI from "./Messages";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [openMessenger, setOpenMessenger] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      navigate("/login");
      dispatch(logOutSuccess());
    } catch (err) {
      console.error("Logout failed with error:", err);
    }
  };

  const handleOpenMessenger = () => setOpenMessenger(true);
  const handleCloseMessenger = () => setOpenMessenger(false);
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setOpenMessenger(false);
  };

  useEffect(() => {
    if (currentUser?.id) {
      webSocketService.connect(currentUser.id);
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [currentUser?.id]);

  return (
    <>
      {/* Main Navbar Container - Responsive */}
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Brand và Navigation */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link
            to={routers.home}
            className="text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Buckety
          </Link>

          {/* Desktop Navigation - Ẩn trên mobile/tablet vì đã có sidebar */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link
              to="/"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              <Home size={18} />
            </Link>
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
              <Grid3X3 size={18} />
            </button>
          </div>
        </div>

        {/* Center - Search Bar - Responsive */}
        <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-8">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm kiếm trên buckety..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-1 lg:space-x-2">
          {/* Mobile Search Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
            <Search size={18} />
          </button>

          {/* Action Buttons - Responsive sizes */}
          <button
            onClick={handleOpenMessenger}
            className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors ${
              openMessenger
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <MessageCircle size={18} />
          </button>

          {/* Desktop-only buttons */}
          <button className="hidden sm:block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
            <User size={18} />
          </button>

          <button className="hidden sm:block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
            <Mail size={18} />
          </button>

          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
            <Bell size={18} />
          </button>

          {/* User Avatar */}
          <img
            src={
              currentUser?.avatar?.path ||
              `https://ui-avatars.com/api/?name=${currentUser?.firstName}+${currentUser?.lastName}&background=3b82f6&color=ffffff&size=64`
            }
            alt={`${currentUser?.firstName} ${currentUser?.lastName}`}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-700 shadow-sm"
          />

          {/* Logout Button */}
          <button
            onClick={handleClick}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* MessengerUI Modal - Adjusted positioning */}
      {/* <Modal
        open={openMessenger}
        onClose={() => setOpenMessenger(false)}
        BackdropProps={{ invisible: true }}
      > */}
      {openMessenger &&
        createPortal(
          <div className="fixed z-[9999] top-16 right-10 min-w-96">
            <MessengerUI
              onSelectContact={(contact) => {
                setOpenMessenger(false);
                handleSelectContact(contact);
              }}
            />
          </div>,
          document.body
        )}
      {/* </Modal> */}

      {/* Chat Box - Responsive positioning */}
      {selectedContact &&
        createPortal(
          <div className="h-[70vh] shadow-lg fixed z-[9998] bottom-2 right-10 rounded-2xl overflow-hidden">
            <ChatBox
              contact={selectedContact}
              onClose={() => setSelectedContact(null)}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default Navbar;
