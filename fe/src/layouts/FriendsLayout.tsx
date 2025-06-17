// layouts/HeaderSidebarWrapper.tsx
import { ReactNode } from "react";
import FriendSidebar from "../components/FriendSidebar";
import Navbar from "../components/NavBar";
import HeaderSidebarRightbarLayout from "./HeaderSidebarRightbarLayout";

export default function FriendsLayout({ children }: { children: ReactNode }) {
  return (
    <HeaderSidebarRightbarLayout
      header={<Navbar />}
      sidebar={<FriendSidebar />}
    >
      {children}
    </HeaderSidebarRightbarLayout>
  );
}
