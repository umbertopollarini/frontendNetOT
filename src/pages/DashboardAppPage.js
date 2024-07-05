import { Helmet } from 'react-helmet-async';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
import React from 'react';
// sections
import {
  VpnStats,
  VpnStatus,
  NetworkConnected, 
  WiFiScan,
  AppWidgetSummary,
  AppWidgetLeader,
  AppWidgetChild,
  AppWidgetTimeRouterUp,  
  AppWidgetFailCounter,
  BatteryLevel,
  CurrentConfig,
  VoltageList,
  CalibrationStats
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title> Dashboard | X Site </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetLeader />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetChild />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetTimeRouterUp />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetFailCounter />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
          <VpnStatus/>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
          <VpnStats/>
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
          <VoltageList/>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <CurrentConfig/>
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
          <WiFiScan/>
          </Grid>

        
          <Grid item xs={12} md={6} lg={4}>

           <NetworkConnected />
          <br/>
            {/* <BatteryLevel/> */}
            
          </Grid>

          
        </Grid>
      </Container>
    </>
  );
}
