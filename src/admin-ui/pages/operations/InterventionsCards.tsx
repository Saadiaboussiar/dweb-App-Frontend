import Box from '@mui/material/Box'
import Header from '../../compenents/Header'

const InterventionsCards = () => {
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="LES NOUVELLES INTERVENTIONS" subTitle="Consultez et gérez les interventions récentes"/>
      </Box>
    </Box>
  )
}

export default InterventionsCards