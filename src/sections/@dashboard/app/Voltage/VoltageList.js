import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Scrollbar from '../../../../components/scrollbar';

VoltageLogs.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function VoltageLogs({ title, subheader, ...other }) {
  const [logsData, setLogsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Voltage normal'); // Default status

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    setIsLoading(true);
    fetch('/check-voltage')
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setLogsData([]); // Clear previous logs if any
          setCurrentStatus('Voltage normal'); // Default to normal if no data
        } else {
          // Reverse the log data to show the most recent entries at the top
          const reversedLogs = data.voltage_logs.slice().reverse();
          setLogsData(reversedLogs);
          setCurrentStatus(reversedLogs.length > 0 ?
            (reversedLogs[0].message.includes('Undervoltage') ? 'Undervoltage detected!' : 'Voltage normal') :
            'Voltage normal'
          );
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch voltage logs', error);
        setIsLoading(false);
        setCurrentStatus('Voltage normal'); // Assume normal if error
      });
  };

  return (
    <Card {...other}>
      <Box p={3}>
        <Typography variant="h6" color="primary.main" sx={{ mt: 2, mb: 2 }}>
          Current Status: {currentStatus}
        </Typography>
        <br />
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Scrollbar>
            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logsData.length > 0 ? (
                    logsData.map((log, index) => (
                      <TableRow key={index} sx={{ bgcolor: log.message.includes('Undervoltage') ? '#FFCDD2' : 'inherit' }}>
                        <TableCell>{log.timestamp}</TableCell>
                        <TableCell>{log.message}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No voltage logs available or all voltages are normal.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        )}
      </Box>
    </Card>
  );
}
