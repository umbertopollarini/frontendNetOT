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
  DockerList,
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function DockerSettings() {
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title> Docker Settings </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Docker Settings
        </Typography>
       
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <DockerList/>
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