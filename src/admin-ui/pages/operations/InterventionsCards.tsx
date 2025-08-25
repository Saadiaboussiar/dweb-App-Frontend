import Box from "@mui/material/Box";
import Header from "../../../global/components/Header";
import InterCard from "../../components/InterCard";
import { cards } from "../../../data/cardsList";
import { selectIsCollapsed } from "../../../comp_management/redux_slices/layoutSlice";
import { useSelector } from "react-redux";

const InterventionsCards = () => {
  const isCollapsed = useSelector(selectIsCollapsed);
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="LES NOUVELLES INTERVENTIONS"
          subTitle="Consultez et gérez les interventions récentes"
        />
      </Box>

      <Box
        display="flex"
        flexWrap="wrap"
        gap={isCollapsed ? 3 : 2} // spacing between cards
        p={2}
        justifyContent="center"
        ml={isCollapsed ? "150px" : "270px"}
        sx={{ transition: "margin-left 0.3s ease" }}
      >
        {cards.map((item, index) => (
          <Box
            key={index}
            sx={{
              flex: "1 1 calc(33.33% - 16px)", // responsive-ish 3 per row
              minWidth: "250px",
              maxWidth: "350px",
            }}
          >
            <InterCard
              interId={item.interId}
              technicianName={item.technicianName}
              clientName={item.clientName}
              adresse={item.adresse}
              heure={item.heure}
              date={item.date}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default InterventionsCards;
