import { Route, BrowserRouter as Router, Routes } from "react-router";
import { privateRoutes, publicRoutes } from "./routes";


function App() {
  return (
    <Router>  
      <Routes>
        {publicRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.layout ? <route.layout><route.page /></route.layout> : <route.page />}

          ></Route>
        ))}
        {privateRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.layout ? <route.layout><route.page /></route.layout> : <route.page />}

          ></Route>
        ))}
      </Routes>
    </Router>
  );
}

export default App;
