// @mui
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography } from '@mui/material';
// utils
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

const StyledIcon = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(8),
  height: theme.spacing(8),
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
}));

function millisecondsToHours(milliseconds) {
  const hours = milliseconds / (1000 * 60 * 60);
  return hours.toFixed(2);
}

export default function AppWidgetTimeRouterUp() {
  const [timeRouterMilli, setTimeRouterMilli] = useState(0);

  useEffect(() => {
    fetch('/openthread/counters/mle')
      .then((response) => response.json())
      .then((data) => {
        setTimeRouterMilli(millisecondsToHours(data['Time Router Milli']) );
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <Card
      sx={{
        py: 5,
        boxShadow: 0,
        textAlign: 'center',
        color: (theme) => theme.palette['warning'].darker,
        bgcolor: (theme) => theme.palette['warning'].lighter,
      }}
    >
      <StyledIcon
        sx={{
          color: (theme) => theme.palette['warning'].dark,
          backgroundImage: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette['warning'].dark, 0)} 0%, ${alpha(
              theme.palette['warning'].dark,
              0.24
            )} 100%)`,
        }}
      >
        <Iconify icon={'grommet-icons:time'} width={34} height={34} />
      </StyledIcon>

      <Typography variant="h3">{timeRouterMilli} h</Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
        Router Up Time
      </Typography>
    </Card>
  );
}
