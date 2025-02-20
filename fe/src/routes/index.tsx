import routers from "../configs/router";
import DefaultLayout from "../layouts/DefaultLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import { Route } from "../types";

const publicRoutes: Route[] = [
  { path: routers.login, page: Login, layout: DefaultLayout },
  { path: routers.signUp, page: SignUp, layout: DefaultLayout },
];

const privateRoutes: Route[] = [
  { path: routers.home, page: Home, layout: DefaultLayout },
];

export { publicRoutes, privateRoutes };
