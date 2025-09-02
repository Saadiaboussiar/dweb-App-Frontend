import Box from "@mui/material/Box";
import Header from "../../global/components/Header";
import PointsDash from "../Components/PointsDashAdmin";

const TechPoints = () => {
  return (
    <>
      <Box m="20px" >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header
            title="VOS POINTS"
            subTitle="Consultez vos points mensuelss"
          />
        </Box>
        <Box mt="20px" mb="20px">
          <PointsDash />
        </Box>
      </Box>
    </>
  );
};

export default TechPoints;
