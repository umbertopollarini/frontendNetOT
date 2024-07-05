import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Link, Card, Button, Divider, Typography, CardHeader, Select, MenuItem } from '@mui/material';
import { fToNow } from '../../../../utils/formatTime';
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import Paper from '@mui/material/Paper';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

WiFiScan.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};


export default function WiFiScan({ title, subheader, ...other }) {
  const [wifiNetworks, setWifiNetworks] = useState([]);
  const [retry, setRetry] = useState(0);
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

  return (
    <Card {...other}>
      <CardHeader title={"WiFi Networks"} subheader={"Select a network to connect"} />
      <Box p={3}>
        { wifiNetworks.length > 0 ? (
          <Scrollbar>
            <br />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SSID</TableCell>
                    <TableCell>Signal Level</TableCell>
                    <TableCell>Channel</TableCell>
                    <TableCell>Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wifiNetworks.map((network, index) => (
                    <TableRow key={index}>
                      <TableCell>{network.ssid}</TableCell>
                      <TableCell>{network.signal_level}</TableCell>
                      <TableCell>{network.channel}</TableCell>
                      <TableCell>{network.address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        ) : (
          <Typography variant="body1" component="span" display="inline">
            <br />
            <br /> Scan in progress...
          </Typography>
        )}
      </Box>
    </Card>
  );
}