import Box from "@mui/material/Box";
import Header from "../../../global/components/Header";
import InterventionList from "../../components/InterventionsList";
import ErrorBoundary from "../../components/ErrorBoundary";

const InterventionHistory = () => {
  return (
    <>
      <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header
            title="TOUS LES INTERVENTIONS EFFECTUEES"
            subTitle="Historique et détails de toutes les interventions"
          />
        </Box>
        <ErrorBoundary>
          <InterventionList />
        </ErrorBoundary>
      </Box>
    </>
  );
};

export default InterventionHistory;
