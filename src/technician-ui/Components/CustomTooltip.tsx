import React from 'react';
import { Box, Typography } from '@mui/material';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          Mois: {label}
        </Typography>
        <Typography variant="body2">
          Points: {payload[0].value}
        </Typography>
      </Box>
    );
  }

  return null;
};

export default CustomTooltip;