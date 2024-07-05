import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import io from 'socket.io-client';
import axios from 'axios';

export default function PositioningViewer() {
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);  // Aggiungi un riferimento per il canvas
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [logs, setLogs] = useState([]);
  const endOfLogsRef = useRef(null);
  const socketRef = useRef(null);
  const isEventListenerAddedRef = useRef(false);
  const [macInAreas, setMacInAreas] = useState({});
  const [dots, setDots] = useState('.');
  const [clickedAreaId, setClickedAreaId] = useState(null);

  useEffect(() => {
    // Funzione per caricare le ultime posizioni dei dispositivi
    const fetchLastPositions = async () => {
      try {
        const { data } = await axios.get('/rooms/lastposition');
        const macsInAreas = data.reduce((acc, item) => {
          const { mac_device, predicted_room } = item;
          if (acc[predicted_room]) {
            // Aggiungi il MAC address solo se non è già presente nell'array
            if (!acc[predicted_room].includes(mac_device)) {
              acc[predicted_room].push(mac_device);
            }
          } else {
            acc[predicted_room] = [mac_device];
          }
          return acc;
        }, {});
        console.log("[ > starting...] macsInAreas:", macsInAreas)
        setMacInAreas(macsInAreas);
      } catch (error) {
        console.error('Error fetching last positions:', error);
      }
    };

    // Avvia la chiamata con un ritardo di 1 secondo
    const timerId = setTimeout(() => {
      fetchLastPositions();
    }, 1500);

    // Pulizia della funzione useEffect
    return () => clearTimeout(timerId);
  }, []);

  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    selectedFloor.areas.forEach(area => {
      const coords = JSON.parse(area.coordinates);
      if (x >= coords.x && x <= coords.x + coords.width && y >= coords.y && y <= coords.y + coords.height) {
        setClickedAreaId(area.id);
        console.log("area clicked:", clickedAreaId);
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => prevDots.length < 3 ? prevDots + '.' : '.');
    }, 800); // Aggiorna ogni 1000 millisecondi (1 secondo)

    return () => clearInterval(interval); // Pulizia dell'effetto
  }, []);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('', { path: '/socket.io/' }); // Adjust if you have a different path or URL
    }

    if (!isEventListenerAddedRef.current) {
      socketRef.current.on('ai_monitoring_logs', (message) => {
        console.log("Received message:", message);
        setLogs(currentLogs => [...currentLogs, message.log]);
        if (message.log.includes("Processing file /app/shared_dir/bangle_position.json")) {
          setMacInAreas({});
        } else {
          try {
            const data = JSON.parse(message.log);
            if (data.mac && data.position) {
              setMacInAreas(currentMacs => ({
                ...currentMacs,
                [data.position]: currentMacs[data.position] ? [...currentMacs[data.position], data.mac] : [data.mac]
              }));
              console.log("[ > running...] macInAreas:", macInAreas)
            }
          } catch (e) {
            // Non agire se il messaggio non è un JSON valido o non ha i campi necessari
          }
        }
      });
      isEventListenerAddedRef.current = true;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('ai_monitoring_logs');
      }
      isEventListenerAddedRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log("disconnetto dal socket")
        socketRef.current.disconnect();
      }
    };
  }, []);

  // useEffect(() => {
  //   endOfLogsRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [logs]);

  const handleRoomClick = (room) => {
    setSelectedRoom(room.room_name); // Salva il nome della room selezionata
  };

  useEffect(() => {
    if (selectedRoom) {
      redrawCanvas();
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedFloor) {
      redrawCanvas();
      console.log("macInAreas:", macInAreas)
    }
  }, [macInAreas, selectedFloor]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    // context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    if (!selectedFloor) return;

    const img = new Image();
    img.onload = () => {
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawAreas(context, selectedFloor.areas, 1); // Assuming drawAreas is already defined
      drawDevices(context, selectedFloor.areas[0].attr1, 1); // Draw devices using the parsed attr1 field
    };
    img.src = `data:image/png;base64,${selectedFloor.piantina}`;
  };

  useEffect(() => {
    if (selectedFloor) {
      console.log("selectedFloor:", selectedFloor)
      redrawCanvas();
    }
  }, [selectedFloor, macInAreas]);

  useEffect(() => {
    setLoading(true);
    axios.get('/rooms/floors')
      .then(response => {
        setFloors(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching floor data:', error);
        setLoading(false);
      });
  }, []);

  const drawDevices = (context, devicesJson, scale) => {
    console.log("received device:", devicesJson)
    if (!devicesJson) return; // Do nothing if devicesJson is null or undefined
    const devices = JSON.parse(devicesJson); // Parse the JSON formatted string
    devices.forEach(device => {
      const { type, x, y } = device;
      context.fillStyle = 'purple'; // Set the color for the device icon
      context.beginPath();
      context.arc(x * scale, y * scale, 10, 0, 2 * Math.PI); // Draw a circle for each device
      context.fill();
      context.font = '12px Arial';
      context.fillText(type, x * scale + 15, y * scale + 5); // Label the device type next to the icon
    });
  };

  const drawAreas = (context, areas, scale) => {
    console.log("drawAreas")
    areas.forEach(area => {
      if (area.coordinates.startsWith('{')) {
        const coords = JSON.parse(area.coordinates);
        context.beginPath();
        context.rect(coords.x * scale, coords.y * scale, coords.width * scale, coords.height * scale);
        context.strokeStyle = area.room_name !== selectedRoom ? "grey" : area.color;
        context.lineWidth = area.room_name === selectedRoom ? 6 : 3;
        context.stroke();

        // Disegna tutti i MAC address nell'area se disponibili
        if (macInAreas[area.id]) {
          macInAreas[area.id].forEach((mac, index) => {
            context.fillText(mac, coords.x * scale + 10, (coords.y * scale + 20) + (index * 15)); // Stampa i MAC address uno sotto l'altro
          });
        }
      } else if (area.coordinates.startsWith('[')) {
        const lines = JSON.parse(area.coordinates);
        lines.forEach((line, index) => {
          if (index === 0) {
            context.beginPath();
            context.moveTo(line.fromX * scale, line.fromY * scale);
          } else {
            context.lineTo(line.toX * scale, line.toY * scale);
          }
        });
        context.strokeStyle = area.room_name !== selectedRoom ? "grey" : area.color;
        context.lineWidth = area.room_name === selectedRoom ? 6 : 3;
        context.stroke();

        // Aggiungi i MAC address per le aree definite da linee, se applicabile
        if (macInAreas[area.id]) {
          macInAreas[area.id].forEach((mac, index) => {
            let textX = (lines[0].fromX + lines[lines.length - 1].toX) / 2 * scale;
            let textY = (lines[0].fromY + lines[lines.length - 1].toY) / 2 * scale + (index * 15); // Adatta l'altezza per più MAC
            context.fillText(mac, textX, textY);
          });
        }
      }
    });
  };

  const handleFloorClick = (floor) => {
    if (!floor) return;
    setSelectedFloor(floor);
    loadAndDrawImage(floor);

  };

  const loadAndDrawImage = (floor) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = `data:image/png;base64,${floor.piantina}`;
    img.onload = () => {
      try {
        let scale = 1;
        const maxWidth = 800; // Larghezza massima desiderata
        const maxHeight = 600; // Altezza massima desiderata
        if (img.width > maxWidth || img.height > maxHeight) {
          scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        }
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        // drawAreas(context, floor.areas, 1);
      } catch (e) {
        console.error("Error during image load and draw operation:", e);
      } finally {
        drawAreas(context, floor.areas, 1);
      }
    };
  };

  return (
    <>
      {/* {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <Typography variant="h5" style={{ color: 'white' }}>Loading...</Typography>
        </div>
      )} */}

      {Object.keys(macInAreas).length === 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, flexDirection: 'column' }}>
          <Typography variant="h5" style={{ color: 'white' }}>
            Waiting for AI predictions{dots}
          </Typography>
          <Typography variant="body2" style={{ color: 'white', marginTop: '0px' }}>
            This may take up to 1 minute.
          </Typography>
        </div>
      )}
      <Helmet>
        <title>Positioning Viewer</title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 1 }}>
          Positioning Viewer
        </Typography>
        {floors.length > 0 ? (
          floors.filter(floor => floor.piantina).map(floor => (
            <Button
              key={floor.floor_name}
              variant="contained"
              sx={{
                margin: 1,
                color: 'white',
                backgroundColor: selectedFloor && floor.floor_name === selectedFloor.floor_name ? 'blue' : 'grey'
              }}
              onClick={() => handleFloorClick(floor)}
            >
              {floor.floor_name}
            </Button>
          ))
        ) : (
          <Typography variant="body2">Non sono stati creati piani...</Typography>
        )}

        <Box sx={{ display: 'flex', marginTop: 2 }}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              border: '2px solid black',
              display: selectedFloor ? 'block' : 'none'
            }}>
          </canvas>
          {selectedFloor && (
            <Box sx={{ marginLeft: '20px' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>AREAS LIST</Typography>
              {selectedFloor.areas.map(area => (
                <Typography
                  key={area.room_name}
                  sx={{
                    color: area.color,
                    cursor: 'pointer',
                    fontWeight: area.room_name === selectedRoom ? 'bold' : 'normal',
                    fontSize: area.room_name === selectedRoom ? '1.1rem' : '1rem'
                  }}
                  onClick={() => handleRoomClick(area)}
                >
                  {area.room_name}
                </Typography>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ marginTop: 2 }}>
          <Paper elevation={3} sx={{
            maxHeight: 300,
            overflowY: 'auto',
            bgcolor: '#1e1e1e',
            color: 'white',
            fontFamily: 'monospace',
            padding: 2
          }}>
            {logs.map((log, index) => (
              <Typography key={index} sx={{ whiteSpace: 'pre-wrap' }}>
                {log}
              </Typography>
            ))}
            <div ref={endOfLogsRef} />
          </Paper>
        </Box>
      </Container>
    </>
  );

}
