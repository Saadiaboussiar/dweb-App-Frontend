import Box from "@mui/material/Box";
import Header from "../components/Header";
import AideComponent from "../components/Aide";

const Aide = () => {
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="AIDE ET SUPPORT"
          subTitle="Trouvez des réponses et contactez notre équipe d’assistance"
        />
      </Box>
      <Box mt="20px">
        <AideComponent/>
      </Box>
    </Box>
  );
};

export default Aide;
