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
  ServiceList,
} from '../sections/@dashboard/app';
import CalibrationStats from '../sections/@dashboard/app/Calibration/CalibrationStats';
// ----------------------------------------------------------------------

export default function CalibrationPage() {
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title> Calibration Stats </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Calibration
        </Typography>
       
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <CalibrationStats/>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
          </Grid>
          <Grid item xs={12} md={6} lg={8}>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
          </Grid>
        </Grid>
       
      </Container>
    </>
  );
}