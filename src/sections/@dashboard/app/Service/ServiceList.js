import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Scrollbar from '../../../../components/scrollbar';
import PushPinIcon from '@mui/icons-material/PushPin';

const ServiceList = ({ ...other }) => {

  const getStatusColor = (status) => {
    switch (status) {
      case 'masked':
        return 'default';
      case 'enabled':
        return 'primary';
      case 'disabled':
        return 'error';
      case 'static':
        return 'default';
      case 'alias':
        return 'default';
      case 'generated':
        return 'default';
      case 'enabled-runtime':
        return 'primary';
      case 'unit':
        return 'default';
      default:
        return 'default';
    }
  };
  const [services, setServices] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [logsData, setLogsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    setIsLoading(true);
    fetch('/services')
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Services not found');
        }
      })
      .then(data => {
        setServices(data.services);
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setServices([]);
        setIsLoading(false);
      });
  }, []);

  const handleFetchStatus = (serviceName) => {
    setIsLoading(true);
    fetch(`/services/${serviceName}/status`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Service status not found');
        }
      })
      .then(data => {
        setLogsData(Object.entries(data));
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleRestartClick = (serviceName) => {
    fetch(`/services/${serviceName}/restart`, { method: 'POST' })
      .then(response => {
        if (response.ok) {
          setAlertMessage(`${serviceName} restarted`);
          setAlertSeverity('success');
          setOpen(true);
        } else {
          throw new Error('Service restart failed');
        }
      })
      .catch(error => {
        setAlertMessage(error.message);
        setAlertSeverity('error');
        setOpen(true);
      });
  };

  const handleStopClick = (serviceName) => {
    fetch(`/services/${serviceName}/stop`, { method: 'POST' })
      .then(response => {
        if (response.ok) {
          setAlertMessage(`${serviceName} stopped`);
          setAlertSeverity('success');
          setOpen(true);
        } else {
          throw new Error('Service stop failed');
        }
      })
      .catch(error => {
        setAlertMessage(error.message);
        setAlertSeverity('error');
        setOpen(true);
      });
  };

  const handleRowClick = (serviceName) => {
    if (expandedRow === serviceName) {
      setExpandedRow(null);
    } else {
      setExpandedRow(serviceName);
      handleFetchStatus(serviceName);
    }
  };

  // Filter the services array to always pin plymouth-halt.service and systemd-timesyncd.service to the top
  const pinnedServices = services.filter(service => service.name === 'checkvpn.service' || service.name === 'localip.service' || service.name === 'checkinternet.service' || service.name === 'checkversion.service');
  const unpinnedServices = services.filter(service =>  service.name !== 'checkvpn.service' && service.name !== 'localip.service' && service.name !== 'checkinternet.service' && service.name !== 'checkversion.service');
  const sortedServices = [...pinnedServices, ...unpinnedServices];

  return (
    <Card {...other}>
      <CardHeader title={"Services"} subheader={"List of Services"} />
      <Box p={3}>

      {/* Caricamento */}
      {isLoading ? (
          <CircularProgress />
        ) : (
        services.length > 0 ? (
          <Scrollbar>
            <br />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Service Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedServices.map((service, index) => (
                    <React.Fragment key={index}>
                      <TableRow onClick={() => handleRowClick(service.name)}>
                        <TableCell>{pinnedServices.includes(service) && <PushPinIcon style={{ transform: 'rotate(320deg)' }} />}</TableCell>
                        <TableCell>{service.name}</TableCell>
                        <TableCell><Chip label={service.status} color={getStatusColor(service.status)}>  </Chip></TableCell>
                        <TableCell>

                          <Button variant="outlined" onClick={() => handleRestartClick(service.name)}>Restart</Button>{' '}
                          <Button variant="outlined" color="error" onClick={() => handleStopClick(service.name)}>Stop</Button>
                        </TableCell>
                        <TableCell>
                          {expandedRow === service.name ? (
                            <ExpandLessIcon onClick={() => handleRowClick(service.name)} />
                          ) : (
                            <ExpandMoreIcon onClick={() => handleRowClick(service.name)} />
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRow === service.name && (
                        <TableRow>
                        <TableCell colSpan={4}>
                          <Box p={3}>
                            <Scrollbar>
                              <br />
                              <Box marginBottom={1}>
                                  <Paper elevation={3} style={{ padding: '10px', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'monospace' }}>
                                    {logsData.map((log, index) => (
                                      <Typography variant="body1" component="span" display="inline" key={index}>
                                        {log[0]}: {log[1]}
                                        <br />
                                      </Typography>
                                    ))}
                                  </Paper>
                                </Box>
                            </Scrollbar>
                          </Box>
                        </TableCell>
                      </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        ) : (
          <Typography variant="body1" component="span" display="inline">
            <br />
            <br /> Discovering services...
          </Typography>
        ))}
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
    </Card >
  );
};

export default ServiceList;
