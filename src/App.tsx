import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Topbar from './admin-ui/global/Topbar';
import Sidebar from "./admin-ui/global/Sidebar";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./admin-ui/pages/Dashboard";
import InterventionsCards from "./admin-ui/pages/operations/InterventionsCards";
import InterventionHistory from "./admin-ui/pages/operations/InterventionHistory";
import ClientsInfos from "./admin-ui/pages/operations/ClientsInfos";
import ClientsAnalysis from "./admin-ui/pages/analysis-reports/ClientsAnalysis";
import ClientsReports from "./admin-ui/pages/analysis-reports/ClientsReports";
import TechniciansBonus from "./admin-ui/pages/configuration/TechniciansBonus";
import Aide from "./admin-ui/pages/configuration/Aide";
import TechniciansInfos from "./admin-ui/pages/operations/TechniciansInfos";


const App: React.FC = () => {
  const [theme, colorMode]=useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline/>
          <div className="app">
            <Sidebar />
            <main className="content" style={{ borderLeft: "none", boxShadow: "none" }}>
              <Topbar />
              <Routes>
                <Route path='/' element={<Dashboard/>}/>
                <Route path='/interventions' element={<InterventionsCards/>}/>
                <Route path='/allInterventions' element={<InterventionHistory/>}/>
                <Route path='/technicians' element={<TechniciansInfos/>}/> 
                <Route path='/clients' element={<ClientsInfos/>}/> 
                <Route path='/clientAnalysis' element={<ClientsAnalysis/>}/> 
                <Route path='/clientReports' element={<ClientsReports/>}/> 
                <Route path='/bonus' element={<TechniciansBonus/>}/> 
                <Route path='/aide' element={<Aide/>}/> 
              </Routes>
            </main>
          </div>
        </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
