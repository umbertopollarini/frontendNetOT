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

export default function AppWidgetLeader() {
  const [roleLeader, setRoleLeader] = useState(1);

  // useEffect(() => {
  //   fetch('/openthread/counters/mle')
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setRoleLeader(data['Role Router']-);
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching data:', error);
  //     });
  // }, []);

  return (
    <Card
      sx={{
        py: 5,
        boxShadow: 0,
        textAlign: 'center',
        color: (theme) => theme.palette['primary'].darker,
        bgcolor: (theme) => theme.palette['primary'].lighter,
      }}
    >
      <StyledIcon
        sx={{
          color: (theme) => theme.palette['primary'].dark,
          backgroundImage: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette['primary'].dark, 0)} 0%, ${alpha(
              theme.palette['primary'].dark,
              0.24
            )} 100%)`,
        }}
      >
        <Iconify icon={'mingcute:router-modem-fill'} width={24} height={24} />
      </StyledIcon>

      <Typography variant="h3">{roleLeader}</Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
        Leader
      </Typography>
    </Card>
  );
}
