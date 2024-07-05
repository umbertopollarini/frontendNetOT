import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import { Container, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, InputLabel, MenuItem, FormControl, OutlinedInput, Chip } from '@mui/material';
import { Alert } from '@mui/material';
import RectangleIcon from '@mui/icons-material/CheckBoxOutlineBlank'; // Icona per il rettangolo
import LineIcon from '@mui/icons-material/ShowChart'; // Icona per la linea
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

export default function Rooms() {
  const theme = useTheme();
  const [image, setImage] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectangles, setRectangles] = useState([]);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [showAlert, setShowAlert] = useState(false);
  const [alertTimeout, setAlertTimeout] = useState(null);

  const [drawMode, setDrawMode] = useState('rectangle'); // 'rectangle' o 'line'
  const [lines, setLines] = useState([]); // Array per tenere traccia delle linee disegnate

  const [showForm, setShowForm] = useState(false);
  const [selectedShape, setSelectedShape] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#000000'); // Default color
  const [selectedRoles, setSelectedRoles] = useState([]);
  const roles = ['Manager', 'Employee', 'Visitor', 'Maintenance'];
  const [rooms, setRooms] = useState([]);
  const [infoMessage, setInfoMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [floorName, setFloorName] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);

  const [maxFloorId, setMaxFloorId] = useState(0);
  const [deviceIcons, setDeviceIcons] = useState([]);
  const [pendingDeviceType, setPendingDeviceType] = useState(null);

  const [devicePositionsConfirmed, setDevicePositionsConfirmed] = useState(false);

  const handleCloseDetails = () => {
    setSelectedRoomDetails(null);  // Presuppone che null nasconda i dettagli
  };

  const prepareDeviceIcon = (type) => {
    if (type === 'BR' && deviceIcons.filter(icon => icon.type === 'BR').length >= 1) {
      return; // Non permettere più di un "BR"
    }
    setDrawMode(type);
    setPendingDeviceType(type);
  };

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  const handleFloorSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    if (rectangles.length > 0) {
      const transformedRectangles = rectangles.map(rect => {
        let coordinates = {};
        if (rect.lines) {
          // Per le forme create con le linee, converti l'array delle linee in una stringa JSON
          coordinates = JSON.stringify(rect.lines.map(line => ({
            fromX: line.fromX,
            fromY: line.fromY,
            toX: line.toX,
            toY: line.toY
          })));
        } else {
          // Per i rettangoli, crea un oggetto con le coordinate e convertilo in stringa JSON
          coordinates = JSON.stringify({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        }

        // Ritorna il nuovo oggetto senza i campi non necessari
        return {
          ...rect,
          coordinates,
          color: rect.color,
          roles: rect.roles,
          floor_id: maxFloorId + 1
        };
      }).map(rect => {
        // Rimuovi i campi non più necessari
        const { editIcon, lines, x, y, width, height, closed, closeIcon, ...rest } = rect;
        return rest;
      });

      // Prepara i dati dei dispositivi
      const deviceData = deviceIcons.map(device => ({
        type: device.type,
        x: device.x,
        y: device.y
      }));


      console.log("Floor submitted:", floorName);
      console.log("areas:", transformedRectangles);
      console.log("devices:", deviceData);

      const formData = new FormData();
      formData.append('floordetails', JSON.stringify(transformedRectangles));
      formData.append('devices', JSON.stringify(deviceData));  // Includi i dettagli dei dispositivi

      if (image) {
        const imageFile = fileInputRef.current.files[0];
        formData.append('floorImage', imageFile);
      }

      // Send the POST request to the Flask REST API
      axios.post('/rooms/addfloor', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(response => {
          console.log('Success:', response.data);
          setSuccessMessage('Floor details added successfully.');
          // alert('Floor details added successfully.');
          setFloorName('');
          setImage(null);
          setRectangles([]);
          setSelectedShape(null);
          setSelectedRoles([]);
          setSelectedColor('#000000');
          setDeviceIcons([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        })
        .catch(error => {
          console.error('Error posting floor details:', error);
        }).finally(() => {
          setLoading(false); // Termina il caricamento
        });
    }
  };

  useEffect(() => {
    axios.get('/rooms/configurations')
      .then(response => {
        if (response.data.info) {
          // Gestisci il caso in cui la tabella non esiste
          setInfoMessage(response.data.info);
        } else {
          // Altrimenti, impostare le stanze ricevute
          setRooms(response.data);
          const highestId = response.data.reduce((max, room) => Math.max(max, room.floor_id), 0);
          setMaxFloorId(highestId);
          console.log("highestId:", highestId)
        }
      })
      .catch(error => {
        console.error('There was an error fetching the rooms configurations:', error);
        setInfoMessage('Failed to fetch rooms data.');
      });
  }, [successMessage]);

  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setRectangles([]);
    };
    reader.readAsDataURL(file);
  };

  const drawIcons = (rect, context) => {
    const iconSize = 15; // Size for both the "X" and "E"
    const iconPadding = 5; // Padding from the top right corner
    let iconX, iconY;

    if (rect.lines) {
      // Calculate positions for icons
      const maxX = Math.max(...rect.lines.map(line => Math.max(line.fromX, line.toX)));
      const minY = Math.min(...rect.lines.map(line => Math.min(line.fromY, line.toY)));
      iconX = maxX - iconSize - iconPadding;
      iconY = minY + iconPadding;
    } else {
      iconX = rect.x + rect.width - iconSize - iconPadding;
      iconY = rect.y + iconPadding;
    }

    // Draw Close Icon
    context.beginPath();
    context.moveTo(iconX, iconY);
    context.lineTo(iconX + iconSize, iconY + iconSize);
    context.moveTo(iconX, iconY + iconSize);
    context.lineTo(iconX + iconSize, iconY);
    context.strokeStyle = 'red';
    context.lineWidth = 3;
    context.stroke();
    rect.closeIcon = { x: iconX, y: iconY, width: iconSize, height: iconSize };

    // Draw Edit Icon ("E")
    iconY += iconSize + 10; // Position below the close icon
    context.font = '15px Arial'; // Set the font size and family
    context.fillStyle = 'black'; // Set the text color
    context.fillText('E', iconX, iconY + iconSize);
    rect.editIcon = { x: iconX, y: iconY, width: iconSize, height: iconSize };
  };


  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;

    // Controlla se il clic è su un'icona 'X'
    const isClickOnCloseIcon = rectangles.some(rect => {
      if (rect.lines) {
        let maxX = -Infinity, minY = Infinity;
        rect.lines.forEach(line => {
          maxX = Math.max(maxX, line.fromX, line.toX);
          minY = Math.min(minY, line.fromY, line.toY);
        });
        // Calcola le coordinate dell'icona 'X'
        const iconX = maxX - 10;
        const iconY = minY;
        // Verifica se il clic è all'interno dell'area dell'icona 'X'
        return offsetX >= iconX && offsetX <= iconX + 10 && offsetY >= iconY && offsetY <= iconY + 10;
      }
      return false;
    });

    if (isClickOnCloseIcon) {
      // Interrompi la funzione se il clic è su un'icona 'X'
      return;
    }

    if (drawMode === 'rectangle') {
      setStartPosition({ x: offsetX, y: offsetY });
      setIsDrawing(true);
    } else if (drawMode === 'line') {
      let startPoint = { x: offsetX, y: offsetY };
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        startPoint = { x: lastLine.toX, y: lastLine.toY }; // Inizia dalla fine dell'ultima linea
      }
      const newLine = { fromX: startPoint.x, fromY: startPoint.y, toX: offsetX, toY: offsetY };
      setLines([...lines, newLine]);
      setIsDrawing(true);
    }
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;

    const context = canvasRef.current.getContext('2d');
    // context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    context.drawImage(document.getElementById('uploadedImage'), 0, 0, canvasRef.current.width, canvasRef.current.height);

    rectangles.forEach(rect => {
      if (rect.lines) { // Disegna le forme già confermate con le linee
        rect.lines.forEach(line => {
          context.beginPath();
          context.moveTo(line.fromX, line.fromY);
          context.lineTo(line.toX, line.toY);
          context.strokeStyle = rect.color;
          context.lineWidth = 3;
          context.stroke();
        });

        if (rect.closed) {
          // Disegna l'icona di chiusura in alto a destra della bounding box
          drawIcons(rect, context);
        }
      } else {
        context.beginPath();
        context.rect(rect.x, rect.y, rect.width, rect.height);
        context.strokeStyle = rect.color;
        context.lineWidth = 3;
        context.stroke();
        drawIcons(rect, context);
      }
    });

    drawDeviceIcons(context);

    // Disegna tutte le linee temporanee della forma attuale, non solo l'ultima
    if (drawMode === 'line') {
      lines.forEach(line => {
        context.beginPath();
        context.moveTo(line.fromX, line.fromY);
        context.lineTo(line.toX, line.toY);
        context.strokeStyle = 'blue';
        context.lineWidth = 2;
        context.stroke();
      });

      // Aggiungi la linea temporanea attuale che segue il mouse
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        context.beginPath();
        context.moveTo(lastLine.fromX, lastLine.fromY);
        context.lineTo(offsetX, offsetY);
        context.strokeStyle = 'blue';
        context.lineWidth = 2;
        context.stroke();
      }
    } else if (drawMode === 'rectangle') {
      // Disegna il rettangolo temporaneo
      context.beginPath();
      context.rect(startPosition.x, startPosition.y, offsetX - startPosition.x, offsetY - startPosition.y);
      context.strokeStyle = 'blue';
      context.lineWidth = 2;
      context.stroke();
    }
  };

  const finishDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    if (drawMode === 'rectangle') {
      setIsDrawing(false);
      const width = Math.abs(offsetX - startPosition.x);
      const height = Math.abs(offsetY - startPosition.y);
      if (width >= 25 && height >= 25) {
        const minX = Math.min(startPosition.x, offsetX);
        const minY = Math.min(startPosition.y, offsetY);
        const newRect = { x: minX, y: minY, width, height };
        setRectangles([...rectangles, newRect]);
        setSelectedShape(newRect);
        setShowForm(true);
      } else {
        // setShowAlert(true);
        // const timeout = setTimeout(() => setShowAlert(false), 3000);
        // setAlertTimeout(timeout);
      }
    } else if (drawMode === 'line' && lines.length && isDrawing) {
      const lastLine = lines[lines.length - 1];
      const lineLength = Math.hypot(lastLine.fromX - offsetX, lastLine.fromY - offsetY);
      if (lineLength >= 25) {
        lastLine.toX = offsetX;
        lastLine.toY = offsetY;
        setLines(lines => [...lines.slice(0, -1), lastLine]); // Aggiorna l'ultima linea con le coordinate finali

        const firstLine = lines[0];
        const distance = Math.hypot(firstLine.fromX - offsetX, firstLine.fromY - offsetY);
        if (distance < 20) {
          const closingLine = { fromX: offsetX, fromY: offsetY, toX: firstLine.fromX, toY: firstLine.fromY, closed: true };
          setLines(lines => [...lines, closingLine]);
          setIsDrawing(false);
          // Salva le linee come una forma chiusa
          setRectangles(rectangles => [...rectangles, { lines: [...lines, closingLine], closed: true }]);
          setLines([]); // Resetta le linee per un nuovo disegno
          setSelectedShape({ lines: [...lines, closingLine], closed: true });
          setShowForm(true);
        } else {
          const newLine = { fromX: offsetX, fromY: offsetY, toX: offsetX, toY: offsetY };
          setLines(lines => [...lines, newLine]);
        }
      } else {
        setLines([]);
      }
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [deviceIcons, devicePositionsConfirmed]);

  const drawDeviceIcons = (context) => {
    deviceIcons.forEach((icon, index) => {
      context.font = '20px Arial';
      context.fillStyle = 'purple';
      context.fillText(icon.type, icon.x, icon.y);

      // Disegna l'icona "X"
      if (!devicePositionsConfirmed) {
        const iconSize = 10;  // Dimensione dell'icona "X"
        const iconX = icon.x + 30;  // Posizione X dell'icona "X"
        const iconY = icon.y - 10;  // Posizione Y dell'icona "X"

        context.beginPath();
        context.moveTo(iconX, iconY);
        context.lineTo(iconX + iconSize, iconY + iconSize);
        context.moveTo(iconX, iconY + iconSize);
        context.lineTo(iconX + iconSize, iconY);
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        context.stroke();

        // Aggiungi l'area cliccabile dell'icona "X" all'oggetto dispositivo
        icon.closeIcon = { x: iconX, y: iconY, width: iconSize, height: iconSize };
      } else {
        // Rimuovi l'icona "X" dalle informazioni dell'oggetto dispositivo
        delete icon.closeIcon;
      }
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [rectangles, lines]);

  useEffect(() => {
    return () => {
      clearTimeout(alertTimeout);
    };
  }, [alertTimeout]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    // context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(document.getElementById('uploadedImage'), 0, 0, canvas.width, canvas.height);
    rectangles.forEach(rect => drawIcons(rect, context));
    drawDeviceIcons(context);  // Ridisegna le icone dei dispositivi
  }, [deviceIcons]);

  const checkForCloseIconClick = (x, y) => {
    const rectIndex = rectangles.findIndex(rect => {
      // Controlla se il punto cliccato è all'interno dell'area dell'icona "X"
      if (rect.closeIcon) {
        const { closeIcon } = rect;
        return x >= closeIcon.x && x <= closeIcon.x + closeIcon.width &&
          y >= closeIcon.y && y <= closeIcon.y + closeIcon.height;
      }
      return false;
    });
    // console.log("elimino rect:", rectIndex)

    if (rectIndex > -1) {
      // Rimuovi il rettangolo o la forma se il clic è avvenuto sulla "X"
      setRectangles(prevRectangles => prevRectangles.filter((_, index) => index !== rectIndex));
      return true; // Ritorna true per indicare che il clic ha colpito una "X"
    }
    return false; // Nessuna "X" colpita
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    // context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(document.getElementById('uploadedImage'), 0, 0, canvas.width, canvas.height);

    rectangles.forEach(rect => {
      if (rect.lines) { // Disegna le forme create dalle linee
        rect.lines.forEach(line => {
          context.beginPath();
          context.moveTo(line.fromX, line.fromY);
          context.lineTo(line.toX, line.toY);
          context.strokeStyle = rect.color;
          context.lineWidth = 3;
          context.stroke();
        });
      } else { // Disegna i rettangoli
        context.beginPath();
        context.rect(rect.x, rect.y, rect.width, rect.height);
        context.strokeStyle = rect.color;
        context.lineWidth = 3;
        context.stroke();
      }
      drawIcons(rect, context);
    });

    // Disegna le icone dei dispositivi dopo aver disegnato le forme
    // deviceIcons.forEach(icon => {
    //   context.font = '20px Arial';
    //   context.fillStyle = 'black'; // Assicurati che il testo sia visibile
    //   context.fillText(icon.type, icon.x, icon.y);
    // });
    // Assicurati che le icone dei dispositivi vengano disegnate dopo tutto il resto
    drawDeviceIcons(context);
  };


  const handleCanvasClick = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;

    if (pendingDeviceType) {
      const newIcon = { type: pendingDeviceType, x: offsetX, y: offsetY };
      setDeviceIcons([...deviceIcons, newIcon]);
      setPendingDeviceType(null); // Reset the pending device type after placing an icon
      setDrawMode('');


      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.font = '20px Arial';
      context.fillText(newIcon.type, newIcon.x, newIcon.y);
      return; // Prevent further interactions if just placing a device icon
    }

    // Controlla se è stato cliccato l'icona "X" di un dispositivo
    const deviceToRemove = deviceIcons.findIndex(icon => {
      if (icon.closeIcon) {
        const { x, y, width, height } = icon.closeIcon;
        return offsetX >= x && offsetX <= x + width && offsetY >= y && offsetY <= y + height;
      }
      return false;
    });

    if (deviceToRemove > -1) {
      // Rimuovi il dispositivo se l'icona "X" è stata cliccata
      setDeviceIcons(prevIcons => prevIcons.filter((_, index) => index !== deviceToRemove));
      return;  // Previene ulteriori interazioni se un dispositivo è stato rimosso
    }

    // Check if a close icon was clicked
    if (checkForCloseIconClick(offsetX, offsetY)) {
      // console.log("CLICCATA UNA X PER RECT: ", rectIndex);
      return; // Stop further actions if close icon was clicked
    }

    // Check if an edit icon was clicked
    const rectIndex = rectangles.findIndex(rect => rect.editIcon && offsetX >= rect.editIcon.x && offsetX <= rect.editIcon.x + rect.editIcon.width && offsetY >= rect.editIcon.y && offsetY <= rect.editIcon.y + rect.editIcon.height);
    if (rectIndex > -1) {
      console.log("CLICCATA UNA E PER RECT:", rectIndex);
      console.log("RETTANGOLO IN QUESTIONE:", rectangles[rectIndex]);
      setSelectedShape(rectangles[rectIndex]);
      setSelectedRoles(rectangles[rectIndex].roles || []);
      setSelectedColor(rectangles[rectIndex].color || '#000000');
      setShowForm(true);
      return; // Stop further actions after handling the edit click
    }
  };

  useEffect(() => {
    if (rectangles.length == 0 && image) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
      img.onload = () => {
        let scale = 1;
        const maxWidth = 800; // Larghezza massima desiderata
        const maxHeight = 600; // Altezza massima desiderata
        if (img.width > maxWidth || img.height > maxHeight) {
          scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        }
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Disegna nuovamente le icone dei dispositivi dopo aver ridisegnato l'immagine
        // deviceIcons.forEach(icon => {
        //   context.font = '20px Arial';
        //   context.fillText(icon.type, icon.x, icon.y);
        // });
        drawDeviceIcons(context)
        rectangles.forEach(rect => drawIcons(rect, context));
      };

    } else if (rectangles.length > 0 && image) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const img = document.getElementById('uploadedImage');
      img.onload = () => {
        let scale = 1;
        const maxWidth = 800; // Larghezza massima desiderata
        const maxHeight = 600; // Altezza massima desiderata
        if (img.width > maxWidth || img.height > maxHeight) {
          scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        }
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        rectangles.forEach(rect => drawIcons(rect, context));
        // Disegna nuovamente le icone dei dispositivi dopo aver ridisegnato l'immagine
        // deviceIcons.forEach(icon => {
        //   context.font = '20px Arial';
        //   context.fillText(icon.type, icon.x, icon.y);
        // });
        drawDeviceIcons(context)
      };
    }
  }, [image, rectangles]);

  function areLinesEqual(lines1, lines2) {
    if (lines1.length !== lines2.length) return false;
    return lines1.every((line1, index) => {
      const line2 = lines2[index];
      return line1.fromX === line2.fromX && line1.fromY === line2.fromY &&
        line1.toX === line2.toX && line1.toY === line2.toY;
    });
  }

  const linesAreEqual = (lines1, lines2) => {
    if (lines1.length !== lines2.length) return false;
    return lines1.every((line1, index) => {
      const line2 = lines2[index];
      return line1.fromX === line2.fromX && line1.fromY === line2.fromY &&
        line1.toX === line2.toX && line1.toY === line2.toY;
    });
  };

  const shapeMatches = (rect, shape) => {
    if (rect.lines && shape.lines) {
      return linesAreEqual(rect.lines, shape.lines);
    }
    if (!rect.lines && !shape.lines) {
      return rect.x === shape.x && rect.y === shape.y &&
        rect.width === shape.width && rect.height === shape.height;
    }
    return false;
  };

  const handleRoomSelection = (room) => {
    console.log(`Selected room: ${room.room_name}`);
    console.log(`Room details:`, room);
    // setSelectedShape(room);
    // Check if roles is a string and parse it into an array
    let parsedRoles = [];
    try {
      // Attempt to parse the roles if it's a string
      parsedRoles = JSON.parse(room.roles);
    } catch (e) {
      console.error("Error parsing roles:", e);
      parsedRoles = [];  // Default to an empty array in case of error
    }

    // Ensure parsedRoles is an array before setting it
    setSelectedRoomDetails({ ...room, roles: parsedRoles });
  };

  const handleEditRoom = (roomDetails) => {
    console.log("Editing room:", roomDetails);
    // Implementation depends on your application needs
  };

  const handleDeleteRoom = (roomId) => {
    console.log("Deleting room ID:", roomId);
    // Implementation depends on your application needs
  };

  return (
    <>
      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <Typography variant="h5" component="h2" style={{ color: 'white' }}>
            Loading...
          </Typography>
        </div>
      )}
      <Helmet>
        <title>Areas Settings</title>
      </Helmet>
      <Dialog open={showForm} onClose={() => setShowForm(false)}>
        <DialogTitle>Enter Details for the Area</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Area Name"
            type="text"
            fullWidth
            required
            value={selectedShape ? selectedShape.name : ''}
            variant="outlined"
            onChange={(e) => setSelectedShape({ ...selectedShape, name: e.target.value, floor: floorName })}
          />
          <TextField
            margin="dense"
            label="Floor Name"
            type="text"
            fullWidth
            disabled
            value={floorName}
            variant="outlined"
          />
          <FormControl margin="dense" fullWidth required>
            <InputLabel id="role-select-label">Who can enter here?</InputLabel>
            <Select
              labelId="role-select-label"
              multiple
              value={selectedRoles}
              onChange={(e) => setSelectedRoles(e.target.value)}
              input={<OutlinedInput id="select-multiple-chip" label="Access Roles" />}
              renderValue={(selected) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </div>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 48 * 4.5 + 8,
                    width: 250,
                  },
                },
              }}
            >
              {roles.map((role) => (
                <MenuItem
                  key={role}
                  value={role}
                >
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            type="color"
            label="Select Color"
            fullWidth
            variant="outlined"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            sx={{ mb: 2 }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowForm(false);
            // Verifica se la forma selezionata ha delle linee
            if (selectedShape.lines) {
              // Rimuove la forma solo se tutte le linee corrispondono
              setRectangles(rectangles => rectangles.filter(rect =>
                rect.lines ? !areLinesEqual(rect.lines, selectedShape.lines) : true
              ));
            } else {
              // Rimuove la forma basata sulla posizione del rettangolo
              setRectangles(rectangles => rectangles.filter(rect =>
                rect.x !== selectedShape.x || rect.y !== selectedShape.y
              ));
            }
            setSelectedRoles([]);
          }} color="primary">
            Delete
          </Button>
          <Button onClick={() => {
            setShowForm(false);
            // Update rectangles with the latest changes from selectedShape
            // Map through rectangles to update the specific shape
            const updatedRectangles = rectangles.map(rect => {
              if (shapeMatches(rect, selectedShape)) {
                console.log("Matching shape found:", rect);
                return { ...rect, ...selectedShape, color: selectedColor, roles: selectedRoles };
              }
              return rect;
            });

            setRectangles(updatedRectangles);

            console.log("rectangles:", updatedRectangles)

            // Reset selected shape and other states
            setSelectedShape(null);
            setSelectedColor('#000000');
            setSelectedRoles([]);
          }}
            color="primary"
            disabled={!selectedShape || !selectedShape.name || selectedRoles.length === 0}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 1 }}>
          Areas Settings
        </Typography>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {rooms.length > 0 ? (
            rooms.map(room => (
              <Button
                key={room.id}
                style={{
                  backgroundColor: stringToColor(room.floor_name),
                  color: '#fff',
                  margin: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
                onClick={() => room.timestamp && handleRoomSelection(room)}
              >
                <Typography variant="subtitle1" component="div">
                  {room.room_name}
                </Typography>
                <Typography variant="caption" component="div" style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {room.floor_name}
                </Typography>
              </Button>
            ))
          ) : (
            <Alert sx={{ mb: 2 }} severity="info">{infoMessage || 'Loading...'}</Alert>
          )}

        </div>
        {selectedRoomDetails && (
          <div style={{
            position: 'relative', // Assicurati che il div abbia position: relative per il posizionamento assoluto dell'icona
            marginTop: '20px',
            padding: '20px',
            borderRadius: '5px',
            backgroundColor: '#33485E',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            color: '#FFFFFF',
          }}>
            <Button
              onClick={handleCloseDetails}
              style={{
                position: 'absolute',  // Posiziona l'icona in alto a destra
                top: 8,
                right: 8,
                padding: 0,
                minWidth: 'auto', // Riduce lo spazio intorno all'icona
                color: 'white' // Colore dell'icona, puoi personalizzare come preferisci
              }}
            >
              <CloseIcon />
            </Button>
            <Typography variant="h4" component="div">{selectedRoomDetails.room_name.toUpperCase()}</Typography>
            <Typography variant="subtitle1" component="div">{`Floor: ${selectedRoomDetails.floor_name}`}</Typography>
            {/* <Typography variant="subtitle1" component="div">
              Color: <span style={{ backgroundColor: selectedRoomDetails.color, padding: '3px' }}>{selectedRoomDetails.color}</span>
            </Typography> */}
            <Typography variant="subtitle1" component="div">{`Can access: ${selectedRoomDetails.roles.join(', ')}`}</Typography>
            <Typography variant="subtitle1" component="div">
              {`Creation Date: ${formatTimestamp(selectedRoomDetails.timestamp)}`}
            </Typography>
            <div style={{ marginTop: '10px' }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                style={{ marginRight: '10px' }}
                onClick={() => handleEditRoom(selectedRoomDetails)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteRoom(selectedRoomDetails.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
        <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
          Add Floor
        </Typography>
        <form onSubmit={handleFloorSubmit}>
          <TextField
            label="Floor Name"
            variant="outlined"
            value={floorName}
            onChange={e => setFloorName(e.target.value)}
            required
            disabled={!!image}
            fullWidth
            sx={{ mb: 2 }}  // Aggiunge spazio sotto il TextField
          />
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          {image && (
            <div style={{ marginBottom: '20px' }}>
              {devicePositionsConfirmed && (
                <>
                  <Button
                    onClick={() => setDrawMode('rectangle')}
                    startIcon={<RectangleIcon />}
                    variant={drawMode === 'rectangle' ? 'contained' : 'outlined'}
                    color="primary"
                    sx={{ marginRight: 2 }}
                  >
                    Rectangle
                  </Button>
                  <Button
                    onClick={() => setDrawMode('line')}
                    startIcon={<LineIcon />}
                    variant={drawMode === 'line' ? 'contained' : 'outlined'}
                    color="primary"
                  >
                    Line
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="success" // Cambia il colore del bottone a verde
                    disabled={rectangles.length === 0}
                    sx={{
                      width: '200px',
                      marginLeft: 2
                    }}
                  >
                    Confirm New Floor
                  </Button>
                </>
              )}

              {!devicePositionsConfirmed && (
                <>
                  <Button
                    onClick={() => prepareDeviceIcon('BS02')}
                    variant={drawMode === 'BS02' ? 'contained' : 'outlined'}
                    color="primary"
                    sx={{ marginRight: 2 }}
                  >
                    BS02
                  </Button>
                  <Button
                    onClick={() => prepareDeviceIcon('BR')}
                    variant={drawMode === 'BR' ? 'contained' : 'outlined'}
                    color="primary"
                    disabled={deviceIcons.filter(icon => icon.type === 'BR').length >= 1} // Disabilita se già presente un "BR"
                  >
                    BR
                  </Button>

                  <Button
                    onClick={() => {
                      // Logga le posizioni dei dispositivi
                      deviceIcons.forEach(icon => {
                        console.log(`Device ${icon.type} at x: ${icon.x}, y: ${icon.y}`);
                      });
                      setDevicePositionsConfirmed(true);
                    }}
                    variant="contained"
                    color="primary"
                    sx={{ width: '200px', marginLeft: 2 }}
                    disabled={!deviceIcons.length} // Disabilita il bottone se non ci sono dispositivi
                  >
                    Confirm Device Position
                  </Button>
                </>
              )}


            </div>
          )}
          {floorName && (
            <input ref={fileInputRef} style={{ marginBottom: 20 }} type="file" onChange={handleImageChange} accept="image/*" />
          )}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onClick={handleCanvasClick}
            style={{
              border: '2px solid black',
              marginTop: '10px',
              marginBottom: '20px',
              display: image ? 'block' : 'none' // Rende il canvas invisibile fino a quando non viene caricata un'immagine
            }}
          ></canvas>
          <img id="uploadedImage" src={image} alt="Uploaded" style={{ display: 'none' }} />
        </form>
      </Container>
    </>
  );
}
