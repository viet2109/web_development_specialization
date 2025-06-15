import { Route, BrowserRouter as Router, Routes } from "react-router";
import { privateRoutes, publicRoutes } from "./routes";
import PrivateRoute from "./components/PrivateRoute";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";

function App() {
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <Router>
      <Routes>
        {publicRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              route.layout ? (
                <route.layout>
                  <route.page />
                </route.layout>
              ) : (
                <route.page />
              )
            }
          ></Route>
        ))}
        {privateRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <PrivateRoute isAuth={!!user}>
                {route.layout ? (
                  <route.layout>
                    <route.page />
                  </route.layout>
                ) : (
                  <route.page />
                )}
              </PrivateRoute>
            }
          ></Route>
        ))}
      </Routes>
    </Router>
  );
}

export default App;
