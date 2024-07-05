import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
// components
import Iconify from '../components/iconify';
// sections
import {
  OpenThreadUtils,
  OpenThreadBrStatus,
  AppTasks,
  VpnSettings,
  VpnStatus,
  VpnSpeedtest,
  VpnUtils,
  VpnStats,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
  AppChartNetwork,
  AppRawNetwork,
  StreamCoap
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function OpenThreadSettings() {
  const theme = useTheme();



  return (
    <>
      <Helmet>
        <title> OpenThread Connections </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          OpenThread Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={8}>
            <OpenThreadUtils/>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
           <OpenThreadBrStatus/>
          </Grid>

          
          <Grid  item xs={12} md={12} lg={12}>
             <AppChartNetwork/>
          </Grid>
            <Grid item xs={12} md={6} lg={4} sx={{ position: 'relative', zIndex: -1 }}>
          </Grid>
        </Grid>
       
      </Container>
    </>
  );
}
