import { Helmet } from 'react-helmet-async';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
import React from 'react';
// sections
import {
  WiFiScan,
  WiFiConnect,
  WiFiUtils,
  NetworkConnected
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function WiFiSettings() {
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title> Wifi Settings </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Wifi Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={8}>
            <WiFiScan />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <WiFiConnect />
          </Grid>
          <Grid item xs={12} md={6} lg={8}>
            <WiFiUtils />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <NetworkConnected />
          </Grid>
        </Grid>

      </Container>
    </>
  );
}