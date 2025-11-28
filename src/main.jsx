import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "./actions/store.js";
import { Provider } from "react-redux";
import "./translations/i8nt.js";
import { ToastProvider } from "./containers/Notifications/Notifications.jsx";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </ToastProvider>
  </StrictMode>
);
