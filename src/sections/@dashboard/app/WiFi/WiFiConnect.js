import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Link, Card, Button, Divider, Typography, CardHeader, Select, MenuItem, TextField, Snackbar, Alert } from '@mui/material';
import { fToNow } from '../../../../utils/formatTime';
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import Paper from '@mui/material/Paper';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

WiFiConnect.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function WiFiConnect({ title, subheader, ...other }) {
  const [wifiNetworks, setWifiNetworks] = useState([]);
  const [selectedWifi, setSelectedWifi] = useState('');
  const [password, setPassword] = useState('');
  const [retry, setRetry] = useState(0);
  const [open, setOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetch('/wifi/scan')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('WiFi networks not found');
      })
      .then(data => {
        if (data.error) {
          setTimeout(() => {
            setRetry(retry + 1); // increment retry here
          }, 2000);
          throw new Error(data.error);
        } else {
          setWifiNetworks(data.wifi_networks);
        }

      })
      .catch(error => {
        console.log(error);
        setWifiNetworks([]);
      });
  }, [retry]);

  const handleWifiChange = (event) => {
    setSelectedWifi(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = { ssid: selectedWifi, psk: password };
    fetch('/wifi/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (response.ok) {
          setAlertSeverity('success');
          setAlertMessage('WiFi configuration successful');
          console.log(response.json);
          console.log(response.text);
          console.log(response);
          console.log('WiFi configuration successful');
          setOpen(true);
        } else {
          setAlertSeverity('error');
          setAlertMessage('WiFi configuration failed');
          throw new Error('WiFi configuration failed');
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <Card {...other}>
      <CardHeader title={"WiFi Networks"} subheader={"Select a network to connect"} />
      <Box p={3}>
        {wifiNetworks && wifiNetworks.length > 0 ? (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedWifi}
                label="WiFi Network"
                onChange={handleWifiChange}
              >
                {wifiNetworks.map((network, index) => (
                  <MenuItem key={index} value={network.ssid}>{network.ssid}</MenuItem>
                ))}
              </Select>
              <TextField
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
              />
              <Button variant="contained" type="submit">Connect</Button>
            </Stack>
          </form>
        ) : (
          <Typography variant="body1" component="span" display="inline">
            <br />
            <br /> Scan in progress...
          </Typography>
        )}
      </Box>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        style={{ zIndex: 9999 }}
      >
        <Alert onClose={handleClose} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}