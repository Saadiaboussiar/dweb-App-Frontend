import Box from "@mui/material/Box";
import Header from "../../../global/components/Header";

const ClintsReports = () => {
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="RAPORTS DES CLIENTS"
          subTitle="Consultez les données détaillées sur chaque client"
        />
      </Box>
    </Box>
  );
};

export default ClintsReports;
