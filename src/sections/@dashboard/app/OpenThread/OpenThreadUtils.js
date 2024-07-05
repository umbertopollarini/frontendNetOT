import React, { useEffect, useState } from 'react';
// @mui
import PropTypes from 'prop-types';
import { Box, Card, Button, CardHeader, TextField, Snackbar } from '@mui/material';
import { Alert } from '@mui/material';
// components


// ----------------------------------------------------------------------

OpenThreadUtils.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function OpenThreadUtils({ title, subheader, list, ...other }) {
  const [config, setConfig] = useState({
    panid: '',
    extpanid: '',
    networkname: '',
    networkkey: '',
    channel: '',
  });

  const [open, setOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetch('/openthread/configurations')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Configuration file not found');
      })
      .then(data => {
        console.log('CONFIGURATION SUCCESS', data);
        setConfig(data.config);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const handleChange = (event) => {
    setConfig({
      ...config,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch('/openthread/configurations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config }),
    })
      .then(response => {
        if (response.ok) {
          console.log('POST SUCCESS');
          setAlertSeverity('success');
          setAlertMessage('Configuration saved successfully');
          setOpen(true);
        }else{ 
          setAlertSeverity('error');
          setAlertMessage('Failed to save configuration'); 
          setOpen(true);
          throw new Error('POST request failed');
         
        }
        
      })
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Card {...other}>
      <CardHeader title={"OpenThread Configuration"} subheader={"Configure OpenThread network"} />
      <Box p={3}>
        <form onSubmit={handleSubmit}>
          <Box marginBottom={2}>
            <TextField
              fullWidth
              label="PAN ID"
              name="panid"
              value={config.panid}
              onChange={handleChange}
            />
          </Box>
          <Box marginBottom={2}>
            <TextField
              fullWidth
              label="Extended PAN ID"
              name="extpanid"
              value={config.extpanid}
              onChange={handleChange}
            />
          </Box>
          <Box marginBottom={2}>
            <TextField
              fullWidth
              label="Network Name"
              name="networkname"
              value={config.networkname}
              onChange={handleChange}
            />
          </Box>
          <Box marginBottom={2}>
            <TextField
              fullWidth
              label="Network Key"
              name="networkkey"
              value={config.networkkey}
              onChange={handleChange}
            />
          </Box>
          <Box marginBottom={2}>
            <TextField
              fullWidth
              label="Channel"
              name="channel"
              value={config.channel}
              onChange={handleChange}
            />
          </Box>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </form>
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
      </Box>
    </Card>
  );
}