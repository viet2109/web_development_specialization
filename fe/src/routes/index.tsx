import routers from "../configs/router";
import DefaultLayout from "../layouts/DefaultLayout";
import Home from "../pages/home/Home";

import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import { Route } from "../types";

const publicRoutes: Route[] = [
  { path: routers.login, page: Login, layout: undefined },
  { path: routers.register, page: Register, layout: undefined },
];

const privateRoutes: Route[] = [
  { path: routers.home, page: Home, layout: DefaultLayout },
];

export { publicRoutes, privateRoutes };
