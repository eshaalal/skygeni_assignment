// src/App.jsx
import { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import PipelineChart from './components/PipelineChart';
import PipelineTable from './components/PipelineTable';
import './App.css'; // Import the CSS

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
    <Container maxWidth="xl" className="pipeline-container">
      <Grid container spacing={4} direction="column">
        {/* Win Rate by Count */}
        <Grid item xs={12} className="pipeline-grid-item">
          <Paper elevation={3} className="pipeline-card" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Win Rate by opportunity count: {winRateByCount}%
            </Typography>
            <Box className="chart-container">
              <PipelineChart 
                data={pipelineData} 
                valueType="count" 
              />
            </Box>
            <Box className="table-container">
              <PipelineTable 
                data={pipelineData} 
                valueType="count" 
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Win Rate by ACV */}
        <Grid item xs={12} className="pipeline-grid-item">
          <Paper elevation={3} className="pipeline-card" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Win Rate by ACV: {winRateByACV}%
            </Typography>
            <Box className="chart-container">
              <PipelineChart 
                data={pipelineData} 
                valueType="acv" 
              />
            </Box>
            <Box className="table-container">
              <PipelineTable 
                data={pipelineData} 
                valueType="acv" 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;