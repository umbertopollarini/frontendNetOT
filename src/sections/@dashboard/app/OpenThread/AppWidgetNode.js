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

export default function AppWidgetChild() {
  const [roleChild, setRoleChild] = useState(0);

  useEffect(() => {
    fetch('/openthread/counters/nodes')
      .then((response) => response.json())
      .then((data) => {
        setRoleChild(data['Node Count']-1);
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
        color: (theme) => theme.palette['secondary'].darker,
        bgcolor: (theme) => theme.palette['secondary'].lighter,
      }}
    >
      <StyledIcon
        sx={{
          color: (theme) => theme.palette['secondary'].dark,
          backgroundImage: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette['secondary'].dark, 0)} 0%, ${alpha(
              theme.palette['secondary'].dark,
              0.24
            )} 100%)`,
        }}
      >
        <Iconify icon={'fa6-solid:circle-nodes'} width={24} height={24} />
      </StyledIcon>

      <Typography variant="h3">{roleChild}</Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
        Router Nodes
      </Typography>
    </Card>
  );
}
