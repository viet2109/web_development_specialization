import routers from "../configs/router";
import DefaultLayout from "../layouts/DefaultLayout";
import FriendsLayout from "../layouts/FriendsLayout";
import FriendRequestsPage from "../pages/FriendRequestsPage";
import FriendsList from "../pages/FriendsList";
import Home from "../pages/Home";
import ProfileLayout from "../layouts/ProfileLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import SentFriendRequestsPage from "../pages/SentFriendRequestsPage";
import Profile from "../pages/Profile";
import { Route } from "../types";

const publicRoutes: Route[] = [
  { path: routers.login, page: Login, layout: undefined },
  { path: routers.register, page: Register, layout: undefined },
];

const privateRoutes: Route[] = [
  { path: routers.home, page: Home, layout: DefaultLayout },
  { path: routers.root, page: Home, layout: DefaultLayout },
  { path: routers.friends, page: FriendsList, layout: FriendsLayout },
  {
    path: routers.friendsReceived,
    page: FriendRequestsPage,
    layout: FriendsLayout,
  },
  {
    path: routers.friendsSended,
    page: SentFriendRequestsPage,
    layout: FriendsLayout,
  },
  {
    path: routers.profile,
    page: Profile,
    layout: ProfileLayout

  },
  {
  path: `${routers.profile}/:userId`, 
  page: Profile,
  layout: ProfileLayout,
}
];

export { privateRoutes, publicRoutes };

