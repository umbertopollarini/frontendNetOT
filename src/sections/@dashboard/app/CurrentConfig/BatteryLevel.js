import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, Typography, CardHeader } from '@mui/material';
import BatterySaverIcon from '@mui/icons-material/BatterySaver';

export default function BatteryLevel({ title, subheader, ...other }) {
    const [batteryLevels, setBatteryLevels] = useState([]);

    useEffect(() => {
        fetch('/current/battery')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Battery data not found');
            })
            .then(data => {
                if (Object.keys(data).length > 0) {
                    setBatteryLevels(data);
                } else {
                    throw new Error('Battery data not found');
                }
            })
            .catch(error => {
                console.log(error);
                setBatteryLevels([]);
            });
    }, []);

    return (
        <Card {...other}>
            <CardHeader title={"Battery Level"} subheader={"Current level battery of BS02"} />
            <Box p={3}>
                {Object.keys(batteryLevels).map((key, index) => (
                    <Typography key={index} variant="body1" component="span" display="inline">
                        {batteryLevels[key].MACADDRESS}
                        <br />
                        <BatterySaverIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} />
                        &nbsp;
                        Battery level: {batteryLevels[key].level}%
                        <br />
                        <span  style={{ fontSize: 12, color: 'grey' }}>
                        Last Update: {new Date(batteryLevels[key].timestamp/1000).toLocaleString()}</span>
                        <br /><br />
                    </Typography>
                ))}
            </Box>
        </Card>
    );
}
