import React, { useEffect, useState } from 'react';
// @mui
import PropTypes from 'prop-types';
import { Box, Card, CardHeader } from '@mui/material';

// ----------------------------------------------------------------------

OpenThreadBrStatus.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function OpenThreadBrStatus({ title, subheader, ...other }) {
  const [bbrStatus, setBbrStatus] = useState({});

  useEffect(() => {
    fetch('/openthread/bbr')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('BBR status not found');
      })
      .then(data => {
        console.log('BBR STATUS SUCCESS', data);
        setBbrStatus(data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  return (
    <Card {...other}>
      <CardHeader title={"OpenThread BBR Status"} subheader={"BBR primary"} />
      <Box p={3}>
        {Object.entries(bbrStatus).map(([key, value]) => (
          <Box key={key} marginBottom={2}>
            <Box component="span" fontWeight="bold" marginRight={1}>
              {key}:
            </Box>
            {value}
          </Box>
        ))}
      </Box>
    </Card>
  );
}