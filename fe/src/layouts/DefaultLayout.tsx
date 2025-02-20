import { Fragment, ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface Props {
  children: ReactNode;
}

function DefaultLayout(props: Props) {
  const { children } = props;

  return (
    <Fragment>
      <Header />
      <main>{children}</main>
      <Footer />
    </Fragment>
  );
}

export default DefaultLayout;
