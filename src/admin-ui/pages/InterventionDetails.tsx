import Box from "@mui/material/Box";
import { useParams } from "react-router-dom";
import TechnicianCard from "../components/TechnicianCard";
import { getAllInterventions, type Intervention } from "../../data/interventions";
import { getTechniciansStore, type TechnicianData } from "../../data/technicianInfos";
import VoucherPhoto from "../components/VoucherPhoto";
import InterventionInfos from "../components/InterventionInfos";
import { useEffect, useState } from "react";

const InterventionDetails = () => {
  const { interId } = useParams();
  console.log("the id of clicked intervention: ", interId);
  const interventionId = Number(interId);

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [technicians,setTechnicians]=useState<TechnicianData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setLoading(true);
        const data = await getAllInterventions();
        setInterventions(data);
      } catch (err) {
        setError("Failed to load interventions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const fetchTechnicians=async ()=>{
      try{
        setLoading(true);
        const data=await getTechniciansStore();
        setTechnicians(data);
      }catch(err){
        setError("Failed to load interventions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchInterventions();
    fetchTechnicians();

  }, []);
  console.log("Intervention: ", interventions)

  const intervention = interventions.find(
    (inter) => inter.interId === interventionId
  );
  const techFN = intervention?.technicianFN;
  const techLN = intervention?.technicianLN;

  const technician = technicians.find(
    (tech) => tech.firstName === techFN && tech.lastName === techLN
  );
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      ml="270px"
    >
      <Box
        display="flex"
        sx={{ flexDirection: { xs: "column", md: "row", sm: "column" } }}
        justifyContent="center"
        gap="130px"
      >
        <Box>
          <TechnicianCard
            technicianId={technician?.id ?? "Inconnue"}
            firstName={technician?.firstName ?? "Inconnue"}
            lastName={technician?.lastName ?? "Inconnue"}
            email={technician?.email ?? "Inconnue"}
            phoneNumber={technician?.phoneNumber ?? "Inconnue"}
            profileUrl={technician?.profileUrl ?? "Inconnue"}
          />
        </Box>
        <Box mt="30px" mr="50px">
          <VoucherPhoto photo={intervention?.interUrl ?? ""} />
        </Box>
      </Box>
      <Box>
        <InterventionInfos intervention={intervention ?? undefined} />
      </Box>
    </Box>
  );
};

export default InterventionDetails;
