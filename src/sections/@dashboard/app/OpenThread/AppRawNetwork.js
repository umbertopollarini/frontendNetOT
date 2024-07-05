import { useEffect, useState } from 'react';
import { Box, Card, CardHeader,Typography ,Paper } from '@mui/material';

export default function AppRawNetwork() {
  const [rawData, setRawData] = useState('');

  useEffect(() => {
    fetch('/openthread/topology/raw')
      .then((response) => response.json())
      .then((data) => {
        setRawData(data.output.replace(/\r\n/g, '<br>'));
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <Card>
      <CardHeader title="Raw Network Topology" />
      <Box margin={3}>
              <Paper elevation={3} style={{ padding: '10px', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'monospace' }}>
                  <Typography variant="body1" component="span" display="inline">
                   <pre dangerouslySetInnerHTML={{ __html: rawData }}></pre>
                    
                  </Typography>
              </Paper>
            </Box>

      <Box p={2}> 
       
      </Box>
    </Card>
  );
}