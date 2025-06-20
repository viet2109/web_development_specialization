const routers = {
  root: "/",
  home: "/home",
  login: "/login",
  register: "/register",
  friends: "/friends",
  friendsSended: "/friends/sended",
  friendsReceived: "/friends/received",
  notFound: "*",
   profile: "/profile",                     
    profileById: (id: number | string) => `/profile/${id}`,  
};

export default routers;
