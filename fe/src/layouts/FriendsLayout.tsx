// layouts/HeaderSidebarWrapper.tsx
import { ReactNode } from "react";
import HeaderSideBarLayout from "./HeaderSideBarLayout";
import Navbar from "../components/navBar/NavBar";
import FriendSidebar from "../components/FriendSidebar";

export default function FriendsLayout({ children }: { children: ReactNode }) {
  return (
    <HeaderSideBarLayout header={<Navbar />} sidebar={<FriendSidebar />}>
      {children}
    </HeaderSideBarLayout>
  );
}
