import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, Typography, CardHeader } from '@mui/material';


export default function CurrentConfig({ title, subheader, list, ...other }) {
    const [conf, setconf] = useState({});
    const [confstatus, setconfStatus] = useState('');

    useEffect(() => {
        fetch('/current/config')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Config file not found');
            })
            .then(data => {
                console.log('CONFIG SUCCESS', data);
                const addressData = {
                    Organization_Id: data.organization_id,
                    User_Id: data.user_id,
                    Router_Mac: data.brInfo.mac,
                    Router_Name: data.brInfo.name
                };
                setconf(addressData);
                setconfStatus('File di configurazione trovato');
            })
            .catch(error => {
                console.log(error);
                setconfStatus('File di configurazione non trovato');
            });
    }, []);


    return (
        <Card {...other}>
            <CardHeader title={"Current Configuration "} subheader={confstatus} />
            <Box p={3}>
                {Object.entries(conf).map(([key, value]) => (
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
