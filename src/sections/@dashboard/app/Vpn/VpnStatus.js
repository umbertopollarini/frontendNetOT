import React, { useEffect, useState } from 'react';
// @mui
import PropTypes from 'prop-types';
import { Box, Stack, Link, Card, Button, Divider, Typography, CardHeader } from '@mui/material';
// utils
import { fToNow } from '../../../../utils/formatTime';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';



// ----------------------------------------------------------------------

VpnStatus.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function VpnStatus({ title, subheader, list, ...other }) {
  const [vpnstatus, setVpnStatus] = useState('');
  const [vpnstatusstatus, setVpnStatusStatus] = useState('');

  useEffect(() => {
    fetch('/vpn/status')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Status file not found');
      })
      .then(data => {
        console.log('VPN SUCCESS', data);
        const statusData = {
          allowed_ips: data.allowed_ips,
          endpoint: data.endpoint,
          fwmark: data.fwmark,
          interface: data.interface,
          latest_handshake: data.latest_handshake,
          listening_port: data.listening_port,
          peer: data.peer,
          persistent_keepalive: data.persistent_keepalive,
          preshared_key: data.preshared_key,
          private_key: data.private_key,
          public_key: data.public_key,
          transfer: data.transfer,
        };
        setVpnStatus(statusData);
        setVpnStatusStatus('Configurazione VPN attiva sull interfaccia ' + data.interface);
      })
      .catch(error => {
        console.log(error);
        setVpnStatusStatus('VPN non configurata');
      });
  }, []);

  return (
    <Card {...other}>
      <CardHeader title={"VPN Status"} subheader={vpnstatusstatus} />
      <Box p={3}>

        {Object.entries(vpnstatus).map(([key, value]) => (
          <Box key={key} marginBottom={1}>
            <Typography variant="body1" component="strong" display="inline">
              <strong>{key}</strong>
            </Typography>
            <Typography variant="body1" component="span" marginLeft={1} display="inline">
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------