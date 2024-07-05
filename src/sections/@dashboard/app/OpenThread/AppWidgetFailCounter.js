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

export default function AppWidgetFailCounter() {
  const [failCounter, setFailCounter] = useState(0);

  useEffect(() => {
    fetch('/openthread/failCounter')
      .then((response) => response.json())
      .then((data) => {
        setFailCounter(data.failCounter);
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
        color: (theme) => theme.palette['error'].darker,
        bgcolor: (theme) => theme.palette['error'].lighter,
      }}
    >
      <StyledIcon
        sx={{
          color: (theme) => theme.palette['error'].dark,
          backgroundImage: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette['error'].dark, 0)} 0%, ${alpha(
              theme.palette['error'].dark,
              0.24
            )} 100%)`,
        }}
      >
        <Iconify icon={'solar:danger-bold'} width={28} height={28} />
      </StyledIcon>

      <Typography variant="h3">{failCounter}</Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
        Fail Counter
      </Typography>
    </Card>
  );
}
