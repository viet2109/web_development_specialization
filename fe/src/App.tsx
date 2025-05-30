import { Route, BrowserRouter as Router, Routes,Navigate} from "react-router";
import { privateRoutes, publicRoutes } from "./routes";

import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { useEffect } from "react";
import { setAuthToken } from "./api/api";
function App() {
  // Theo dõi thay đổi token và cập nhật api
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    setAuthToken(token); // Cập nhật token khi nó thay đổi
  }, [token]);
  return (
    <Router>
      <Routes>
        {/* Redirect từ / đến /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Render các public routes */}
        {publicRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.layout ? <route.layout>{route.page && <route.page />}</route.layout> : route.page && <route.page />}
          />
        ))}
        
        {/* Render các private routes */}
        {privateRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.layout ? <route.layout>{route.page && <route.page />}</route.layout> : route.page && <route.page />}
          />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
