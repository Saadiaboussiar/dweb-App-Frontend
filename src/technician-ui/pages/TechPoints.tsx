import Box from "@mui/material/Box";
import Header from "../../global/components/Header";

const TechPoints = () => {
  return (
    <>
      <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header
            title="VOS POINTS"
            subTitle="Consultez vos points mensuelss"
          />
        </Box>
      </Box>
    </>
  );
};

export default TechPoints;
