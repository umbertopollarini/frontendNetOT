import { useState, useEffect } from 'react';
import { IconButton, Tooltip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export default function Reboot() {
  const [open, setOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // Usa un oggetto Date per gestire l'orario

  const handleReboot = async () => {
    setOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch('/reboot', { method: 'POST' });
      if (response.ok) {
        console.log('Reboot successful');
        setTimeout(() => {
          window.location.reload();
        }, 5000); // 5000 milliseconds = 5 seconds
      } else {
        console.log('Reboot failed');
      }
    } catch (error) {
      console.log('Reboot failed', error);
    }
    setOpen(false);
  };

  // Funzione per richiedere l'orario corrente e impostarlo
  const fetchCurrentTime = async () => {
    try {
      const response = await fetch('/get-time', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setCurrentTime(new Date(data.time));
      } else {
        console.log('Failed to fetch current time');
      }
    } catch (error) {
      console.log('Error fetching current time', error);
    }
  };

  useEffect(() => {
    fetchCurrentTime();
    // Imposta un intervallo per aggiornare l'orario ogni secondo
    const intervalId = setInterval(() => {
      setCurrentTime(prevTime => new Date(prevTime.getTime() + 1000));
    }, 1000);

    // Pulisci l'intervallo quando il componente viene smontato
    return () => clearInterval(intervalId);
  }, []);

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Reboot">
          <IconButton onClick={handleReboot} sx={{ ml: 1 }}>
            <RestartAltIcon sx={{ width: 34, height: 34 }} />
          </IconButton>
        </Tooltip>
        <Typography variant="body2" sx={{ ml: 1, color: "black" }}>
        {currentTime.toLocaleString()}
        </Typography>
      </div>
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>Confirm Reboot</DialogTitle>
        <DialogContent>
          Are you sure you want to reboot the system?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}