import { Box } from '@mui/material'
import Header from '../components/Header'
import React from 'react'
import Notifications from '../components/Notifications'

const NotificationPage = () => {
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Notifications"
          subTitle="Consultez l’état de vos interventions"
        />
      </Box>
      <Box mt="20px">
        <Notifications/>
      </Box>
    </Box>
  )
}

export default NotificationPage