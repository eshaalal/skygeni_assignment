import { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Tabs, Tab, Divider } from '@mui/material';
import PipelineChart from './components/PipelineChart';
import PipelineTable from './components/PipelineTable';
import OpportunitySizeSegmentation from './components/OpportunitySizeSegmentation';
import './App.css';

function App() {
  const [pipelineData, setPipelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  const suspectData = pipelineData.find(item => item.label === "Suspect");
  const wonData = pipelineData.find(item => item.label === "Won");
  
  const winRateByCount = Math.round((wonData.count / suspectData.count) * 100);
  const winRateByACV = Math.round((wonData.acv / suspectData.acv) * 100);

  // Increased chart height
  const chartHeight = 220; // Increased from 150
  const tableHeight = 250; // Increased from 230

  return (
    <Container maxWidth="xl" className="pipeline-container" sx={{ py: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="pipeline tabs">
          <Tab label="SUMMARY" />
          <Tab label="WHAT-IF" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Count-based card */}
          <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}> {/* Increased padding */}
              <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem' }}> {/* Increased font and margin */}
                Win Rate by opportunity count: {winRateByCount}%
              </Typography>
              <Box className="chart-container" sx={{ height: `${chartHeight}px`, width: '100%' }}>
                <PipelineChart 
                  data={pipelineData} 
                  valueType="count" 
                />
              </Box>
            </Paper>
            
            <Paper elevation={2} sx={{ py: 2, overflow: 'hidden', mb: 4 }}>
              <TableContainer sx={{ height: `${tableHeight}px` }}>
                <PipelineTable 
                  data={pipelineData} 
                  valueType="count" 
                  compact={true}
                />
              </TableContainer>
            </Paper>
          </Box>
          
          {/* ACV-based card */}
          <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}> {/* Increased padding */}
              <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem' }}> {/* Increased font and margin */}
                Win Rate by ACV: {winRateByACV}%
              </Typography>
              <Box className="chart-container" sx={{ height: `${chartHeight}px`, width: '100%' }}>
                <PipelineChart 
                  data={pipelineData} 
                  valueType="acv" 
                />
              </Box>
            </Paper>
            
            <Paper elevation={2} sx={{ py: 2, overflow: 'hidden', mb: 4 }}>
              <TableContainer sx={{ height: `${tableHeight}px` }}>
                <PipelineTable 
                  data={pipelineData} 
                  valueType="acv" 
                  compact={true}
                />
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        <OpportunitySizeSegmentation pipelineData={pipelineData} />
      )}
    </Container>
  );
}

const TableContainer = ({ sx, children }) => {
  return (
    <Box 
      className="table-container" 
      sx={{ 
        ...sx, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#bdbdbd',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f5f5f5',
        }
      }}
    >
      {children}
    </Box>
  );
};

export default App;