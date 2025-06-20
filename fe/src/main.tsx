import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import { requestForToken } from "./firebase-config";
import "./index.css";
import { persistor, store } from "./redux/store";
const queryClient = new QueryClient();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then(async (registration) => {
        console.log("Service Worker đăng ký thành công:", registration);
        await requestForToken();
      })
      .catch((error) => {
        console.error("Service Worker đăng ký thất bại:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <App />
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);
