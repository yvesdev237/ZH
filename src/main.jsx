import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ContextProvider } from "./context/GlobalContext.jsx";

createRoot(document.getElementById("root")).render(
  <ContextProvider>
    <BrowserRouter>
      <Toaster position="top-right " />
      <App />
    </BrowserRouter>
  </ContextProvider>,
);
