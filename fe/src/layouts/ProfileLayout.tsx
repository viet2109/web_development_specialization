// layouts/HeaderSidebarWrapper.tsx
import { ReactNode } from "react";
import Navbar from "../components/NavBar";
import HeaderSidebarRightbarLayout from "./HeaderSidebarRightbarLayout";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <HeaderSidebarRightbarLayout
      header={<Navbar />}
      
    >
      {children}
    </HeaderSidebarRightbarLayout>
  );
}
