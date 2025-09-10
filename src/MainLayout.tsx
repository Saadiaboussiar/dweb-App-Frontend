import Topbar from "./global/components/Topbar";
import Sidebar from "./global/components/Sidebar";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./admin-ui/pages/Dashboard";
import InterventionsCards from "./admin-ui/pages/operations/InterventionsCards";
import InterventionHistory from "./admin-ui/pages/operations/InterventionHistory";
import ClientsInfos from "./admin-ui/pages/operations/ClientsInfos";
import ClientsAnalysis from "./admin-ui/pages/analysis-reports/ClientsAnalysis";
import ClientsReports from "./admin-ui/pages/analysis-reports/ClientsReports";
import TechniciansBonus from "./admin-ui/pages/configuration/TechniciansBonus";
import InterventionDetails from "./admin-ui/pages/InterventionDetails";
import TechnicianShow from "./admin-ui/components/Technicians/TechnicianShow";
import TechnicianEdit from "./admin-ui/components/Technicians/TechnicianEdit";
import TechnicianList from "./admin-ui/components/Technicians/TechnicianList";
import TechnicianCreate from "./admin-ui/components/Technicians/TechnicianCreate";
import TechniciansInfos from "./admin-ui/pages/operations/TechniciansInfos";
import ClientList from "./admin-ui/components/clients/ClientList";
import ClientShow from "./admin-ui/components/clients/ClientShow";
import ClientCreate from "./admin-ui/components/clients/ClientCreate";
import ClientEdit from "./admin-ui/components/clients/ClientEdit";
import NewIntervention from "./technician-ui/pages/NewIntervention";
import TechDashboard from "./technician-ui/pages/Dashboard";
import TechInterventions from "./technician-ui/pages/TechInterventions";
import TechPoints from "./technician-ui/pages/TechPoints";
import InterventionShow from "./admin-ui/components/InterventionShow";
import Aide from "./global/pages/Aide&Support";
import ProfilePage from "./global/pages/ProfilePage";

// Create a new layout component for pages with sidebar and topbar
const MainLayout = () => {
  return (
    <div className="app">
      <Sidebar />
      <main
        className="content"
        style={{ borderLeft: "none", boxShadow: "none" }}
      >
        <Topbar />
        <Routes>
          <Route path="/aide" element={<Aide />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interventions" element={<InterventionsCards />} />
          <Route path="/allInterventions" element={<InterventionHistory />} />
          <Route
            path="/allInterventions/:interventionId"
            element={<InterventionShow />}
          />

          <Route path="/clients" element={<ClientsInfos />}>
            <Route index element={<ClientList />} />
            <Route path=":clientCin" element={<ClientShow />} />
            <Route path="new" element={<ClientCreate />} />
            <Route path=":clientCin/edit" element={<ClientEdit />} />
          </Route>
          <Route path="/clientAnalysis" element={<ClientsAnalysis />} />
          <Route path="/clientReports" element={<ClientsReports />} />
          <Route path="/bonus" element={<TechniciansBonus />} />
          <Route
            path="/interventionDetails/:interId"
            element={<InterventionDetails />}
          />
          <Route path="/technicians" element={<TechniciansInfos />}>
            <Route index element={<TechnicianList />} />
            <Route path=":technicianId" element={<TechnicianShow />} />
            <Route path="new" element={<TechnicianCreate />} />
            <Route path=":technicianId/edit" element={<TechnicianEdit />} />
          </Route>
          <Route path="/techDashboard" element={<TechDashboard />} />
          <Route path="/newInterventions" element={<NewIntervention />} />
          <Route path="/techInterventions" element={<TechInterventions />} />
          <Route path="/techPoints" element={<TechPoints />} />
        </Routes>
      </main>
    </div>
  );
};

export default MainLayout;
