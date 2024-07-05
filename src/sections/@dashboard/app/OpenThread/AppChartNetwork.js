import { useEffect, useState } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network.min.js';
import { Box, Card, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';

export default function AppChartNetwork() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [nodeData, setNodeData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);

  const fetchDevices = () => {
    return fetch('/current/devicesInfoOnly')
      .then((response) => response.json())
      .catch((error) => {
        console.error('Error fetching device data:', error);
      });
  };

  const fetchData = () => {
    fetch('/openthread/topology/ip6-addrs')
      .then((response) => response.json())
      .then(async (data) => {
        // estraggo dati dei nodi devices
        const devices = await fetchDevices();
        setDeviceData(devices.devices);
        console.log("devices.devices:", devices.devices)

        const nodes = data.nodes.map((node) => {
          let color = '#97C2FC'; // default color
          if (node.info === '- me - br') {
            color = '#FFC107'; // change color for node with info="- me - br"
          } else if (node.info === '- leader') {
            color = '#4CAF50'; // change color for node with info="- leader"
          } else if (node.info === '- me - leader') {
            color = '#FFC107'; // change color for node with info="- leader"
          }
          console.log("node:", node)
          const deviceName = devices.devices.find(device => {
            const lastFourCharactersIpv6 = device.ipv6.slice(-4); 
            const lastFourCharactersRloc16 = node.rloc16.slice(-4);
            return lastFourCharactersIpv6 === lastFourCharactersRloc16;
          })?.name || 'Unknown';
          return {
            id: node.id,
            label: node.id + '\n' + node.info,
            color: color, // add color property to node object
            name: deviceName
          };
        });
        setNodes(nodes);

        const edges = data.nodes.flatMap((node) => {
          return node.links.map((link) => {
            return {
              from: node.id,
              to: link,
            };
          });
        });
        setEdges(edges);
        const enrichedNodeData = data.nodes.map(node => {
          const deviceName = devices.devices.find(device => {
            const lastFourCharactersIpv6 = device.ipv6.slice(-4); 
            const lastFourCharactersRloc16 = node.rloc16.slice(-4);
            return lastFourCharactersIpv6 === lastFourCharactersRloc16;
          })?.name || 'Unknown';
          return { ...node, name: deviceName };
        });
        setNodeData(enrichedNodeData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const container = document.getElementById('network');

    const options = {
      nodes: {
        shape: 'dot',
        size: 30,
        font: {
          size: 32,
          color: '#000000', // changed color to black
        },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        width: 2,
        shadow: true,
        length: 900
      },
      physics: {
        enabled: true,
      },
    };

    const network = new Network(container, { nodes, edges }, options);

    return () => {
      network.destroy();
    };
  }, [nodes, edges]);

  return (
    <Card>
      <CardHeader title="Network Topology" />
      <Box p={2}>
        <div id="network" style={{ height: 'calc(70vh - 150px)' }} />
        <Box mt={2} display="flex" justifyContent="center">
          <Button variant="contained" onClick={fetchData}>Refetch data</Button>
        </Box>
        <br></br>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>id</TableCell>
                <TableCell>name</TableCell>
                <TableCell>rloc16</TableCell>
                <TableCell>ext-addr</TableCell>
                <TableCell>ver</TableCell>
                <TableCell>info</TableCell>
                <TableCell>ip6_addr</TableCell>
                <TableCell>links</TableCell>
                <TableCell>ping_time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nodeData.map((node) => (
                <TableRow key={node.id}>
                  <TableCell>{node.id}</TableCell>
                  <TableCell>{node.name}</TableCell>
                  <TableCell>{node.rloc16}</TableCell>
                  <TableCell>{node['ext-addr']}</TableCell>
                  <TableCell>{node.ver}</TableCell>
                  <TableCell>{node.info}</TableCell>
                  <TableCell>{node.ip6_addr}</TableCell>
                  <TableCell>{node.links.join(', ')}</TableCell>
                  <TableCell>{node.ping_time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
}
