import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import io from 'socket.io-client';
import axios from 'axios';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Annotation } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ElderlyIcon from '@mui/icons-material/Elderly';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import BoyIcon from '@mui/icons-material/Boy';
import PersonIcon from '@mui/icons-material/Person';
import AccessibleIcon from '@mui/icons-material/Accessible';
import EngineeringIcon from '@mui/icons-material/Engineering';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AssistWalkerIcon from '@mui/icons-material/AssistWalker';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ManIcon from '@mui/icons-material/Man';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ConstructionIcon from '@mui/icons-material/Construction';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

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

  const [trackMovement, setTrackMovement] = useState([]);
  const [showTrackMovement, setShowTrackMovement] = useState(false);

  const [clickedMac, setClickedMac] = useState("");

  const logsContainerRef = useRef(null);

  const [showMacDetails, setShowMacDetails] = useState(false);
  const [macDetails, setMacDetails] = useState([]);

  const [deviceIcons, setDeviceIcons] = useState([]);

  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [clickedArea, setClickedArea] = useState({ id: null, name: "" });

  const [alarms, setAlarms] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedArea, setHighlightedArea] = useState(null);

  const [searchResultEmpty, setSearchResultEmpty] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("searchQuery:", searchQuery)
    setSelectedRoom(null);
    if (searchQuery == "") {
      setHighlightedArea(null)
    } else {
      let found = false;
      // console.log("floors:", floors)
      const foundArea = Object.entries(macInAreas).find(([areaId, devices]) =>
        devices.some(device => {
          const deviceInfo = deviceIcons.find(d => d.mac === device);
          return deviceInfo && deviceInfo.name.toLowerCase().includes(searchQuery.toLowerCase());
        })
      );

      console.log("foundArea:", foundArea);
      if (foundArea == undefined || foundArea[0] == "53550") {
        setSearchResultEmpty(true);
      }
      else {
        floors.forEach((floor) => {
          floor.areas.forEach((area) => {
            if (!found && floor.piantina) {
              if (foundArea) {
                setHighlightedArea(foundArea ? foundArea[0] : null);
                setSearchResultEmpty(false);
                if (foundArea[0] == area.id) {
                  console.log("trovato piano, lo imposto")
                  setSelectedFloor(floor);
                  loadAndDrawImage(floor);
                  found = true;
                }
              }
            }
          });
        });
      }

      if (!found) {
        setHighlightedArea(null);
      }
    }
  };

  const fetchAlarms = (macAddress) => {
    axios.get(`/current/bangle_live_connection?macAddress=${macAddress}&duration=1`)
      .then(response => {
        const alarmData = response.data.filter(a => a.type === "99");
        console.log("Initial alarmData:", alarmData); // Log the initial alarm data for debugging

        // Remove the first and last elements from the alarm data array
        const filteredAlarms = alarmData.slice(1, -1);
        console.log("Filtered alarmData (without first and last):", filteredAlarms); // Log the filtered data for debugging

        setAlarms(filteredAlarms.map(alarm => ({
          ...alarm,
          timestamp: new Date(alarm.timestamp * 1000)  // Convert Unix timestamp to JavaScript Date
        })));
      })
      .catch(error => console.error('Error fetching alarms:', error));
  };

  const handleDeviceClick = (mac, name) => {
    setClickedMac(name);
    fetchTrackMovement(mac);
    setShowMacDetails(false)
    scrollToLogsContainer();
  };

  const fetchTrackMovement = (macAddress) => {
    axios.get(`/rooms/trackmovements?macAddress=${macAddress}&duration=1`)
      .then(response => {
        setTrackMovement(response.data);
        setShowTrackMovement(true);
        fetchAlarms(macAddress);
      })
      .catch(error => console.error('Error fetching track movements:', error));
  };

  const scrollToLogsContainer = () => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const allIcons = {
    HomeIcon: HomeIcon,
    WorkIcon: WorkIcon,
    PeopleIcon: PeopleIcon,
    BuildIcon: BuildIcon,
    ElderlyIcon: ElderlyIcon,
    EmojiPeopleIcon: EmojiPeopleIcon,
    BoyIcon: BoyIcon,
    PersonIcon: PersonIcon,
    AccessibleIcon: AccessibleIcon,
    EngineeringIcon: EngineeringIcon,
    LocalHospitalIcon: LocalHospitalIcon,
    MedicalServicesIcon: MedicalServicesIcon,
    MonitorHeartIcon: MonitorHeartIcon,
    BuildIcon: BuildIcon,
    AssistWalkerIcon: AssistWalkerIcon,
    HealthAndSafetyIcon: HealthAndSafetyIcon,
    ManIcon: ManIcon,
    RemoveRedEyeIcon: RemoveRedEyeIcon,
    ConstructionIcon: ConstructionIcon,
    HomeRepairServiceIcon: HomeRepairServiceIcon,
    HelpOutlineIcon: HelpOutlineIcon
  };

  useEffect(() => {
    const fetchDeviceIcons = async () => {
      try {
        const response = await axios.get('/rooms/geticonmac');
        setDeviceIcons(response.data);
      } catch (error) {
        console.error('Error fetching device icons:', error);
      }
    };

    fetchDeviceIcons();
  }, []);

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
        if (macInAreas[area.id]) {
          setMacDetails(macInAreas[area.id]);
          setShowMacDetails(true);
          setClickPosition({ x: event.clientX, y: event.clientY });
          setClickedArea({ id: area.id, name: area.room_name });  // Memorizza l'ID e il nome dell'area cliccata
        }
      }
    });
  };

  const getIcon = (iconName) => {
    const IconComponent = allIcons[iconName];
    return IconComponent ? <IconComponent /> : <HelpOutlineIcon />;  // Usa HelpOutlineIcon come fallback
  };

  const renderMacDetailsBanner = () => {
    if (!showMacDetails) return null;

    console.log("clickedArea:", clickedArea)
    console.log("selectedFloor:", selectedFloor)

    const areaRoles = selectedFloor.areas.find(area => area.id === clickedArea.id)?.roles || [];

    console.log("areaRoles:", areaRoles)

    const macNames = macDetails.map(mac => {
      const device = deviceIcons.find(device => device.mac === mac);
      console.log("device:", device)
      const hasPermission = areaRoles.includes(device.role);
      return {
        name: device ? device.name : "Unknown Device",
        icon: getIcon(device.icon),
        mac: device ? device.mac : null,
        hasPermission: hasPermission  // Determine if the device has permission to be in the area
      };
    });

    return (
      <Box sx={{
        position: 'fixed',
        top: `${clickPosition.y}px`,
        left: `${clickPosition.x}px`,
        transform: 'translate(-50%, -100%)',
        bgcolor: 'background.paper',
        border: '1px solid #000',
        boxShadow: 24,
        p: 2,
        zIndex: 2000
      }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Devices in {clickedArea.name}</Typography>
        {macNames.map((device, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => handleDeviceClick(device.mac, device.name)}>
            {device.icon}
            <Typography sx={{ color: device.hasPermission ? 'inherit' : 'red' }}>{device.name}</Typography>
          </Box>
        ))}
        <Button variant="contained" color="primary" sx={{ mt: 1 }} onClick={() => setShowMacDetails(false)}>Close</Button>
      </Box>
    );
  };


  // Function to render track movements
  const renderTrackMovements = () => {
    if (!showTrackMovement) return null;

    // Create a unique list of room names for the y-axis
    const roomNames = [...new Set(trackMovement.map(item => item.room_name))];

    // Map the timestamps and room names to x and y values respectively
    const chartData = {
      labels: trackMovement.map(item => item.timestamp),
      datasets: [
        {
          label: 'Room Movements',
          data: trackMovement.map(item => ({
            x: item.timestamp,
            y: item.room_name  // Assigns a unique y-value based on room name
          })),
          borderColor: '#3f51b5',
          backgroundColor: '#757de8',
          fill: false,
          tension: 0.1,
        }
      ]
    };

    const options = {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
            displayFormats: {
              minute: 'HH:mm'  // Use 24-hour format
            },
            tooltipFormat: 'yyyy-mm-dd HH:mm'
          },
          title: {
            display: true,
            text: 'Timestamp'
          }
        },
        y: {
          type: 'category',
          labels: roomNames,  // Use the unique list of room names for y-axis labels
          title: {
            display: true,
            text: 'Room Name'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        annotation: {
          annotations: alarms.map(alarm => ({
            type: 'line',
            xMin: new Date(alarm.timestamp),
            xMax: new Date(alarm.timestamp),
            borderColor: 'red',
            borderWidth: 2,
          }))
        }
      },
      maintainAspectRatio: false,
    };

    return (
      <Box sx={{ marginTop: 2, height: "300px" }} ref={logsContainerRef}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Track Movement for {clickedMac}</Typography>
        <Line data={chartData} options={options} />
      </Box>
    );
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
    redrawCanvas();
  }, [highlightedArea]);

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
        const floorsData = response.data;
        setFloors(response.data);
        setLoading(false);
        if (floorsData.length > 0) {
          handleFloorClick(floorsData[0]);
        }
      })
      .catch(error => {
        console.error('Error fetching floor data:', error);
        setLoading(false);
      });
  }, []);

  const drawAreas = (context, areas, scale) => {
    areas.forEach(area => {
      if (area.coordinates.startsWith('{')) {
        const isActive = area.room_name === selectedRoom; // Check if the room is selected
        const isHighlighted = area.id == highlightedArea; // Check if the area is highlighted by search

        const coords = JSON.parse(area.coordinates);
        context.beginPath();
        context.rect(coords.x * scale, coords.y * scale, coords.width * scale, coords.height * scale);

        // Set fill style based on whether the area is highlighted or active
        if (isHighlighted) {
          context.fillStyle = "rgba(255, 255, 0, 0.5)"; // Yellow if highlighted
        } else if (isActive) {
          context.fillStyle = "rgba(255, 0, 0, 0.5)"; // Red if active
        } else {
          context.fillStyle = "rgba(0, 0, 0, 0.1)"; // Default
        }
        context.fill();

        // Set stroke style based on whether the area is highlighted or active
        context.strokeStyle = isActive || isHighlighted ? "red" : "grey";
        context.lineWidth = isActive || isHighlighted ? 6 : 3;
        context.stroke();

        // Conta e disegna il numero di MAC address nell'area
        if (macInAreas[area.id]) {
          const deviceCount = macInAreas[area.id].length;
          const textX = coords.x * scale + coords.width * scale / 2;
          const textY = coords.y * scale + coords.height * scale / 2;

          // Disegna un cerchio al centro dell'area
          context.beginPath();
          context.arc(textX, textY, 20, 0, 2 * Math.PI, false); // Cerchio con raggio di 20px
          context.fillStyle = 'white'; // Sfondo bianco per il cerchio
          context.fill();

          // Disegna il numero di dispositivi dentro il cerchio
          context.font = "16px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillStyle = 'black'; // Numero in nero
          context.fillText(deviceCount, textX, textY);
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

        // Aggiungi il numero di MAC address per le aree definite da linee, se applicabile
        if (macInAreas[area.id]) {
          const deviceCount = macInAreas[area.id].length;
          let textX = (lines[0].fromX + lines[lines.length - 1].toX) / 2 * scale;
          let textY = (lines[0].fromY + lines[lines.length - 1].toY) / 2 * scale;
          context.font = "16px Arial";
          context.fillText(deviceCount, textX, textY); // Posiziona il testo al centro della linea
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
        {searchResultEmpty && (
          <Typography variant="h6" style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
            No devices found matching the search query.
          </Typography>
        )}
        {renderMacDetailsBanner()}
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
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>List of areas</Typography>
              <form onSubmit={handleSearch} style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Enter device name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <Button type="submit" variant="contained" color="primary">Search</Button>
              </form>
              {selectedFloor.areas.map(area => (
                <Typography
                  key={area.room_name}
                  sx={{
                    color: area.color,
                    cursor: 'pointer',
                    fontWeight: area.room_name === selectedRoom ? 'bold' : 'normal',
                    fontSize: area.room_name === selectedRoom ? '1.1rem' : '1rem',
                    backgroundColor: area.id === highlightedArea ? 'yellow' : 'transparent'
                  }}
                  onClick={() => handleRoomClick(area)}
                >
                  {area.room_name}
                </Typography>
              ))}
            </Box>
          )}
        </Box>

        {renderTrackMovements()}

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
