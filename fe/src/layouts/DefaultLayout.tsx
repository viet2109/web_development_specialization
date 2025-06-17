import { Fragment, ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Navbar from "../components/navBar/NavBar";
import LeftBar from "../components/leftBar/LeftBar";
import RightBar from "../components/rightBar/RightBar";


interface Props {
  children: ReactNode;
}

function DefaultLayout(props: Props) {
  const { children } = props;

  return (
     <div>
      <Navbar />
      <div className="layout-container" style={{ paddingTop: '50px' }}> 
        <div className="left-bar">
          <LeftBar />
        </div>
        <main className="main-content">{children}</main>
        <div className="right-bar">
          {/* <RightBar /> */}
        </div>
      </div>
    </div>
  );
}

export default DefaultLayout;
