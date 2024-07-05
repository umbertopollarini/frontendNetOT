import { Helmet } from 'react-helmet-async';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
import React from 'react';
// sections
import {
    CurrentConfig,
    BatteryLevel
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function CurrentStatus() {
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title> Current Config </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
            Current Config
        </Typography>
       
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={8}>
           <CurrentConfig/>
          </Grid>
          {/* <Grid item xs={12} md={6} lg={4}>
            <BatteryLevel/>
          </Grid> */}
          
        </Grid>
       
      </Container>
    </>
  );
}