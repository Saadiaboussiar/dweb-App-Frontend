import Box from "@mui/material/Box";
import { useParams } from "react-router-dom";
import TechnicianCard from "../components/TechnicianCard";
import {
  getAllInterventions,
  validateIntervetion,
  type Intervention,
} from "../../data/interventions";
import {
  getTechniciansStore,
  type TechnicianData,
} from "../../data/technicianInfos";
import VoucherPhoto from "../components/VoucherPhoto";
import InterventionInfos from "../components/InterventionInfos";
import { useEffect, useState } from "react";
import { Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../../shared-theme/theme";
import useNotifications from "../../hooks/useNotifications/useNotifications";
import {
  sendNotification,
  type NotificationRequest,
  type NotificationStatus,
} from "../../data/notifications";

const InterventionDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { interId } = useParams();
  console.log("the id of clicked intervention: ", interId);
  const interventionId = Number(interId);

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotifications] = useState<NotificationRequest>({
    clientName: "",
    interventionId: 0,
    type: "",
  });

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
    const fetchTechnicians = async () => {
      try {
        setLoading(true);
        const data = await getTechniciansStore();
        setTechnicians(data);
      } catch (err) {
        setError("Failed to load interventions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterventions();
    fetchTechnicians();
  }, []);

  console.log("Intervention: ", interventions);

  const intervention = interventions.find(
    (inter) => inter.interId === interventionId
  );
  const techFN = intervention?.technicianFN;
  const techLN = intervention?.technicianLN;

  const technician = technicians.find(
    (tech) => tech.firstName === techFN && tech.lastName === techLN
  );

  const notifications = useNotifications();


  const handleValidation = async (
    interId: number | undefined,
    isValid: boolean
  ) => {
    if (interId != undefined) {
      const type: NotificationStatus = isValid
        ? "INTERVENTION_VALIDATED"
        : "INTERVENTION_REJECTED";

      const notificationData :NotificationRequest= {
        clientName: intervention?.client ?? "",
        interventionId: intervention?.interId ?? 0,
        type: type ,
      };
      const response1 = await validateIntervetion(interId, isValid);

      const response2 = await sendNotification(
        technician?.email ?? "",
        notificationData
      );

      console.log("reponse de validation: ", response1.data);

      if (
        response1 != null &&
        response1 != undefined &&
        response2 != null &&
        response2 != undefined
      ) {
        notifications.show(
          isValid ? "Intervetion est validé." : "Intervention est rejeté.",
          {
            severity: isValid ? "success" : "error",
            autoHideDuration: 3000,
          }
        );
      } else {
        notifications.show("Action n'est pas validé.", {
          severity: "warning",
          autoHideDuration: 3000,
        });
      }
    } else {
      alert("l'intervention n'est pas difiner");
    }
  };

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
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "200px",
          alignItems: "center",
          justifyContent: "center",
          mt: "40px",
          mb: "30px",
        }}
      >
        <Button
          sx={{
            bgcolor: colors.greenAccent[600],
            width: "200px",
            height: "40px",
            "&:hover": {
              bgcolor: colors.greenAccent[700],
            },
          }}
          onClick={() => handleValidation(intervention?.interId, true)}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#ddd2d2ff" }}
          >
            Valider
          </Typography>
        </Button>
        <Button
          sx={{
            bgcolor: colors.redAccent[600],
            width: "200px",
            height: "40px",
            "&:hover": {
              bgcolor: colors.redAccent[700],
            },
          }}
          onClick={() => handleValidation(intervention?.interId, false)}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#e7dedeff" }}
          >
            Rejeter
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default InterventionDetails;
