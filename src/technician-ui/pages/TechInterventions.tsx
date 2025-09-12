import Box from "@mui/material/Box";
import Header from "../../global/components/Header";
import InterventionList from "../../admin-ui/components/InterventionsList";

const TechInterventions = () => {
  return (
    <Box m="20px" >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="VOS INTERVENTIONS"
          subTitle="Consultez la liste de vos interventions déclarées qui sont en status en attente"
        />
      </Box>
      <Box >
        <InterventionList/>
      </Box>
      
    </Box>
  );
};

export default TechInterventions;
