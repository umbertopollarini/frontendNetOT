import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardHeader, Typography } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { useTheme, styled } from '@mui/material/styles';


const CHART_HEIGHT = 372;
const LEGEND_HEIGHT = 72;

const StyledChartWrapper = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(5),
  '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible',
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    alignContent: 'center',
    position: 'relative !important',
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

VpnStats.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};


export default function VpnStats({ title, subheader, ...other }) {
  const [vpnstatus, setVpnStatus] = useState({});

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
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  

  const options = {
    colors: ['#F64843','#2365D1'],
    labels: ['Received', 'Sent'],
    legend: {
      position: 'bottom',
    },
  };


  const series = vpnstatus.transfer ? [Number(vpnstatus.transfer.split(' ')[0]), Number(vpnstatus.transfer.split(' ')[3])] : [];
  return (
    <Card {...other}>
      <CardHeader title={title || 'VPN Stats'} subheader={subheader} />
      <Box p={3}>
      <StyledChartWrapper dir="ltr">
        <ReactApexChart type="pie" series={series} options={options} height={380} />
      </StyledChartWrapper>
      </Box>
    </Card>
  );}

