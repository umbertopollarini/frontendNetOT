import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
// components
import Iconify from '../components/iconify';
// sections
import DeviceList from '../sections/@dashboard/app/Devices/DevicesList';

import {
  AppRawNetwork,
  StreamCoap
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function NetworkDevices() {
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title> Network Devices </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Network Devices
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <DeviceList />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
             <StreamCoap/>
          </Grid>
        </Grid>

      </Container>
    </>
  );
}
