import Box from "@mui/material/Box";
import Header from "../../../global/components/Header";
import InterCard from "../../components/InterCard";
import { type InterventionEssentials, getAllInterventionsCards } from "../../../data/interventions";
import { selectIsCollapsed } from "../../../features/slices/layoutSlice";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const InterventionsCards = () => {
  const isCollapsed = useSelector(selectIsCollapsed);

  const [cards, setCards] = useState<InterventionEssentials[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
      const fetchInterventions = async () => {
        try {
          setLoading(true);
          const data = await getAllInterventionsCards();
          setCards(data);
        } catch (err) {
          setError("Failed to load interventions");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchInterventions();
    }, []);

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
              technicianFullName={item.technicianFullName}
              client={item.client}
              ville={item.ville}
              submittedAt={item.submittedAt}
              date={item.date}
              status={item.status}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default InterventionsCards;
