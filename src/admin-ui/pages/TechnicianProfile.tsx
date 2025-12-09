import { RouterProvider } from 'react-router-dom';
import { createHashRouter } from 'react-router-dom';
import TechnicianList from '../compenents/TechnicianList';
import TechnicianShow from '../compenents/TechnicianShow';
import TechnicianCreate from '../compenents/TechnicianCreate';
import TechnicianEdit from '../compenents/TechnicianEdit';
import NotificationsProvider from '../../hooks/useNotifications/NotificationsProvider';
import DialogsProvider from '../../hooks/useDialogs/DialogsProvider';
import DashboardLayout from '../compenents/DashboardLayout';

const router = createHashRouter([
  {
    Component: DashboardLayout,
    children: [
      { path: '/technicians', Component: TechnicianList },
      { path: '/technicians/:technicianId', Component: TechnicianShow },
      { path: '/technicians/new', Component: TechnicianCreate },
      { path: '/technicians/:technicianId/edit', Component: TechnicianEdit },
      { path: '*', Component: TechnicianList },
    ],
  },
]);

export default function TechnicianProfile() {
  return (
    <NotificationsProvider>
      <DialogsProvider>
        <RouterProvider router={router} />
      </DialogsProvider>
    </NotificationsProvider>
  );
}
