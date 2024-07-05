import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Link, Card, Button, Divider, Typography, CardHeader, Select, MenuItem } from '@mui/material';
import { fToNow } from '../../../../utils/formatTime';
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import Paper from '@mui/material/Paper';

LogsInfos.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function LogsInfos({ title, subheader, ...other }) {
  const [selectedFile, setSelectedFile] = useState('');
  const [logsData, setLogsData] = useState([]);
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch('/logs')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Logs not found');
      })
      .then(data => {
        setList(data);
      })
      .catch(error => {
        console.log(error);
        setList([]);
      });
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetch(`/logs/${selectedFile}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Logs file not found');
        })
        .then(data => {
          console.log('LOGS SUCCESS', data);
          setLogsData(data);
        })
        .catch(error => {
          console.log(error);
          setLogsData([]);
        });
    }
  }, [selectedFile]);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.value);
  };

  const handleDownloadClick = () => {
    fetch(`/logs/download/${selectedFile}`)
      .then(response => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error('Logs file not found');
      })
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', selectedFile);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    <Card {...other}>
      <CardHeader title={"Logs Infos"} subheader={"Select a file to view logs"} />
      <Box p={3}>
        <Select
          value={selectedFile}
          onChange={handleFileSelect}
          displayEmpty
          inputProps={{ 'aria-label': 'Select a file' }}
        >
          <MenuItem value="" disabled>
            Select a file
          </MenuItem>
          {list.map((file, index) => (
            <MenuItem key={index} value={file}>
              {file}
            </MenuItem>
          ))}
        </Select>
        {logsData.length > 0 ? (
          <Scrollbar>
            <br />
            <Box marginBottom={1}>
              <Paper elevation={3} style={{ padding: '10px', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'monospace' }}>
                {logsData.map((log, index) => (
                  <Typography variant="body1" component="span" display="inline" key={index}>
                    {log}
                    <br />
                  </Typography>
                ))}
              </Paper>
            </Box>
            <Button variant="contained" onClick={handleDownloadClick}>
              Download full log
            </Button>
          </Scrollbar>
        ) : (
          <Typography variant="body1" component="span" display="inline">
            <br />
            <br />No logs available for selected file
          </Typography>
        )}
      </Box>
    </Card>
  );
}
