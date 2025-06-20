const routers = {
  root: "/",
  home: "/home",
  login: "/login",
  register: "/register",
  friends: "/friends",
  friendsSended: "/friends/sended",
  friendsReceived: "/friends/received",
  verifyEmail: "/verify",
  profile: "/profile",
  profileById: (id: number | string) => `/profile/${id}`,
  notFound: "*",
};

export default routers;
