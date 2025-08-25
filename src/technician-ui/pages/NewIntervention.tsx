import Box from "@mui/material/Box"
import Header from "../../global/components/Header"
import InterventionForm from "../Components/InterventionForm"

const NewIntervention = () => {
  return (
    <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header
            title="NOUVELLE INTERVENTION"
            subTitle="Déclarer une nouvelle Intervention"
          />
        </Box>
        <InterventionForm />
      </Box>
  )
}

export default NewIntervention