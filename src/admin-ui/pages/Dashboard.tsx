import React from "react";
import Header from "../../global/components/Header";
import Box from "@mui/material/Box";

const Dashboard: React.FC = () => {
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="TABLEAU DE BORD"
          subTitle="Bienvenue sur votre Tableau de bord"
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
