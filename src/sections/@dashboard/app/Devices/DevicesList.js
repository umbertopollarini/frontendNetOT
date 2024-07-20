import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Link, Card, Button, Divider, Typography, CardHeader, Select, MenuItem, Menu, Alert, Snackbar, IconButton, Collapse, Grid, FormControl, InputLabel } from '@mui/material';
import { fToNow } from '../../../../utils/formatTime';
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import Paper from '@mui/material/Paper';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Drawer, List, ListItem, ListItemIcon, ListItemText, BottomNavigation, BottomNavigationAction } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, TimeScale } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';
import Switch from '@mui/material/Switch';
import useResponsive from 'src/hooks/useResponsive';

import { Tooltip as MuiTooltip } from '@mui/material';

// Registrazione dei componenti necessari di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin,
  annotationPlugin
);

const faceStatusChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    zoom: {
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'x',
      },
      pan: {
        enabled: true,
        mode: 'x',
      },
      limits: {
        x: { min: 'original', max: 'original' },
      }
    }
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'minute',
        tooltipFormat: 'HH:mm:ss',
        displayFormats: {
          minute: 'HH:mm',
        }
      },
      title: {
        display: true,
        text: 'Time'
      },
      grid: {
        display: true, // Mostra la griglia per una migliore leggibilità
      }
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Dice Face'
      },
      ticks: {
        stepSize: 1, // Assicura che i ticks siano interi
      }
    }
  }
};

const liveConnectionChartOptions = {
  animation: false,
  normalized: true,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
      text: 'Live Connection Status',
    },
    zoom: {
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'x',
      },
      pan: {
        enabled: true,
        mode: 'x',
      },
      limits: {
        x: { min: 'original', max: 'original' },
      }
    },
    tooltip: {
      callbacks: {
        title: function (tooltipItems) {
          const time = new Date(tooltipItems[0].parsed.x).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return time;
        },
        label: function (tooltipItem) {
          const dataPoint = tooltipItem.raw;
          return `${dataPoint.type}`;
        }
      }
    }
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'minute',
        tooltipFormat: 'HH:mm:ss',
        displayFormats: {
          minute: 'HH:mm',
        }
      },
      title: {
        display: true,
        text: 'Time'
      },
      display: true,
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Status'
      },
    }
  },
  elements: {
    line: {
      tension: 0, // Disabilita le curve delle linee
    }
  }
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
      text: 'Storico',
    },
    zoom: {
      zoom: {
        wheel: { enabled: true }, // Abilita lo zoom con la rotellina del mouse
        pinch: { enabled: true }, // Abilita lo zoom con il pizzico (touch devices)
        mode: 'x', // Abilita lo zoom solo sull'asse X
      },
      pan: {
        enabled: true, // Abilita il pan
        mode: 'x' // Consente il pan solo sull'asse X
      },
      limits: {
        x: { min: 'original', max: 'original' }, // Impedisce il pan oltre i dati originali
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
    },
    x: {
      // Nascondi completamente le etichette e la griglia sull'asse delle X
      ticks: {
        display: false, // Non mostrare le etichette dell'asse X
      },
      grid: {
        display: false, // Nascondi le linee della griglia per l'asse X
      }
    },
  },
};

const optionsPression = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
      text: 'Storico',
    },
    zoom: {
      zoom: {
        wheel: { enabled: true }, // Abilita lo zoom con la rotellina del mouse
        pinch: { enabled: true }, // Abilita lo zoom con il pizzico (touch devices)
        mode: 'x', // Abilita lo zoom solo sull'asse X
      },
      pan: {
        enabled: true, // Abilita il pan
        mode: 'x' // Consente il pan solo sull'asse X
      },
      limits: {
        x: { min: 'original', max: 'original' }, // Impedisce il pan oltre i dati originali
      }
    }
  },
  scales: {
    y: {
      suggestedMin: undefined, // Rimuovi il valore statico per consentire un min dinamico
      suggestedMax: undefined, // Rimuovi il valore statico per consentire un max dinamico
    },
    x: {
      ticks: {
        display: false, // Non mostrare le etichette dell'asse X
      },
      grid: {
        display: false, // Nascondi le linee della griglia per l'asse X
      }
    },
  },
};

const batteryChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
      text: 'Battery Level',
    },
    zoom: {
      zoom: {
        wheel: { enabled: true }, // Abilita lo zoom con la rotellina del mouse
        pinch: { enabled: true }, // Abilita lo zoom con il pizzico (touch devices)
        mode: 'x', // Abilita lo zoom solo sull'asse X
      },
      pan: {
        enabled: true, // Abilita il pan
        mode: 'x' // Consente il pan solo sull'asse X
      },
      limits: {
        x: { min: 'original', max: 'original' }, // Impedisce il pan oltre i dati originali
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      min: 0, // Imposta il limite minimo dell'asse Y a 0
      max: 100, // Imposta il limite massimo dell'asse Y a 100
    },
    x: {
      ticks: {
        display: false, // Non mostrare le etichette dell'asse X
      },
      grid: {
        display: false, // Nascondi le linee della griglia per l'asse X
      }
    },
  },
};

export default function DeviceList() {
  const [deviceData, setDevices] = useState([]);
  const [delayDaysSelected, setDelayDaysSelected] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const [rssiData, setRssiData] = useState({});
  const [liveConnectionData, setliveConnectionData] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingDiceFace, setLoadingDiceFace] = useState(true);
  const [loadingPositioningData, setLoadingPositioningData] = useState(true);
  const [loadingRssiData, setLoadingRssiData] = useState(true);
  const [loadingLiveConnection, setLoadingLiveConnection] = useState(true);
  const [loadingDBData, setLoadingDBData] = useState(true);

  const batteryChartRef = useRef(null);
  const tempChartRef = useRef(null);
  const humChartRef = useRef(null);
  const pressionChartRef = useRef(null);
  const accChartRef = useRef(null);
  const chartRef = useRef(null);
  const bpmChartRef = useRef(null);
  const stepsChartRef = useRef(null);

  const rssiChartRef = useRef(null);
  const livepositioningChartRef = useRef(null);
  const liveconnectionChartRef = useRef(null);
  const facestatusChartRef = useRef(null);

  const [macToNameMap, setMacToNameMap] = useState({});
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [bs02Devices, setbs02Devices] = useState([]);
  const [banglePuckDevices, setbanglePuckDevices] = useState([]);

  const [fetchInterval, setFetchInterval] = useState(1);
  const [tableData, setTableData] = useState({});

  const [positioningData, setPositioningData] = useState({});
  const [diceFaceData, setDiceFaceData] = useState({});

  const [bs02Status, setBs02Status] = useState({});

  const [showLoadingIcon, setShowLoadingIcon] = useState(false);

  const [logData, setLogData] = useState({});
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [value, setValue] = useState(0);

  const [reloadInterval, setReloadInterval] = useState(30000);
  const isDesktop = useResponsive('up', 'lg');

  const [deviceTimestamps, setDeviceTimestamps] = useState([]);

  const [deviceRoles, setDeviceRoles] = useState({});

  const fetchDeviceTimestamps = async () => {

    try {
      const response = await fetch('/current/devices_timestamps');
      const data = await response.json();
      console.log("fetchDeviceTimestamps:", data)
      if (!response.ok) throw new Error(data.error || 'Unknown error');
      setDeviceTimestamps(data);
    } catch (error) {
      console.error('Error fetching device timestamps:', error.message);
    }
  };

  const handleDurationChange = (event) => {
    setSelectedDuration(event.target.value);
  };

  const handleReloadIntervalChange = (event) => {
    setReloadInterval(Number(event.target.value)); // Aggiorna lo stato con il nuovo intervallo selezionato
  };

  const renderReloadIntervalSelector = () => (
    <FormControl fullWidth disabled={showLoadingIcon}>
      <InputLabel id="reload-interval-label" style={{ fontSize: '1.2rem' }}>Select Reload Interval Frequency</InputLabel>
      <Select
        labelId="reload-interval-label"
        id="reload-interval-select"
        value={reloadInterval}
        label="Reload Interval"
        onChange={handleReloadIntervalChange}
      >
        <MenuItem value={30000}>30 Seconds</MenuItem>
        <MenuItem value={60000}>1 Minute</MenuItem>
        <MenuItem value={120000}>2 Minutes</MenuItem>
        <MenuItem value={240000}>4 Minutes</MenuItem>
        <MenuItem value={300000}>5 Minutes</MenuItem>
      </Select>
    </FormControl>
  );

  const [roleMenuAnchorEl, setRoleMenuAnchorEl] = useState(null);
  const [selectedDeviceMac, setSelectedDeviceMac] = useState(null);
  const roles = ['Manager', 'Employee', 'Visitor', 'Maintenance', 'Doctor', 'Patient', 'Equipment'];

  const handleRoleMenuOpen = (event, macAddress) => {
    setRoleMenuAnchorEl(event.currentTarget);
    setSelectedDeviceMac(macAddress);
  };

  const handleRoleMenuClose = () => {
    setRoleMenuAnchorEl(null);
  };

  const handleRoleSelect = async (role) => {
    console.log(`Role ${role} selected for device ${selectedDeviceMac}`);
    setDeviceRoles(prevRoles => ({
      ...prevRoles,
      [selectedDeviceMac]: role
    }));
    handleRoleMenuClose();

    // invio i dati al backedn
    try {
      // Crea il corpo della richiesta
      const body = JSON.stringify({
        macAddress: selectedDeviceMac,
        role: role
      });

      // Effettua la chiamata POST alla tua API per aggiornare il ruolo sul server
      const response = await fetch('/current/setdevicesroles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update device role');

      // Qui puoi gestire ulteriori azioni dopo la conferma del cambio di ruolo
      console.log('Role updated successfully:', result);

    } catch (error) {
      console.error('Error updating device role:', error);
    }
  };

  useEffect(() => {
    fetch('/current/table_counts')
      .then(response => response.json())
      .then(data => {
        setTableData(data);
        setLoadingDBData(false);
      })
      .catch(error => {
        console.error('Error fetching table data:', error);
        setLoadingDBData(false);
      });
  }, []);

  const renderDurationSelector = () => (
    <FormControl fullWidth disabled={showLoadingIcon}>
      <InputLabel id="duration-label" style={{ fontSize: '1.2rem' }}>Select Interval for Daily Data</InputLabel>
      <Select
        labelId="duration-label"
        id="duration-select"
        value={selectedDuration}
        onChange={handleDurationChange}
      >
        <MenuItem value={1}>1 Hour</MenuItem>
        <MenuItem value={3}>3 Hour</MenuItem>
        <MenuItem value={6}>6 Hours</MenuItem>
        <MenuItem value={8}>8 Hours</MenuItem>
        <MenuItem value={12}>12 Hours</MenuItem>
        <MenuItem value={16}>16 Hours</MenuItem>
        <MenuItem value={18}>18 Hours</MenuItem>
        <MenuItem value={20}>20 Hours</MenuItem>
        <MenuItem value={22}>22 Hours</MenuItem>
        <MenuItem value={24}>24 Hours</MenuItem>
      </Select>
    </FormControl>
  );

  // Funzione per ottenere i dati delle facce dai dispositivi PuckJS
  const fetchDiceFaceData = async (macAddress, flag) => {
    if (flag) {
      setLoadingDiceFace(true);
    }
    try {
      const response = await fetch(`/current/diceface?macAddress=${macAddress}&duration=${selectedDuration}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      // Assumi che il nuovo stato includa i dati delle facce per un specifico dispositivo MAC
      setDiceFaceData(prevState => ({ ...prevState, [macAddress]: data }));
      setLoadingDiceFace(false);
    } catch (error) {
      console.error('Error fetching dice face data:', error);
      setLoadingDiceFace(false);
    }
  };

  const fetchPositioningData = async (macAddress, flag) => {
    if (flag) {
      setLoadingPositioningData(true);
    }
    try {
      const response = await fetch(`/current/livepositioning?macAddress=${macAddress}&duration=${selectedDuration}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPositioningData(prevData => ({ ...prevData, [macAddress]: data.data }));
      setLoadingPositioningData(false);
    } catch (error) {
      console.error('Error fetching positioning data:', error);
      setLoadingPositioningData(false);
    }
  };

  const fetchRssiData = async (macAddress, flag) => {
    //console.log("Starting fetchRssiData...")
    if (flag) {
      //console.log("Setting setLoadingRssiData to true...")
      setLoadingRssiData(true);
    }
    try {
      //console.log("Sending response...")
      const response = await fetch(`/current/bangle_info?macAddress=${macAddress}&duration=${selectedDuration}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      //console.log("Receiving response...", data)
      setRssiData(prevState => ({ ...prevState, [macAddress]: data }));
      //console.log("Setting setLoadingRssiData to false...")
      setLoadingRssiData(false);
    } catch (error) {
      console.error('Error fetching RSSI data:', error);
      setLoadingRssiData(false);
    }
  };

  const fetchLiveConnection = async (macAddress, flag) => {
    if (flag) {
      setLoadingLiveConnection(true);
    }
    try {
      const response = await fetch(`/current/bangle_live_connection?macAddress=${macAddress}&duration=${selectedDuration}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setliveConnectionData(prevState => ({ ...prevState, [macAddress]: data }));
      setLoadingLiveConnection(false);
    } catch (error) {
      console.error('Error fetching Live Connection data:', error);
      setLoadingLiveConnection(false);
    }
  };

  // Funzione per generare i dati del grafico delle facce per il PuckJS
  const generateDiceFaceChartData = (mac) => {
    const data = diceFaceData[mac] || [];
    const points = data.map(item => ({
      x: new Date(parseInt(item.timestamp, 10) * 1000),
      y: parseInt(item.face, 10)
    }));

    return {
      datasets: [{
        label: 'Dice Faces Over Time',
        data: points,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        pointRadius: 5
      }]
    };
  };

  const stringToColor = (str) => {
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
  };

  const generateRssiChartData = (mac) => {
    console.log("generateRssiChartData devie:", mac)
    const data = rssiData[mac] || [];

    const groups = data.reduce((acc, item) => {
      const key = item.macBs02;
      const deviceName = macToNameMap[key] || key;
      if (!acc[deviceName]) {
        acc[deviceName] = [];
      }
      const date = new Date(parseInt(item.timestamp, 10) * 1000);
      acc[deviceName].push({
        x: date,
        y: parseInt(item.rssiBangle, 10)
      });
      return acc;
    }, {});

    const datasets = Object.keys(groups).map(key => {
      const color = stringToColor(key);
      return {
        label: `${key}`,
        data: groups[key],
        borderColor: color,
        backgroundColor: color,
        fill: false,
        tension: 0.1
      };
    });
    return { datasets };
  };

  const deviceTypeColors = {
    'Sphygmomanometer': 'rgba(255, 99, 132, 1)', // Rosso
    'Oxymeter': 'rgba(54, 162, 235, 1)', // Blu
    'Scale': 'rgba(75, 192, 192, 1)', // Verde acqua
    'Hystoric Data': 'rgba(153, 102, 255, 1)', // Viola
    'Unknown Device': 'rgba(201, 203, 207, 1)' // Grigio
  };

  const generateLiveConnectionChartData = (mac) => {
    const data = liveConnectionData[mac] || [];

    const groups = data.reduce((acc, item) => {
      const date = new Date(parseInt(item.timestamp, 10) * 1000);
      let deviceType;
      switch (item.type) {
        case "0":
          deviceType = 'Sphygmomanometer';
          break;
        case "1":
        case "2":
          deviceType = 'Oxymeter';
          break;
        case "5":
          deviceType = 'Scale';
          break;
        case "6":
          deviceType = 'Hystoric Data';
          break;
        case "99":
          if (item.status === 1) {
            acc['alarms'] = acc['alarms'] || [];
            acc['alarms'].push({
              x: date,
              y: item.status,
              type: 'alarm'
            });
          }
          return acc;
        default:
          deviceType = 'Unknown Device';
      }

      if (!acc[deviceType]) {
        acc[deviceType] = [];
      }

      acc[deviceType].push({
        x: date,
        y: item.status,
        type: deviceType,
        backgroundColor: deviceTypeColors[deviceType],
        borderColor: deviceTypeColors[deviceType],
        pointRadius: item.status === 0 ? 0 : 5
      });

      return acc;
    }, {});

    const datasets = Object.keys(groups).map(type => {
      if (type === 'alarms') {
        return {
          label: 'Alarms',
          data: groups[type],
          type: 'bar',
          borderColor: 'rgba(255, 0, 0, 1)', // Red color for alarms
          backgroundColor: 'rgba(255, 0, 0, 0.5)', // Semi-transparent red color
          barThickness: 5,
          borderWidth: 1
        };
      } else {
        return {
          label: type,
          data: groups[type],
          borderColor: deviceTypeColors[type],
          backgroundColor: deviceTypeColors[type],
          fill: false,
          tension: 0.0,
          pointBackgroundColor: groups[type].map(item => item.backgroundColor),
          pointBorderColor: groups[type].map(item => item.borderColor),
          pointRadius: groups[type].map(item => item.pointRadius),
          showLine: true
        };
      }
    });

    return { datasets };
  };

  const renderIntervalSelector = () => (
    <FormControl fullWidth disabled={showLoadingIcon}>
      <InputLabel id="fetch-interval-label" style={{ fontSize: '1.2rem' }}>Select Interval for Historical Data</InputLabel>
      <Select
        labelId="fetch-interval-label"
        id="fetch-interval-select"
        value={fetchInterval}
        label="Fetch Interval (Days)"
        onChange={handleChangeFetchInterval}
      >
        {[1, 3, 7, 14, 30].map(day => (
          <MenuItem key={day} value={day}>{day} Day{day > 1 ? 's' : ''}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const handleChangeFetchInterval = (event) => {
    const newInterval = event.target.value;
    setFetchInterval(newInterval);
    setDelayDaysSelected(newInterval); // Assicurati che il numero di giorni di ritardo venga aggiornato
  };

  const updateCharts = (devices) => {
    if (batteryChartRef.current) batteryChartRef.current.resetZoom();
    if (tempChartRef.current) tempChartRef.current.resetZoom();
    if (humChartRef.current) humChartRef.current.resetZoom();
    if (pressionChartRef.current) pressionChartRef.current.resetZoom();
    if (accChartRef.current) accChartRef.current.resetZoom();
    if (bpmChartRef.current) bpmChartRef.current.resetZoom();
    if (stepsChartRef.current) stepsChartRef.current.resetZoom();

    if (rssiChartRef.current) rssiChartRef.current.resetZoom();
    if (livepositioningChartRef.current) livepositioningChartRef.current.resetZoom();
    if (liveconnectionChartRef.current) liveconnectionChartRef.current.resetZoom();
    if (facestatusChartRef.current) facestatusChartRef.current.resetZoom();

    devices.forEach(device => {
      if (batteryChartRef.current) {
        batteryChartRef.current.data = generateChartDataBattery(device.history ?? [], 20);
        batteryChartRef.current.update();
      }
      if (tempChartRef.current) {
        tempChartRef.current.data = generateChartDataTemperature(device.history ?? [], 20);
        tempChartRef.current.update();
      }
      if (humChartRef.current) {
        humChartRef.current.data = generateChartDataHum(device.history ?? [], 20);
        humChartRef.current.update();
      }
      if (pressionChartRef.current && device.type === "banglejs2") {
        pressionChartRef.current.data = generateChartDataPression(device.history ?? [], 20);
        pressionChartRef.current.update();
      }
      if (accChartRef.current && device.type === "banglejs2") {
        accChartRef.current.data = generateChartDataAcceleration(device.history ?? [], 20);
        accChartRef.current.update();
      }
      if (bpmChartRef.current && device.type === "banglejs2") {
        bpmChartRef.current.data = generateChartDataBpm(device.history ?? [], 20);
        bpmChartRef.current.update();
      }
      if (stepsChartRef.current && device.type === "banglejs2") {
        stepsChartRef.current.data = generateChartDataSteps(device.history ?? [], 20);
        stepsChartRef.current.update();
      }
      if (rssiChartRef.current && (device.type === "banglejs2" || device.type === "puckjs2")) {
        rssiChartRef.current.data = generateRssiChartData(device.mac);
        rssiChartRef.current.update();
      }
      if (livepositioningChartRef.current && (device.type === "banglejs2" || device.type === "puckjs2")) {
        livepositioningChartRef.current.data = generatePositioningChartData(device.mac);
        livepositioningChartRef.current.update();
      }
      if (liveconnectionChartRef.current && (device.type === "banglejs2" || device.type === "puckjs2")) {
        liveconnectionChartRef.current.data = generateLiveConnectionChartData(device.mac);
        liveconnectionChartRef.current.update();
      }
      if (facestatusChartRef.current && device.type === "puckjs2") {
        facestatusChartRef.current.data = generateDiceFaceChartData(device.mac);
        facestatusChartRef.current.update();
      }
    });
  };

  // Funzione per generare i dati per il grafico della batteria
  const generateChartDataBattery = (history, timeDelay) => {
    console.log("generateChartDataBattery history:", history)
    const delayDays = new Date(Date.now() - delayDaysSelected * 24 * 60 * 60 * 1000);
    const now = new Date();

    const timestamps = [];
    for (let date = new Date(delayDays); date <= now; date.setMinutes(date.getMinutes() + timeDelay)) {
      timestamps.push(new Date(date));
    }


    const dataPoints = timestamps.map(timestamp => {
      const historyPoint = history.find(data => {
        const dataDate = new Date(data.timestamp * 1000);
        return dataDate.getFullYear() === timestamp.getFullYear() &&
          dataDate.getMonth() === timestamp.getMonth() &&
          dataDate.getDate() === timestamp.getDate() &&
          Math.abs(dataDate - timestamp) < 10 * 60 * 1000;
      });

      return historyPoint ? historyPoint.l : null;
    });
    // console.log("generateChartDataBattery > dataPoints:", dataPoints)

    const backgroundColors = [];
    const borderColors = [];
    const borderWidths = []; // Aggiungi questa linea

    timestamps.forEach((timestamp, index) => {
      const historyPoint = history.find(data => {
        const dataDate = new Date(data.timestamp * 1000);
        return dataDate.getFullYear() === timestamp.getFullYear() &&
          dataDate.getMonth() === timestamp.getMonth() &&
          dataDate.getDate() === timestamp.getDate() &&
          Math.abs(dataDate - timestamp) < 10 * 60 * 1000;
      });

      if (historyPoint && (historyPoint.c == 1 || historyPoint.c == '1')) {
        // bs02 collegato alla corrente ma non in carica
        backgroundColors.push('rgba(144, 238, 144, 0.5)'); // Verde chiaro
        borderColors.push('rgba(0, 128, 0, 1)'); // Verde scuro
        borderWidths.push(3); // Spessore del bordo più largo per i dispositivi in carica
      }
      else if (historyPoint && (historyPoint.c == 1 || historyPoint.c == '2')) {
        // bs02 collegato alla corrente e in carica
        backgroundColors.push('rgba(147, 112, 219, 0.5)'); // Viola chiaro
        borderColors.push('rgba(75, 0, 130, 1)'); // Viola scuro
        borderWidths.push(3); // Spessore del bordo più largo per i dispositivi in carica
      } else {
        backgroundColors.push(dataPoints[index] > 80 ? 'rgba(2, 141, 69, 0.5)' : dataPoints[index] >= 40 ? 'rgba(255, 206, 86, 0.5)' : dataPoints[index] !== null ? 'rgba(255, 99, 132, 0.5)' : 'rgba(0, 0, 0, 0)');
        borderColors.push(dataPoints[index] > 80 ? 'rgba(2, 141, 69, 1)' : dataPoints[index] >= 40 ? 'rgba(255, 206, 86, 1)' : dataPoints[index] !== null ? 'rgba(255, 99, 132, 1)' : 'rgba(0, 0, 0, 0)');
        borderWidths.push(1); // Spessore del bordo standard per le altre barre
      }
    });

    const labels = timestamps.map(timestamp =>
      timestamp.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    return {
      labels,
      datasets: [{
        label: 'Battery Levels (%)',
        data: dataPoints,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: borderWidths, // Assegna qui lo spessore del bordo
      }],
    };
  };

  // Funzione per generare i dati per il grafico della temperatura
  const generateChartDataTemperature = (history, timeDelay) => {
    // console.log("generateChartDataTemperature history:", history)
    const delayDays = new Date(Date.now() - delayDaysSelected * 24 * 60 * 60 * 1000);
    const now = new Date();

    // Prepara un array di timestamp ogni 20 minuti tra twoDaysAgo e ora
    const timestamps = [];
    for (let date = new Date(delayDays); date <= now; date.setMinutes(date.getMinutes() + timeDelay)) {
      timestamps.push(new Date(date));
    }

    const dataPoints = timestamps.map(timestamp => {
      const historyPoint = history.find(data => {
        const dataDate = new Date(data.timestamp * 1000);
        return Math.abs(dataDate - timestamp) < 10 * 60 * 1000; // Differenza minore di 10 minuti
      });

      return historyPoint ? historyPoint.t : null; // Usa `null` se non ci sono dati
    });

    // console.log("generateChartDataTemperature > dataPoints:", dataPoints)

    return {
      labels: timestamps.map(timestamp =>
        timestamp.toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      ),
      datasets: [{
        label: 'Temperature (°C)',
        data: dataPoints,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }],
    };
  };


  // Funzione per generare i dati per il grafico dell'humidità
  const generateChartDataHum = (history, timeDelay) => {
    // console.log("generateChartDataHum history:", history)
    const delayDays = new Date(Date.now() - delayDaysSelected * 24 * 60 * 60 * 1000);
    const now = new Date();

    // Prepara un array di timestamp ogni 20 minuti tra twoDaysAgo e ora
    const timestamps = [];
    for (let date = new Date(delayDays); date <= now; date.setMinutes(date.getMinutes() + timeDelay)) {
      timestamps.push(new Date(date));
    }

    const dataPoints = timestamps.map(timestamp => {
      const historyPoint = history.find(data => {
        const dataDate = new Date(data.timestamp * 1000);
        return Math.abs(dataDate - timestamp) < 10 * 60 * 1000; // Differenza minore di 10 minuti
      });

      return historyPoint ? historyPoint.h : null; // Usa `null` se non ci sono dati
    });

    // console.log("generateChartDataHum > dataPoints:", dataPoints)

    return {
      labels: timestamps.map(timestamp =>
        timestamp.toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      ),
      datasets: [{
        label: 'Humidity (%)',
        data: dataPoints,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    };
  };

  const generateChartDataBpm = (history, timeDelay) => {
    // console.log("generateChartDataBpm history:", history)
    const delayDays = new Date(Date.now() - delayDaysSelected * 24 * 60 * 60 * 1000);
    const now = new Date();

    const timestamps = [];
    for (let date = new Date(delayDays); date <= now; date.setMinutes(date.getMinutes() + timeDelay)) {
      timestamps.push(new Date(date));
    }

    const dataPoints = timestamps.map(timestamp => {
      const historyPoint = history.find(data => {
        const dataDate = new Date(data.timestamp * 1000);
        return Math.abs(dataDate - timestamp) < 10 * 60 * 1000;
      });

      return historyPoint ? { m: historyPoint.min, M: historyPoint.max, BPM: historyPoint.bpm } : { m: null, M: null, BPM: null };
    });

    return {
      labels: timestamps.map(timestamp =>
        timestamp.toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      ),
      datasets: [
        {
          label: 'Hearth Rate (min)',
          data: dataPoints.map(point => point.m),
          fill: false,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.4,
        },
        {
          label: 'Hearth Rate (max)',
          data: dataPoints.map(point => point.M),
          fill: false,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.4,
        },
        {
          label: 'Hearth Rate (average)',
          data: dataPoints.map(point => point.BPM),
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.4,
        }
      ],
    };
  };

  const generateChartDataSteps = (history, timeDelay) => {
    // console.log("generateChartDataSteps history:", history)
    const delayDays = new Date(Date.now() - delayDaysSelected * 24 * 60 * 60 * 1000);
    const now = new Date();

    const timestamps = [];
    for (let date = new Date(delayDays); date <= now; date.setMinutes(date.getMinutes() + timeDelay)) {
      timestamps.push(new Date(date));
    }

    const dataPoints = timestamps.map(timestamp => {
      const historyPoint = history.find(data => {
        const dataDate = new Date(data.timestamp * 1000);
        return Math.abs(dataDate - timestamp) < 10 * 60 * 1000;
      });

      return historyPoint ? historyPoint.s : null;
    });

    return {
      labels: timestamps.map(timestamp =>
        timestamp.toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      ),
      datasets: [{
        label: 'Steps',
        data: dataPoints,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4
      }],
    };
  };

  const generatePositioningChartData = (mac) => {
    const data = positioningData[mac] || [];
    console.log("generatePositioningChartData data: ", data)
    const dataPoints = data.map(item => {
      const date = new Date(parseInt(item.timestamp, 10) * 1000);
      let color;
      if (item.confidence <= 40) {
        color = 'rgba(255, 99, 132, 1)'; // Rosso
      } else if (item.confidence <= 70) {
        color = 'rgba(255, 165, 0, 1)'; // Arancione
      } else {
        color = 'rgba(19, 132, 18, 1)'; // Verde
      }
      return {
        x: date,
        y: item.room_name.trim(),
        confidence: item.confidence,
        backgroundColor: color,
        borderColor: color,
      };
    });

    return {
      datasets: [{
        label: 'Positioning Data',
        data: dataPoints,
        backgroundColor: dataPoints.map(point => point.backgroundColor),
        borderColor: dataPoints.map(point => point.borderColor),
        borderWidth: 2,
        pointRadius: 5,
        tension: 0.4,
        fill: false,
        showLine: true,
        spanGaps: true,
      }],
    };
  };

  // Grafico Pressione Bangle
  const generateChartDataPression = (history, timeDelay) => {
    // console.log("generateChartDataPression history:", history)
    const delayDays = new Date(Date.now() - delayDaysSelected * 24 * 60 * 60 * 1000);
    const now = new Date();

    // Prepara un array di timestamp ogni 20 minuti tra twoDaysAgo e ora
    const timestamps = [];
    for (let date = new Date(delayDays); date <= now; date.setMinutes(date.getMinutes() + timeDelay)) {
      timestamps.push(new Date(date));
    }

    // console.log("generateChartDataPression > history:", history)

    const dataPoints = timestamps.map(timestamp => {
      const historyPoint = history.find(data => {
        const dataDate = new Date(data.timestamp * 1000);
        return Math.abs(dataDate - timestamp) < 10 * 60 * 1000; // Differenza minore di 10 minuti
      });

      return historyPoint ? historyPoint.p : null; // Usa `null` se non ci sono dati
    });

    // console.log("generateChartDataPression > dataPoints:", dataPoints)

    return {
      labels: timestamps.map(timestamp =>
        timestamp.toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      ),
      datasets: [{
        label: 'Atmospheric pressure (hPa)',
        data: dataPoints,
        fill: false,
        borderColor: 'rgba(0, 191, 255, 1)',
        backgroundColor: 'rgba(0, 191, 255, 0.5)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4  // Aggiunge una leggera curvatura alle linee
      }],
    };
  };

  // Grafico Acceleration Bangle
  const generateChartDataAcceleration = (history, timeDelay) => {
    const delayDays = new Date(Date.now() - delayDaysSelected * 24 * 60 * 60 * 1000);
    const now = new Date();

    // Prepara un array di timestamp ogni 20 minuti tra delayDays e ora
    const timestamps = [];
    for (let date = new Date(delayDays); date <= now; date.setMinutes(date.getMinutes() + timeDelay)) {
      timestamps.push(new Date(date));
    }

    const dataPoints = timestamps.map(timestamp => {
      const historyPoint = history.find(data => {
        const dataDate = new Date(data.timestamp * 1000);
        return Math.abs(dataDate - timestamp) < 10 * 60 * 1000; // Differenza minore di 10 minuti
      });

      // Ritorna `historyPoint.mad` se disponibile, altrimenti controlla `historyPoint.mov` se `mad` è null
      if (historyPoint) {
        return historyPoint.mad ? historyPoint.mad : historyPoint.mov;
      }
      return null; // Ritorna null se non ci sono dati
    });

    return {
      labels: timestamps.map(timestamp =>
        timestamp.toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      ),
      datasets: [{
        label: 'Max Accelleration Diff (m/s^2)',
        data: dataPoints,
        backgroundColor: 'rgba(230, 191, 255, 0.5)',
        borderColor: 'rgba(230, 191, 255, 1)',
        borderWidth: 1,
      }],
    };
  };

  const fetchBs02Status = async () => {
    try {
      const response = await fetch('/current/bs02_status');
      const data = await response.json();
      if (response.ok) {
        setBs02Status(data.reduce((acc, item) => {
          acc[item.macBS02] = item;
          return acc;
        }, {}));
      } else {
        throw new Error(data.error || 'Failed to fetch BS02 status');
      }
    } catch (error) {
      console.error('Error fetching BS02 status:', error);
    }
  };

  const fetchLogData = async (macAddress, flag) => {

    if (flag) {
      setLoadingLogs(true);
    }
    try {
      const response = await fetch(`/current/logdevices?macAddress=${macAddress}&duration=${fetchInterval}`);
      if (!response.ok) {
        throw new Error('Failed to fetch log data');
      }
      const logData = await response.json();
      setLogData(prevLogs => ({ ...prevLogs, [macAddress]: logData }));
      console.log("logData:", logData)
    } catch (error) {
      console.error('Error fetching log data:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // SIA AVVIANO ALL'INIZIO
  useEffect(() => {
    console.log("DETECT CHANGE IN fetchInterval:", fetchInterval)
    fetchData(true);
    fetchBs02Status();
  }, [fetchInterval]);

  useEffect(() => {
    if (deviceData.length > 0) {
      console.log("DETECT CHANGE IN selectedDuration:", selectedDuration)
      fetchDataMinutes(deviceData, true)
    }
  }, [selectedDuration]);
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  const fetchData = async (shouldUpdateCharts = false) => {
    if (shouldUpdateCharts) {
      setLoading(true);
    }

    try {
      const response = await fetch(`/current/devices_sql?days=${fetchInterval}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unknown error');

      setDevices(data.devices);
      console.log("flag variable is set to:", shouldUpdateCharts)
      // carico dati per grafici al minuto
      fetchDataMinutes(data.devices, shouldUpdateCharts);

      // carico i dati per i semafori
      fetchDeviceTimestamps();

      const macNameMap = data.devices.reduce((acc, device) => {
        acc[device.mac] = device.name;
        return acc;
      }, {});
      setMacToNameMap(macNameMap);

      const bs02d = data.devices.filter(device => device.type === "bs02");
      const otherDevices = data.devices.filter(device => device.type === "banglejs2" || device.type === "puckjs2" || device.type === "smartphone");
      setbs02Devices(bs02d);
      setbanglePuckDevices(otherDevices);

      // Update charts bs02 after setting devices
      if (shouldUpdateCharts) {
        updateCharts(bs02d);
        updateCharts(otherDevices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error.message);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataMinutes = async (alldevices, flag) => {
    //console.log("loading fetchDataMinutes with flag: ", flag)
    if (alldevices.some(device => device.type === "banglejs2" || device.type === "puckjs2")) {
      alldevices.forEach(device => {
        if (device.type === "banglejs2" || device.type === "puckjs2") {
          fetchRssiData(device.mac, flag);
          fetchLiveConnection(device.mac, flag);
          fetchPositioningData(device.mac, flag);

          // solo per i puckjs faccio il controllo sulle facce
          if (device.type === "puckjs2") {
            fetchDiceFaceData(device.mac, flag);
          }
        } else if (device.type === "bs02") {
          fetchLogData(device.mac, flag)
        }
      });
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("loading:", loading)
      console.log("loadingDBData:", loadingDBData)
      console.log("loadingDiceFace:", loadingDiceFace)
      console.log("loadingPositioningData:", loadingPositioningData)
      console.log("loadingRssiData:", loadingRssiData)
      console.log("loadingLiveConnection:", loadingLiveConnection)
      console.log("loadingLogs:", loadingLogs)
      console.log("reloadInterval:", reloadInterval)
      if (loading || loadingDBData || loadingDiceFace || loadingPositioningData || loadingRssiData || loadingLiveConnection || loadingLogs) {
        console.log("WARNING : RELOADING BLOCCATO, DELLE RISORSE STANNO ANCORA CARICANDO!!!")
      } else {
        console.log("Reloading datas...")
        setShowLoadingIcon(true);
        console.log("> Reloading fetchData...")
        fetchData(false);
        fetchBs02Status();
        setTimeout(() => setShowLoadingIcon(false), 4000);
      }
    }, reloadInterval);

    // Cleanup function to clear interval when component unmounts or dependencies change
    return () => clearInterval(intervalId);
  }, [reloadInterval, loading, loadingDBData, loadingDiceFace, loadingPositioningData, loadingRssiData, loadingLiveConnection, loadingLogs]); // Dependencies array, you can add more dependencies as needed  

  // Funzione per controllare se un campo è vuoto o nullo e per trasformare il testo in maiuscolo se necessario
  const renderDataOrIcon = (data, isTypeField = false) => {
    if (data === "" || data === null) {
      return <ReportProblemIcon color="warning" />;
    } else {
      return isTypeField ? data.toUpperCase() : data;
    }
  };

  const handleToggle = async (macAddress) => {
    // Trova il dispositivo corrispondente e inverte il suo stato corrente
    const updatedDevices = bs02Devices.map(device => {
      if (device.mac === macAddress) {
        return { ...device, status: !device.status };
      }
      return device;
    });

    // Trova il dispositivo specifico per ottenere il nuovo stato
    const device = updatedDevices.find(device => device.mac === macAddress);

    // Aggiorna l'elenco dei dispositivi nello stato locale
    setbs02Devices(updatedDevices);

    const postData = {
      macAddress: macAddress,
      status: device.status
    };

    // Invio della richiesta al backend
    fetch('/current/devicestatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update device status');
        }
        return response.json();
      })
      .then(data => {
        console.log('Update successful:', data);
      })
      .catch(error => {
        console.error('Error updating device status:', error);
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return '#006400'; // DarkGreen
      case 2: return '#FFA500'; // Orange
      case 3: return '#FF0000'; // Red
      default: return '#808080'; // Grey
    }
  };

  const getBatteryColor = (battery) => {
    if (battery > 80) return '#006400'; // DarkGreen
    if (battery > 40) return '#FFA500'; // Orange
    return '#FF0000'; // Red
  };

  const isIPv6 = (addr) => {
    const ipv6Regex = /^[a-fA-F0-9:]+$/;
    return ipv6Regex.test(addr) && addr.includes(':');
  };

  const getHistoricalDataColor = (timestamp) => {
    const now = new Date();
    const dataTime = new Date(parseInt(timestamp, 10) * 1000);
    const diffHours = (now - dataTime) / (1000 * 60 * 60);
    if (!timestamp) return '#808080'
    if (diffHours <= 2) return '#006400'; // Verde per dati nelle ultime 2 ore
    if (diffHours <= 4) return '#FFA500'; // Giallo per dati nelle ultime 4 ore
    return '#FF0000'; // Rosso per dati nelle ultime 6 ore
  };

  const getLiveDataColor = (timestamp) => {
    const now = new Date();
    const dataTime = new Date(parseInt(timestamp, 10) * 1000);
    const diffMinutes = (now - dataTime) / (1000 * 60);

    if (!timestamp) return '#808080'
    if (diffMinutes <= 2) return '#006400'; // Verde per dati negli ultimi 2 minuti
    if (diffMinutes <= 5) return '#FFA500'; // Giallo per dati negli ultimi 5 minuti
    return '#FF0000'; // Rosso per dati negli ultimi 10 minuti
  };

  const getLiveDataColorBatt = (battery) => {

    if (!battery) return '#808080'
    if (battery >= 80) return '#006400'; // Verde per dati negli ultimi 2 minuti
    if (battery >= 40 && battery <= 79) return '#FFA500'; // Giallo per dati negli ultimi 5 minuti
    return '#FF0000'; // Rosso per dati negli ultimi 10 minuti
  };

  const renderDatabaseInfo = (dbName, dbInfo) => {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardHeader
          title={dbName.replace('.db', '').toUpperCase()}
          sx={{ mb: 3 }}
          action={
            <IconButton
              aria-label="settings"
              onClick={() => setExpandedId(expandedId === dbName ? null : dbName)}
            >
              {expandedId === dbName ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          }
        />
        <Collapse in={expandedId === dbName} timeout="auto" unmountOnExit>
          <Box p={3} sx={{ backgroundColor: 'rgba(173, 216, 230, 0.3)' }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Info</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>DB Creation Date</TableCell>
                    <TableCell>{dbInfo.dbDate || "Loading..."}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Active Days</TableCell>
                    <TableCell>{dbInfo.totalActiveDays || "Loading..."}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total DB Dimension</TableCell>
                    <TableCell>{dbInfo.totalDBDimension || "Loading..."}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Table Name</TableCell>
                    <TableCell>Record Count</TableCell>
                    <TableCell>Size (KB)</TableCell>
                    <TableCell>Last Saved</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dbInfo.tableDatas ? (
                    Object.entries(dbInfo.tableDatas).map(([table, info]) => (
                      <TableRow key={table}>
                        <TableCell>{table}</TableCell>
                        <TableCell>{info.record}</TableCell>
                        <TableCell>{info.size}</TableCell>
                        <TableCell>{info.lastSaved}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Loading table data...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Collapse>
      </Card>
    );
  };

  return (
    <Card>
      <Paper sx={{ position: 'fixed', bottom: 0, left: isDesktop ? '280px' : 0, right: 0, zIndex: 1500 }} elevation={3}>
        <BottomNavigation
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          showLabels
        >
          <BottomNavigationAction
            label="Fetch Intervals Days"
            value={0}
            component={() => renderIntervalSelector()}
          />
          <BottomNavigationAction
            label="Select Interval Hourly"
            value={1}
            component={() => renderDurationSelector()}
          />
          <BottomNavigationAction
            label="Reload Interval"
            value={2}
            component={() => renderReloadIntervalSelector()}
          />
        </BottomNavigation>
      </Paper>
      {showLoadingIcon && (
        <Box
          sx={{
            position: 'fixed',
            right: 16, // Distanza dal lato destro del viewport
            bottom: 16, // Distanza dal fondo del viewport
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      {(loading || loadingDBData || loadingDiceFace || loadingPositioningData || loadingRssiData || loadingLiveConnection || loadingLogs) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1301
          }}
        >
          <CircularProgress />
          <Box mt={2} sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
              Loading Historical data: <span style={{ color: loading ? 'orange' : 'green' }}>{loading ? "loading..." : "loaded"}</span>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
              Loading Devices Logs: <span style={{ color: loadingLogs ? 'orange' : 'green' }}>{loadingLogs ? "loading..." : "loaded"}</span>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
              Loading DB Analytics data: <span style={{ color: loadingDBData ? 'orange' : 'green' }}>{loadingDBData ? "loading..." : "loaded"}</span>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
              Loading Dice Face: <span style={{ color: loadingDiceFace ? 'orange' : 'green' }}>{loadingDiceFace ? "loading..." : "loaded"}</span>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
              Loading Positioning Data: <span style={{ color: loadingPositioningData ? 'orange' : 'green' }}>{loadingPositioningData ? "loading..." : "loaded"}</span>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
              Loading RSSI Data: <span style={{ color: loadingRssiData ? 'orange' : 'green' }}>{loadingRssiData ? "loading..." : "loaded"}</span>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
              Loading Live Connection: <span style={{ color: loadingLiveConnection ? 'orange' : 'green' }}>{loadingLiveConnection ? "loading..." : "loaded"}</span>
            </Typography>
          </Box>
        </Box>
      )}
      {/* <CardHeader title="Devices" subheader="List of all Devices in the Network" /> */}

      <Box p={3} sx={{ backgroundColor: 'rgba(173, 216, 230, 0.3)' }}> {/* Light Blue background */}
        <Typography variant="h4" p={3} sx={{ mb: 0, mt: 0 }}>
          Databases Info
        </Typography>
        {tableData ? (
          Object.entries(tableData).map(([dbName, dbInfo]) =>
            renderDatabaseInfo(dbName, dbInfo)
          )
        ) : (
          <Typography variant="subtitle1" gutterBottom>
            Loading databases info...
          </Typography>
        )}
      </Box>

      <Box p={3} sx={{ backgroundColor: 'rgba(144, 238, 144, 0.3)' }}>
        <Typography variant="h4" p={3} sx={{ mb: 0, mt: 0 }}>
          ({bs02Devices.length}) Mesh Devices
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>MAC Address</TableCell>
                <TableCell>IPv6</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Online</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {bs02Devices.map((device) => (
                <React.Fragment key={device.mac}>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Semaforo per lo status */}
                        <MuiTooltip title="Historical Data Status" placement="top" arrow>
                          <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: device.status ? getStatusColor(bs02Status[device.mac]?.status) : '#808080' }} />
                        </MuiTooltip>

                        {/* Semaforo per la batteria */}
                        <MuiTooltip title="Last Battery Status" placement="top" arrow>
                          <Box sx={{ width: 14, height: 14, borderRadius: '50%', ml: 1, backgroundColor: device.status ? getBatteryColor(bs02Status[device.mac]?.battery) : '#808080' }} />
                        </MuiTooltip>
                      </Box>
                    </TableCell>
                    <TableCell>{renderDataOrIcon(device.name)}</TableCell>
                    <TableCell>{renderDataOrIcon(device.type)}</TableCell>
                    <TableCell>{renderDataOrIcon(device.mac)}</TableCell>
                    <TableCell>{renderDataOrIcon(device.ipv6)}</TableCell>
                    <TableCell>{renderDataOrIcon(device.v)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={device.status}
                        onChange={() => handleToggle(device.mac)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => setExpandedId(expandedId === device.mac ? null : device.mac)}>
                        {expandedId === device.mac ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={expandedId === device.mac} timeout="auto" unmountOnExit>
                        <Typography variant="h4" gutterBottom>
                          Historical data
                        </Typography>
                        <Grid container spacing={2} justifyContent="center">
                          {expandedId === device.mac ? (
                            <>

                              <Grid item xs={6}>
                                <Typography variant="h6" gutterBottom>
                                  Battery
                                </Typography>
                                <Box height="250px" width="100%">
                                  <Bar ref={batteryChartRef} data={generateChartDataBattery(device.history ?? [], device.type === "banglejs2" ? 20 : 20)} options={batteryChartOptions} />
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="h6" gutterBottom>
                                  Temperature
                                </Typography>
                                <Box height="250px" width="100%">
                                  <Bar ref={tempChartRef} data={generateChartDataTemperature(device.history ?? [], device.type === "banglejs2" ? 20 : 20)} options={options} />
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="h6" gutterBottom>
                                  Humidity
                                </Typography>
                                <Box height="250px" width="100%">
                                  <Bar ref={humChartRef} data={generateChartDataHum(device.history ?? [], device.type === "banglejs2" ? 20 : 20)} options={options} />
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="h6" gutterBottom>
                                  Log Messages
                                </Typography>
                                <TableContainer component={Paper} style={{ maxHeight: 250 }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Message</TableCell>
                                        <TableCell>Timestamp</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {logData[device.mac]?.map((log) => (
                                        <TableRow key={log.id}>
                                          <TableCell style={{ backgroundColor: isIPv6(log.type) ? 'yellow' : 'transparent' }}>
                                            {log.type}
                                          </TableCell>
                                          <TableCell>
                                            {new Date(log.timestamp * 1000).toLocaleString()}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Grid>
                            </>
                          ) : (
                            <Grid item xs={12}>
                              <Typography variant="subtitle1" gutterBottom>
                                Expand to view charts.
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box p={3} sx={{ backgroundColor: 'rgba(255, 239, 213, 0.3)' }}> {/* Light Peach background */}
        <Typography variant="h4" p={3} sx={{ mb: 0, mt: 0 }}>
          ({banglePuckDevices.length}) Connected Devices
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Last Position</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>MAC Address</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {banglePuckDevices.map((device) => (
                <React.Fragment key={device.mac}>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Traffic light for historical data */}
                        <MuiTooltip title="Historical Data Status" placement="top" arrow>
                          <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: getHistoricalDataColor(deviceTimestamps[device.mac]?.last_timestamp_puck) }} />
                        </MuiTooltip>
                        {/* Traffic light for live data */}
                        <MuiTooltip title="Positioning Data Status" placement="top" arrow>
                          <Box sx={{ width: 14, height: 14, borderRadius: '50%', ml: 1, backgroundColor: getLiveDataColor(deviceTimestamps[device.mac]?.last_timestamp_positioning) }} />
                        </MuiTooltip>
                        <MuiTooltip title="Last Battery Status" placement="top" arrow>
                          <Box sx={{ width: 14, height: 14, borderRadius: '50%', ml: 1, backgroundColor: getLiveDataColorBatt(deviceTimestamps[device.mac]?.battery) }} />
                        </MuiTooltip>
                      </Box>
                    </TableCell>
                    <TableCell>{renderDataOrIcon(device.name)}</TableCell>
                    <TableCell
                      onClick={(event) => handleRoleMenuOpen(event, device.mac)}
                      sx={{
                        cursor: 'pointer', // Cambia il cursore in un puntatore
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)', // Leggero sfondo al passaggio del mouse per feedback visivo
                          textDecoration: 'underline' // Sottolinea il testo al passaggio del mouse
                        }
                      }}
                    >
                      {deviceRoles[device.mac] || device.role || "Unassigned"}
                    </TableCell>
                    <Menu
                      id="role-menu"
                      anchorEl={roleMenuAnchorEl}
                      keepMounted
                      open={Boolean(roleMenuAnchorEl)}
                      onClose={handleRoleMenuClose}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role} onClick={() => handleRoleSelect(role)}>
                          {role}
                        </MenuItem>
                      ))}
                    </Menu>
                    <TableCell>{renderDataOrIcon(deviceTimestamps[device.mac]?.last_position ? deviceTimestamps[device.mac]?.last_position : "...")}</TableCell>
                    <TableCell>{renderDataOrIcon(device.type)}</TableCell>
                    <TableCell>{renderDataOrIcon(device.mac)}</TableCell>
                    <TableCell>{renderDataOrIcon(device.v)}</TableCell>
                    <TableCell>{renderDataOrIcon(device.user_id.substring(0, 5))}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => setExpandedId(expandedId === device.mac ? null : device.mac)}>
                        {expandedId === device.mac ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={expandedId === device.mac} timeout="auto" unmountOnExit>
                        <Typography variant="h4" gutterBottom>
                          Historical data
                        </Typography>
                        <Grid container spacing={2} justifyContent="center">
                          {expandedId === device.mac ? (
                            <>
                              <Grid item xs={6}>
                                <Typography variant="h6" gutterBottom>
                                  Battery
                                </Typography>
                                <Box height="250px" width="100%">
                                  <Bar ref={batteryChartRef} data={generateChartDataBattery(device.history ?? [], device.type === "banglejs2" ? 20 : 20)} options={batteryChartOptions} />
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="h6" gutterBottom>
                                  Temperature
                                </Typography>
                                <Box height="250px" width="100%">
                                  <Bar ref={tempChartRef} data={generateChartDataTemperature(device.history ?? [], device.type === "banglejs2" ? 20 : 20)} options={options} />
                                </Box>
                              </Grid>
                              {device.type === "banglejs2" && (
                                <>
                                  <Grid item xs={6}>
                                    <Typography variant="h6" gutterBottom>
                                      Pressure
                                    </Typography>
                                    <Box height="250px" width="100%">
                                      <Line ref={pressionChartRef} data={generateChartDataPression(device.history ?? [], device.type === "banglejs2" ? 20 : 20)} options={optionsPression} />
                                    </Box>
                                  </Grid>
                                </>
                              )}
                              <Grid item xs={6}>
                                <Typography variant="h6" gutterBottom>
                                  Accelleration
                                </Typography>
                                <Box height="250px" width="100%">
                                  <Bar ref={accChartRef} data={generateChartDataAcceleration(device.history ?? [], device.type === "banglejs2" ? 20 : 20)} options={options} />
                                </Box>
                              </Grid>
                              {device.type === "banglejs2" && (
                                <>
                                  <Grid item xs={6}>
                                    <Typography variant="h6" gutterBottom>
                                      Hearth Rate
                                    </Typography>
                                    <Box height="250px" width="100%">
                                      <Line ref={bpmChartRef} data={generateChartDataBpm(device.history ?? [], device.type === "banglejs2" ? 20 : 20)} options={options} />
                                    </Box>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="h6" gutterBottom>
                                      Steps
                                    </Typography>
                                    <Box height="250px" width="100%">
                                      <Bar ref={stepsChartRef} data={generateChartDataSteps(device.history ?? [], device.type === "banglejs2" ? 20 : 20)} options={options} />
                                    </Box>
                                  </Grid>
                                </>
                              )}
                              <Grid item xs={12}>
                                <Typography variant="h4" gutterBottom>
                                  Last day data
                                </Typography>
                                {/* <Box p={3}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                      {renderDurationSelector()}
                                    </Grid>
                                  </Grid>
                                </Box> */}
                                <Typography variant="h6" gutterBottom>
                                  RSSI Chart
                                </Typography>
                                <Box height="250px" width="100%" style={{ width: '100%' }}>
                                  <Line ref={rssiChartRef} data={generateRssiChartData(device.mac ?? "")}
                                    options={{
                                      animation: false,
                                      normalized: true,
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      plugins: {
                                        legend: {
                                          position: 'top',
                                        },
                                        title: {
                                          display: false,
                                          text: 'RSSI Trends',
                                        },
                                        zoom: {
                                          zoom: {
                                            wheel: { enabled: true },
                                            pinch: { enabled: true },
                                            mode: 'x',
                                          },
                                          pan: {
                                            enabled: true,
                                            mode: 'x',
                                          },
                                          limits: {
                                            x: { min: 'original', max: 'original' },
                                          }
                                        }
                                      },
                                      scales: {
                                        x: {
                                          type: 'time',
                                          time: {
                                            unit: 'minute',
                                            tooltipFormat: 'HH:mm:ss',
                                            displayFormats: {
                                              minute: 'HH:mm',
                                            }
                                          },
                                          title: {
                                            display: true,
                                            text: 'Time'
                                          },
                                          display: true,
                                        },
                                        y: {
                                          beginAtZero: false,
                                          title: {
                                            display: true,
                                            text: 'RSSI Value'
                                          },
                                        }
                                      }
                                    }} />
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                  AI Live Positioning Prediction
                                </Typography>
                                <Box height="250px" width="100%" style={{ width: '100%' }}>
                                  <Line ref={livepositioningChartRef}
                                    data={generatePositioningChartData(device.mac)}
                                    options={{
                                      animation: false,
                                      normalized: true,
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      plugins: {
                                        legend: {
                                          position: 'top',
                                        },
                                        title: {
                                          display: false,
                                          text: '',
                                        },
                                        zoom: {
                                          zoom: {
                                            wheel: { enabled: true },
                                            pinch: { enabled: true },
                                            mode: 'x',
                                          },
                                          pan: {
                                            enabled: true,
                                            mode: 'x',
                                          },
                                          limits: {
                                            x: { min: 'original', max: 'original' },
                                          }
                                        },
                                        tooltip: {
                                          callbacks: {
                                            label: function (tooltipItem) {
                                              const dataPoint = tooltipItem.raw;
                                              return `Room: ${dataPoint.y}, Confidence: ${dataPoint.confidence}%`;
                                            }
                                          }
                                        }
                                      },
                                      scales: {
                                        x: {
                                          type: 'time',
                                          time: {
                                            unit: 'minute',
                                            tooltipFormat: 'HH:mm:ss',
                                            displayFormats: {
                                              minute: 'HH:mm',
                                            }
                                          },
                                          title: {
                                            display: true,
                                            text: 'Time'
                                          },
                                          display: true,
                                        },
                                        y: {
                                          type: 'category',
                                          labels: positioningData[device.mac] ? [...new Set(positioningData[device.mac].map(item => item.room_name.trim()))] : [],
                                          title: {
                                            display: true,
                                            text: 'Rooms'
                                          },
                                          display: true,
                                        }
                                      }
                                    }}
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                  Live Connection
                                </Typography>
                                <Box height="250px" width="100%" style={{ width: '100%' }}>
                                  <Line ref={liveconnectionChartRef}
                                    data={generateLiveConnectionChartData(device.mac ?? "")}
                                    options={liveConnectionChartOptions}
                                  />
                                </Box>
                              </Grid>
                              {device.type === "puckjs2" && (
                                <>
                                  <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                      Face Status
                                    </Typography>
                                    <Box height="250px" width="100%" style={{ width: '100%' }}>
                                      <Line
                                        ref={facestatusChartRef}
                                        data={generateDiceFaceChartData(device.mac ?? "")}
                                        options={faceStatusChartOptions}
                                      />
                                    </Box>
                                  </Grid>
                                </>
                              )}
                            </>
                          ) : (
                            <Grid item xs={12}>
                              <Typography variant="subtitle1" gutterBottom>
                                Expand to view charts.
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card >
  );
}
