import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Link, Card, Button, Divider, Typography, CardHeader, Select, MenuItem,  Alert, Snackbar  } from '@mui/material';
import { fToNow } from '../../../../utils/formatTime';
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import Paper from '@mui/material/Paper';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';

DockerList.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};


export default function DockerList({ title, subheader, ...other }) {
  const [dockerContainers, setDockerContainers] = useState([]);
  const [retry, setRetry] = useState(0);
  const [logsData, setLogsData] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [open, setOpen] = useState(false);

  
  useEffect(() => {
    fetch('/docker/containers')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Docker containers not found');
      })
      .then(data => {
        if (data.error) {
          setTimeout(() => {
            setRetry(retry + 1); // increment retry here
          }, 2000);
          throw new Error(data.error);
        } else {
          setDockerContainers(data.docker_containers);
        }
      })
      .catch(error => {
        console.log(error);
        setDockerContainers([]);
      });
  }, [retry]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handleFetchLogs = (containerId) => {
    setIsLoading(true);
    setSelectedContainer(containerId);
    fetch(`/docker/container/${containerId}/logs`)
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw new Error('Docker container logs not found');
      })
      .then(data => {
        data.replace(/(?:\r\n|\r|\n)/g, '<br />');
        console.log(data);
        setLogsData(JSON.parse(data));
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const handleDownloadClick = () => {
    fetch(`/docker/container/${selectedContainer}/download`)
      .then(response => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error('Docker container download failed');
      })
      .then(data => {
        const element = document.createElement("a");
        const file = new Blob([data], { type: 'application/octet-stream' });
        element.href = URL.createObjectURL(file);
        element.download = `logs-${selectedContainer}`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleRowClick = (containerId) => {
    if (expandedRow === containerId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(containerId);
      handleFetchLogs(containerId);
    }
  };
  const handleStopClick = (containerId) => {
    fetch(`/docker/container/${containerId}/stop`, { method: 'POST' })
      .then(response => {
        if (response.ok) {
          console.log(`Container ${containerId} stopped successfully`);
          setAlertSeverity('success');
          setAlertMessage(`Succesfully stopped a container ${containerId}`);
          setOpen(true);
        } else {
          setAlertSeverity('error');
          setAlertMessage(`Failed to stop container ${containerId}`);
          setOpen(true);
          throw new Error(`Failed to stop container ${containerId}`);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleRestartClick = (containerId) => {
    fetch(`/docker/container/${containerId}/restart`, { method: 'POST' })
      .then(response => {
        if (response.ok) {
          console.log(`Container ${containerId} restarted successfully`);
          setAlertSeverity('success');
          setAlertMessage(`Succesfully restart a container ${containerId}`);
          setOpen(true);
        } else {
            setAlertSeverity('error');
            setAlertMessage(`Failed to restart container ${containerId}`);
            setOpen(true);

          throw new Error(`Failed to restart container ${containerId}`);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    <Card {...other}>
      <CardHeader title={"Docker Containers"} subheader={"List of Docker Containers"} />
      <Box p={3}>
        {dockerContainers.length > 0 ? (
          <Scrollbar>
            <br />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Container ID</TableCell>
                    {/* <TableCell>Image</TableCell> */}
                    <TableCell>Command</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Names</TableCell>
                    <TableCell>Ports</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Logs</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dockerContainers.map((container, index) => (
                    <React.Fragment key={index}>
                      <TableRow onClick={() => handleRowClick(container.container_id)}>
                        <TableCell>{container.container_id}</TableCell>
                        {/* <TableCell>{container.image}</TableCell> */}
                        <TableCell>{container.command}</TableCell>
                        <TableCell>{container.status}</TableCell>
                        <TableCell>{container.created}</TableCell>
                        <TableCell>{container.names}</TableCell>
                        <TableCell>{container.ports}</TableCell>
                        <TableCell>
                        
                          <Button variant="outlined" onClick={() => handleRestartClick(container.container_id)}>Restart</Button>{' '}
                          <Button variant="outlined" color="error" onClick={() => handleStopClick(container.container_id)}>Stop</Button>
                        </TableCell>
                        <TableCell>
                          {expandedRow === container.container_id ? (
                            <ExpandLessIcon onClick={() => handleRowClick(container.container_id)} />
                          ) : (
                            <ExpandMoreIcon onClick={() => handleRowClick(container.container_id)} />
                          )}
                        </TableCell>

                      </TableRow>
                      {expandedRow === container.container_id && (
                        <TableRow>
                          <TableCell colSpan={9}>
                            {isLoading ? (
                              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <CircularProgress />
                              </Box>
                            )
                              : (
                                <Box p={3}>
                                  <Scrollbar>
                                    <br />
                                    <Box marginBottom={1}>
                                      <Paper elevation={3} style={{ padding: '10px', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'monospace' }}>
                                        <Typography variant="body1" component="span" display="inline" style={{ color: 'cyan' }}>logs: </Typography>
                                        <Typography variant="body1" component="span" display="inline" key={index}>
                                          {logsData.logs}
                                          <br />
                                        </Typography>
                                      </Paper>
                                    </Box>
                                    <Box marginBottom={1}>
                                      <Paper elevation={3} style={{ padding: '10px', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'monospace' }}>
                                        <Typography variant="body1" component="span" display="inline" style={{ color: 'orange' }}>error: </Typography>
                                        <Typography variant="body1" component="span" display="inline" key={index}>
                                          {logsData.error}
                                          <br />
                                        </Typography>
                                      </Paper>
                                    </Box>

                                    <Button variant="contained" onClick={handleDownloadClick}>
                                      Download full log
                                    </Button>
                                  </Scrollbar>
                                </Box>)}
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
            <br /> No Docker containers found...
          </Typography>
        )}
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
    </Card>
    
  );

}
