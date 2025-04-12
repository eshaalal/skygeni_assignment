// src/App.jsx
import { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import PipelineChart from './components/PipelineChart';
import PipelineTable from './components/PipelineTable';

function App() {
  const [pipelineData, setPipelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        // Fetch data from the backend API
        const response = await fetch('http://localhost:5000/api/pipeline-data');
        if (!response.ok) {
          throw new Error('Failed to fetch pipeline data');
        }
        const result = await response.json();
        setPipelineData(result.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPipelineData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  // Calculate win rates
  const suspectData = pipelineData.find(item => item.label === "Suspect");
  const wonData = pipelineData.find(item => item.label === "Won");
  
  const winRateByCount = Math.round((wonData.count / suspectData.count) * 100);
  const winRateByACV = Math.round((wonData.acv / suspectData.acv) * 100);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Win Rate by Count */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Win Rate by opportunity count: {winRateByCount}%
            </Typography>
            <PipelineChart 
              data={pipelineData} 
              valueType="count" 
            />
            <PipelineTable 
              data={pipelineData} 
              valueType="count" 
            />
          </Paper>
        </Grid>
        
        {/* Win Rate by ACV */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Win Rate by ACV: {winRateByACV}%
            </Typography>
            <PipelineChart 
              data={pipelineData} 
              valueType="acv" 
            />
            <PipelineTable 
              data={pipelineData} 
              valueType="acv" 
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;