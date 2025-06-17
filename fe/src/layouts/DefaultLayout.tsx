import { ReactNode } from "react";
import HeaderSidebarRightbarLayout from "./HeaderSidebarRightbarLayout";
import Navbar from "../components/NavBar";
import LeftBar from "../components/LeftBar";
import RightBar from "../components/rightBar/RightBar";

interface Props {
  children: ReactNode;
}

function DefaultLayout(props: Props) {
  const { children } = props;

  return (
    <HeaderSidebarRightbarLayout
      header={<Navbar />}
      sidebar={<LeftBar />}
      rightbar={<RightBar />}
    >
      {children}
    </HeaderSidebarRightbarLayout>
  );
}

export default DefaultLayout;
