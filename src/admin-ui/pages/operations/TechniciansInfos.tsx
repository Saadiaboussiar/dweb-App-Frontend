import Box from "@mui/material/Box";
import Header from "../../../global/components/Header";
import { Outlet, RouterProvider } from "react-router-dom";
import NotificationsProvider from "../../../hooks/useNotifications/NotificationsProvider";
import DialogsProvider from "../../../hooks/useDialogs/DialogsProvider";

const TechniciansInfos = () => {
  return (
    <>
      <NotificationsProvider>
        <DialogsProvider>
          {/* Remove RouterProvider completely */}
          <Outlet /> {/* This renders nested routes */}
        </DialogsProvider>
      </NotificationsProvider>
    </>
  );
};

export default TechniciansInfos;
