import React from "react";
import Header from "../../global/components/Header";
import Box from "@mui/material/Box";
import AdminAnalyticsDashboard from "../components/AdminDashboard";

const Dashboard: React.FC = () => {
  return (
    <Box m="20px">
      <Box justifyContent="space-between" alignItems="center">
        <Header
          title="TABLEAU DE BORD"
          subTitle="Tableau de bord pour une analyse complète de la rentabilité des techniciens et clients"
        />
        <AdminAnalyticsDashboard/>
      </Box>
    </Box>
  );
};

export default Dashboard;
