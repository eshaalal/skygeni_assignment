import { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Tabs, Tab, Divider } from '@mui/material';
import PipelineChart from './components/PipelineChart';
import PipelineTable from './components/PipelineTable';
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

  // Smaller chart height
  const chartHeight = 150;
  const tableHeight = 230;

  return (
    <Container maxWidth="xl" className="pipeline-container" sx={{ py: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="pipeline tabs">
          <Tab label="SUMMARY" />
          <Tab label="WHAT-IF" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          {/* Count-based card */}
          <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                Win Rate by opportunity count: {winRateByCount}%
              </Typography>
              <Box className="chart-container" sx={{ height: `${chartHeight}px` }}>
                <PipelineChart 
                  data={pipelineData} 
                  valueType="count" 
                />
              </Box>
            </Paper>
            
            <Paper elevation={2} sx={{ p: 0, overflow: 'hidden' }}>
              <TableContainer sx={{ height: `${tableHeight}px`, p: 0, m: 0 }}>
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
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                Win Rate by ACV: {winRateByACV}%
              </Typography>
              <Box className="chart-container" sx={{ height: `${chartHeight}px` }}>
                <PipelineChart 
                  data={pipelineData} 
                  valueType="acv" 
                />
              </Box>
            </Paper>
            
            <Paper elevation={2} sx={{ p: 0, overflow: 'hidden' }}>
              <TableContainer sx={{ height: `${tableHeight}px`, p: 0, m: 0 }}>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Count-based detailed view */}
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
              Win Rate by opportunity count: {winRateByCount}%
            </Typography>
            <Box className="chart-container" sx={{ height: `${chartHeight}px` }}>
              <PipelineChart 
                data={pipelineData} 
                valueType="count" 
              />
            </Box>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 0, overflow: 'hidden', mb: 3 }}>
            <TableContainer sx={{ height: `${tableHeight}px`, p: 0, m: 0 }}>
              <PipelineTable 
                data={pipelineData} 
                valueType="count" 
              />
            </TableContainer>
          </Paper>
          
          {/* ACV-based detailed view */}
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
              Win Rate by ACV: {winRateByACV}%
            </Typography>
            <Box className="chart-container" sx={{ height: `${chartHeight}px` }}>
              <PipelineChart 
                data={pipelineData} 
                valueType="acv" 
              />
            </Box>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 0, overflow: 'hidden' }}>
            <TableContainer sx={{ height: `${tableHeight}px`, p: 0, m: 0 }}>
              <PipelineTable 
                data={pipelineData} 
                valueType="acv" 
              />
            </TableContainer>
          </Paper>
        </Box>
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
        width: '100%',
        p: 0,
        m: 0,
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