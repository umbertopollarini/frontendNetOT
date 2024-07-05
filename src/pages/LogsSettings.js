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
  LogsInfos,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppConversionRates,
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function LogsSettings() {
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title> Logs Settings </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Logs Settings
        </Typography>
        <LogsInfos />
        <Grid container spacing={3}>
        
         
        </Grid>
      </Container>
    </>
  );
}