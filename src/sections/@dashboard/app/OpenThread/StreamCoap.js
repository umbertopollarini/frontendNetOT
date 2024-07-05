import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Box, Paper, Typography, Card, CardHeader } from '@mui/material';

function StreamCoap() {
  const [logs, setLogs] = useState([]);
  const endOfLogsRef = useRef(null);
  const socketRef = useRef(null);
  const isEventListenerAddedRef = useRef(false);

  const scrollToBottom = () => {
    endOfLogsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(''); // io('/', { path: '/socket.io/' });
    }

    if (!isEventListenerAddedRef.current) {
      socketRef.current.on('docker_logs', (message) => {
        // console.log(message);
        setLogs((currentLogs) => [...currentLogs, message.log]);
      });

      isEventListenerAddedRef.current = true;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('docker_logs');
        // Non chiudere il socket se pensi che possa essere riutilizzato altrove
        // socketRef.current.close();
        isEventListenerAddedRef.current = false;
      }
    };
  }, []); // Eseguito solo una volta

  // useEffect(() => {
  //   scrollToBottom();
  // }, [logs]);

  return (
    <Card>
      <CardHeader title={"Logs CoAP server"} subheader={"Streaming logs coap server"} />
      <Box p={3}>
        <Box marginBottom={1}>
          <Paper elevation={3} style={{ maxHeight: 300, overflowY: 'auto', padding: '10px', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'monospace' }}>
            {logs.map((log, index) => (
              <Typography variant="body1" component="span" display="block" key={index} style={{ whiteSpace: 'pre-wrap' }}>
                {log}
              </Typography>
            ))}
            <div ref={endOfLogsRef} />
          </Paper>
        </Box>
      </Box>
    </Card>
  );
}

export default StreamCoap;
