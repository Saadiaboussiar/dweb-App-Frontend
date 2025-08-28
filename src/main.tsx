import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import DialogsProvider from "./hooks/useDialogs/DialogsProvider.tsx";
import { listenForMessages } from "./utils/messageTest.ts";
import { MessageErrorBoundary } from "./admin-ui/components/MessageErrorBoundary.tsx";
import NotificationsProvider from "./hooks/useNotifications/NotificationsProvider.tsx";
import { Provider } from "react-redux";
import { store } from "./features/store.ts";

function MessageListener() {
  useEffect(() => {
    return listenForMessages();
  }, []);
  return null; // Doesn't render anything
}

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <NotificationsProvider>
      <DialogsProvider>
        <BrowserRouter>
          <MessageErrorBoundary>
            <MessageListener />
            <App />
          </MessageErrorBoundary>
        </BrowserRouter>
      </DialogsProvider>
    </NotificationsProvider>
  </Provider>
);
