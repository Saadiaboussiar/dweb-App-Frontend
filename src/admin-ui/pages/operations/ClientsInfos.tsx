import Box from '@mui/material/Box'
import Header from '../../compenents/Header'

const ClientsInfos = () => {
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="LES INFORMATIONS DES CLIENTS" subTitle="Gérez et consultez les informations de vos clients"/>
      </Box>
    </Box>
  )
}

export default ClientsInfos