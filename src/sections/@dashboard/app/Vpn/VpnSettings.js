import React, { useEffect, useState } from 'react';
// @mui
import PropTypes from 'prop-types';
import { Box, Card, Typography, CardHeader } from '@mui/material';


// ----------------------------------------------------------------------

VpnSettings.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function VpnSettings({ title, subheader, list, ...other }) {
  const [vpnconf, setVpnConf] = useState('');
  const [vpnconfstatus, setVpnConfStatus] = useState('');
  const [wifiList, setWifiList] = useState([]);

  useEffect(() => {
    fetch('/vpn/configurations')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Config file not found');
      })
      .then(data => {
        console.log('VPN SUCCESS', data);
        const addressData = {
          address: data.Interface.Address,
          dns: data.Interface.DNS,
          mtu: data.Interface.MTU,
          privatekey: data.Interface.PrivateKey,
          allowedip: data.Peer.AllowedIPs,
          endpoint: data.Peer.Endpoint,
          persistentkeepalive: data.Peer.PersistentKeepalive,
          presharedkey: data.Peer.PresharedKey,
          publickey: data.Peer.PublicKey,
        };
        setVpnConf(addressData);
        setVpnConfStatus('File di configurazione VPN trovato');
      })
      .catch(error => {
        console.log(error);
        setVpnConfStatus('File di configurazione VPN non trovato');
      });
  }, []);


  useEffect(() => {
    fetch('/wifi/configurations')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Config file not found');
      })
      .then(data => {
        console.log('WIFI SUCCESS', data);
        setWifiList(data);
      })
      .catch(error => {
        console.log(error);
        setVpnConfStatus('File di configurazione VPN non trovato');
      });

  }, []);
  return (
    <Card {...other}>
      <CardHeader title={"VPN Configuration"} subheader={vpnconfstatus} />
      <Box p={3}>

        {Object.entries(vpnconf).map(([key, value]) => (
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
