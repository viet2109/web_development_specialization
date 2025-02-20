import { Fragment } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import routers from "../configs/router";
import { RootState } from "../redux/store";

interface Props {}

function Header(props: Props) {
  const {} = props;
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <header>
      <nav>
        {!!user ? (
          <div>You are login now.</div>
        ) : (
          <Fragment>
            <Link to={routers.login}>Login</Link>
            <Link to={routers.signUp}>Sign up</Link>
          </Fragment>
        )}
      </nav>
    </header>
  );
}

export default Header;
