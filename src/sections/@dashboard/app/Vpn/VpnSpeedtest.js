import React, { useEffect, useState } from 'react';
// @mui
import PropTypes from 'prop-types';
import { Box,  Card,  Typography, CardHeader, CircularProgress } from '@mui/material';




// ----------------------------------------------------------------------

VpnSpeedtest.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function VpnSpeedtest({ title, subheader, list, ...other }) {
  const [vpnSpeedtest, setVpnSpeedtest] = useState({});
  const [vpnSpeedtestStatus, setVpnSpeedtestStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/vpn/speedtest')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Speedtest file not found');
      })
      .then(data => {
        console.log('VPN SPEEDTEST SUCCESS', data);
        setVpnSpeedtest(data);
        setVpnSpeedtestStatus('Speedtest VPN eseguito con successo');
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setVpnSpeedtestStatus('Speedtest VPN non eseguito');
        setIsLoading(false);
      });
  }, []);

  return (
    <Card {...other}>
      <CardHeader title={"VPN Speedtest"} subheader={vpnSpeedtestStatus} />
      <Box p={3}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {Object.entries(vpnSpeedtest).map(([key, value]) => (
              <Box key={key} marginBottom={1}>
                <Typography variant="body1" component="strong" display="inline">
                  <strong>{key}</strong>
                </Typography>
                <Typography variant="body1" component="span" marginLeft={1} display="inline">
                  {value}
                </Typography>
              </Box>
            ))}
          </>
        )}
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------