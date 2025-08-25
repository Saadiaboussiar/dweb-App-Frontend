import { Outlet } from 'react-router-dom';
import NotificationsProvider from '../../../hooks/useNotifications/NotificationsProvider';
import DialogsProvider from '../../../hooks/useDialogs/DialogsProvider';

const ClientInfos = () => {
  return (
    <>
    
    <NotificationsProvider>
      <DialogsProvider>
        {/* Remove RouterProvider completely */}
        <Outlet /> {/* This renders nested routes */}
      </DialogsProvider>
    </NotificationsProvider>
    </>
  )
}

export default ClientInfos
