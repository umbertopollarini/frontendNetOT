import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, Typography, CardHeader } from '@mui/material';
import LeakAddIcon from '@mui/icons-material/LeakAdd';

NetworkConnected.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};


export default function NetworkConnected({ title, subheader, ...other }) {
  const [networkInterface, setNetworkInterface] = useState('');
  useEffect(() => {
    fetch('/wifi/interface')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network interface not found');
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        } else {
          setNetworkInterface(data.interface);
        }
      })
      .catch(error => {
        console.log(error);
        setNetworkInterface('');
      });
  }, []); 

  return (
    <Card {...other}>
      <CardHeader title={"Connected Network Interface"} subheader={"The network interface of which is connected"} />
      <Box p={3}>
        { networkInterface ? (
        
          <Typography variant="body1" component="span" display="inline">
            <LeakAddIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} />
            &nbsp;{networkInterface}
          </Typography>
        ) : (
          <Typography variant="body1" component="span" display="inline">
            <br /> Network interface not found...
          </Typography>
        )}
      </Box>
    </Card>
  );
}