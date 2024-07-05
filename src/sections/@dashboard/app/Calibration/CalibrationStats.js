import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardHeader, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Select, MenuItem, Typography, Alert, Snackbar, FormControl, InputLabel
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function CalibrationStats() {
  const [calibrations, setCalibrations] = useState([]);
  const [selectedCalibration, setSelectedCalibration] = useState(null);
  const [roomStats, setRoomStats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    fetchCalibrations();
  }, []);


  const fetchCalibrations = async () => {
    try {
      const response = await fetch('/calibration/get_calibration_details');
      if (!response.ok) {
        throw new Error('Failed to load calibrations');
      }
      const data = await response.json();

      // Inverte l'ordine degli elementi nell'array
      const reversedData = data.reverse();

      setCalibrations(reversedData);
      if (reversedData.length > 0) {
        setSelectedCalibration(reversedData[0]);
        fetchRoomStats(reversedData[0].id);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setAlert({ open: true, message: 'Failed to load calibrations', severity: 'error' });
    }
  };




  const fetchRoomStats = (calibrationId) => {
    setIsLoading(true);
    fetch(`/calibration/get_room_stats/${calibrationId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to load room stats');
      })
      .then(data => {
        const maxDetections = Math.max(...data.map(item => item.count_rilevazioni));
        const updatedRoomStats = data.map(item => ({
          ...item,
          percentuale_rilevazioni: ((item.count_rilevazioni / maxDetections) * 100).toFixed(2) // Calculate percentage based on max
        }));
        setRoomStats(updatedRoomStats);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setIsLoading(false);
        setAlert({ open: true, message: 'Failed to load room stats', severity: 'error' });
      });
  };


  const handleCalibrationChange = (event) => {
    const newCalibration = calibrations.find(c => c.id === event.target.value);
    setSelectedCalibration(newCalibration);
    fetchRoomStats(newCalibration.id);
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Card>
      <CardHeader title="Calibration Details" subheader="Select a calibration to view detailed room statistics" />
      <Box sx={{ p: 3 }}>
        <FormControl fullWidth
        >
          <InputLabel>Calibration list</InputLabel>
          <Select
            style={{ backgroundColor: "#F3F5F3" }}
            value={selectedCalibration?.id || ''}
            onChange={handleCalibrationChange}
            fullWidth
            displayEmpty
            inputProps={{ 'aria-label': 'Select Calibration' }}
          >
            {calibrations.map((calibration) => (
              <MenuItem key={calibration.id} value={calibration.id}>
                {new Date(calibration.timestamp).toLocaleString('it-IT', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {' | '}
                {calibration.name}
                {' | '}
                {calibration.description}
              </MenuItem>
            ))}
          </Select>


        </FormControl>

        {selectedCalibration && (
          <Box mt={2}>
            <Typography variant="body2">
              Start Calibration Timestamp: {new Date(selectedCalibration.timestamp).toLocaleString('it-IT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}  </Typography>
            <Typography variant="body2">Calibration device (MAC): {selectedCalibration.device}</Typography>
            <Box display="flex" alignItems="center">
  <Typography variant="body2">
    AI Accuracy: {selectedCalibration.accuracy}%
  </Typography>
  <Tooltip title="Accuracy percentage is calculated by setting aside 10% of the data points, testing them with the newly trained model, and determining the percentage of correct predictions.">
    <InfoOutlinedIcon style={{ marginLeft: 4, cursor: 'pointer' }} />
  </Tooltip>
</Box>


            <Typography variant="body2">Notes: {selectedCalibration.description}</Typography>
          </Box>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : roomStats.length > 0 ? (
          <TableContainer sx={{ maxHeight: 440, mt: 2 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>Position</TableCell>
                  <TableCell>Time (s)</TableCell>

                  <TableCell>Name</TableCell>
                  <TableCell>MAC Address BsXX</TableCell>

                  <TableCell>Detections Count</TableCell>
                  <TableCell>Detection %</TableCell>


                  <TableCell>Min RSSI</TableCell>
                  <TableCell>Max RSSI</TableCell>
                  <TableCell>Average RSSI</TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {roomStats.map((row) => (
                  <TableRow key={`${row.stanza}-${row.mac}`}>


                    <TableCell style={{ backgroundColor: "#d9e7fc" }}>{row.stanza}</TableCell>
                    <TableCell style={{ backgroundColor: "#d9e7fc" }} >{row.tempo_secondi_stanza}</TableCell>



                    <TableCell style={{ backgroundColor: "#ecd7fc" }}>{row.nome_dispositivo}</TableCell>
                    <TableCell style={{ backgroundColor: "#ecd7fc" }} >{row.mac}</TableCell>

                    <TableCell style={{ backgroundColor: "#fcd7d7" }}>{row.count_rilevazioni}</TableCell>
                    <TableCell style={{ backgroundColor: "#fcd7d7" }}>{row.percentuale_rilevazioni}%</TableCell>



                    <TableCell style={{ backgroundColor: "#fcfbd7" }}>{row.minimo}</TableCell>
                    <TableCell style={{ backgroundColor: "#fcfbd7" }}>{row.massimo}</TableCell>
                    <TableCell style={{ backgroundColor: "#fcfbd7" }}><b>{row.media_rssi.toFixed(0)}</b></TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography sx={{ mt: 2 }}>No room stats available for the selected calibration.</Typography>
        )}
      </Box>
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}

export default CalibrationStats;
