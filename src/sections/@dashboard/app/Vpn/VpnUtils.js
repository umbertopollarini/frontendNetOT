import React, { useState, useEffect } from 'react';
// @mui
import PropTypes from 'prop-types';
import { Box, Stack, Link, Card, Button, Divider, Typography, CardHeader, TextField, Snackbar } from '@mui/material';
import { Alert } from '@mui/material';

// ----------------------------------------------------------------------

VpnUtils.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.string,
};

export default function VpnUtils({ title, subheader, ...other }) {
        const [config, setConfig] = useState('');
        const [open, setOpen] = useState(false);
        const [alertSeverity, setAlertSeverity] = useState('success');
        const [alertMessage, setAlertMessage] = useState('');

        useEffect(() => {
            fetch('/vpn/configurations/raw')
                .then(response => {
                    if (response.ok) {
                        response.json().then
                            (data => setConfig(data.config));
                    } else {
                        throw new Error('Failed to fetch configuration');
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }, []);

        const handleConfigChange = (event) => {
            setConfig(event.target.value);
        };

        const handleConfigSubmit = () => {
            fetch('/vpn/configurations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ config })
            })
                .then(response => {
                    if (response.ok) {
                        setAlertSeverity('success');
                        setAlertMessage('Configuration uploaded successfully');
                        setOpen(true);
                    } else {
                        setAlertSeverity('error');
                        setAlertMessage('Configuration upload failed');
                        setOpen(true);
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        };

        const handleRestartVpn = () => {
            fetch('/vpn/restart', {
                method: 'POST'
            })
                .then(response => {
                    if (response.ok) {
                        setAlertSeverity('success');
                        setAlertMessage('VPN restarted successfully');
                        setOpen(true);
                    } else {
                        setAlertSeverity('error');
                        setAlertMessage('VPN restart failed');
                        setOpen(true);
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
                <CardHeader title={"VPN Utils"} subheader={subheader} />
                <Box p={3}>
                    <TextField
                        id="config"
                        label="Upload configuration"
                        multiline
                        rows={8}
                        value={config}
                        onChange={handleConfigChange}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                    />
                    <Button variant="contained" onClick={handleConfigSubmit}>Submit</Button>
                    <Box mt={2}>
                        <Button variant="contained" onClick={handleRestartVpn}>Restart VPN</Button>
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
                </Box>
            </Card>
        );
    }
              