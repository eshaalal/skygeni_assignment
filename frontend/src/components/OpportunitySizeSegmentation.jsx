// OpportunitySizeSegmentation.jsx
import { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Slider, 
  FormControlLabel, 
  Switch,
  Grid, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tooltip,
  Alert
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const OpportunitySizeSegmentation = ({ pipelineData }) => {
  // Default boundaries for deal size categories
  const [sizeBoundaries, setSizeBoundaries] = useState([10000, 50000, 100000]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [focusStage, setFocusStage] = useState('all');
  const [sortMetric, setSortMetric] = useState('winRate');

  // Compute size categories based on boundaries
  const sizeCategories = useMemo(() => {
    return [
      { name: 'Small', min: 0, max: sizeBoundaries[0] },
      { name: 'Medium', min: sizeBoundaries[0], max: sizeBoundaries[1] },
      { name: 'Large', min: sizeBoundaries[1], max: sizeBoundaries[2] },
      { name: 'Enterprise', min: sizeBoundaries[2], max: Infinity }
    ];
  }, [sizeBoundaries]);

  // Helper function to determine size category for a deal
  const getDealSizeCategory = (dealSize) => {
    if (dealSize < sizeBoundaries[0]) return 'Small';
    if (dealSize < sizeBoundaries[1]) return 'Medium';
    if (dealSize < sizeBoundaries[2]) return 'Large';
    return 'Enterprise';
  };

  // Mock deal data since we don't have individual deals in our example
  // In a real implementation, this would come from your API
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    // Generate mock deals based on the pipeline data
    // In a real app, you'd fetch this from your API
    const mockDeals = [];
    const stages = pipelineData.map(stage => stage.label);

    // For each stage, generate deals that match the aggregated counts/acv
    pipelineData.forEach(stage => {
      const avgDealSize = stage.acv / stage.count;
      
      // Create deals with different sizes that average out to match the stage's data
      for (let i = 0; i < stage.count; i++) {
        // Vary the deal sizes with some randomness
        const varianceFactor = 0.5 + Math.random(); // between 0.5 and 1.5
        const dealSize = avgDealSize * varianceFactor;
        
        mockDeals.push({
          id: `deal-${stage.label}-${i}`,
          name: `Opportunity ${stage.label}-${i}`,
          stage: stage.label,
          amount: dealSize,
          sizeCategory: getDealSizeCategory(dealSize),
          // If it's in Won stage, it's won; if in Lost, it's lost; otherwise it's active
          status: stage.label === 'Won' ? 'won' : (stage.label === 'Lost' ? 'lost' : 'active')
        });
      }
    });

    setDeals(mockDeals);
  }, [pipelineData, sizeBoundaries]);

  // Calculate aggregated metrics by size category
  const categorySummary = useMemo(() => {
    const summary = {};
    
    // Initialize categories
    sizeCategories.forEach(category => {
      summary[category.name] = {
        totalCount: 0,
        totalAmount: 0,
        stageBreakdown: {},
        wonCount: 0,
        wonAmount: 0,
        winRate: 0,
        averageDealSize: 0
      };
      
      // Initialize stage breakdown for each category
      pipelineData.forEach(stage => {
        summary[category.name].stageBreakdown[stage.label] = {
          count: 0,
          amount: 0
        };
      });
    });
    
    // Process each deal
    deals.forEach(deal => {
      const category = deal.sizeCategory;
      summary[category].totalCount += 1;
      summary[category].totalAmount += deal.amount;
      
      // Update stage breakdown
      if (summary[category].stageBreakdown[deal.stage]) {
        summary[category].stageBreakdown[deal.stage].count += 1;
        summary[category].stageBreakdown[deal.stage].amount += deal.amount;
      }
      
      // Track won deals
      if (deal.status === 'won') {
        summary[category].wonCount += 1;
        summary[category].wonAmount += deal.amount;
      }
    });
    
    // Calculate derived metrics
    Object.keys(summary).forEach(category => {
      const s = summary[category];
      
      // Calculate win rate
      const enteredSalesCycle = Object.keys(s.stageBreakdown)
        .filter(stage => stage !== 'Won' && stage !== 'Lost')
        .reduce((sum, stage) => sum + s.stageBreakdown[stage].count, 0) + s.wonCount + (s.stageBreakdown['Lost']?.count || 0);
      
      s.winRate = enteredSalesCycle > 0 ? (s.wonCount / enteredSalesCycle) * 100 : 0;
      s.averageDealSize = s.totalCount > 0 ? s.totalAmount / s.totalCount : 0;
    });
    
    return summary;
  }, [deals, sizeCategories, pipelineData]);

  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (focusStage === 'all') {
      return Object.keys(categorySummary).map(category => ({
        name: category,
        'Win Rate (%)': Math.round(categorySummary[category].winRate),
        'Avg. Deal Size': Math.round(categorySummary[category].averageDealSize),
        'Total Value': Math.round(categorySummary[category].totalAmount),
        'Deal Count': categorySummary[category].totalCount
      }));
    } else {
      return Object.keys(categorySummary).map(category => {
        const stageData = categorySummary[category].stageBreakdown[focusStage] || { count: 0, amount: 0 };
        return {
          name: category,
          'Win Rate (%)': Math.round(categorySummary[category].winRate),
          'Avg. Deal Size': stageData.count > 0 ? Math.round(stageData.amount / stageData.count) : 0,
          'Total Value': Math.round(stageData.amount),
          'Deal Count': stageData.count
        };
      });
    }
  }, [categorySummary, focusStage]);

  // Sorted chart data for the table
  const sortedTableData = useMemo(() => {
    const metrics = {
      winRate: 'Win Rate (%)',
      avgDealSize: 'Avg. Deal Size',
      totalValue: 'Total Value',
      dealCount: 'Deal Count'
    };
    
    return [...chartData].sort((a, b) => b[metrics[sortMetric]] - a[metrics[sortMetric]]);
  }, [chartData, sortMetric]);

  // Generate recommendations based on the data
  const recommendations = useMemo(() => {
    const results = [];
    
    // Find highest win rate category
    const highestWinRateCategory = [...chartData]
      .sort((a, b) => b['Win Rate (%)'] - a['Win Rate (%)'])[0];
    
    if (highestWinRateCategory) {
      results.push({
        type: 'primary',
        message: `Focus on ${highestWinRateCategory.name} deals which have the highest win rate of ${highestWinRateCategory['Win Rate (%)']}%.`
      });
    }
    
    // Find highest value category
    const highestValueCategory = [...chartData]
      .sort((a, b) => b['Total Value'] - a['Total Value'])[0];
    
    if (highestValueCategory && highestValueCategory.name !== highestWinRateCategory?.name) {
      results.push({
        type: 'secondary',
        message: `${highestValueCategory.name} deals represent your highest value segment with $${new Intl.NumberFormat('en-US').format(Math.round(highestValueCategory['Total Value']))}.`
      });
    }
    
    // Find underperforming but high potential category
    const potentialCategory = [...chartData]
      .filter(c => c['Win Rate (%)'] < (highestWinRateCategory?.['Win Rate (%)'] || 0) * 0.7)
      .sort((a, b) => b['Avg. Deal Size'] - a['Avg. Deal Size'])[0];
    
    if (potentialCategory) {
      results.push({
        type: 'info',
        message: `Improving win rates for ${potentialCategory.name} deals could yield significant value due to their high average size of $${new Intl.NumberFormat('en-US').format(Math.round(potentialCategory['Avg. Deal Size']))}.`
      });
    }
    
    return results;
  }, [chartData]);

  // Handler for boundary changes
  const handleBoundaryChange = (index, newValue) => {
    const newBoundaries = [...sizeBoundaries];
    newBoundaries[index] = newValue;
    setSizeBoundaries(newBoundaries);
  };

  // Colors for the chart
  const categoryColors = {
    'Small': '#4fc3f7',
    'Medium': '#4db6ac',
    'Large': '#7986cb',
    'Enterprise': '#9575cd'
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Opportunity Size Segmentation Analysis
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Deal Size Category Boundaries
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" gutterBottom>
              Small: $0 - ${new Intl.NumberFormat('en-US').format(sizeBoundaries[0])}
            </Typography>
            <Slider
              value={sizeBoundaries[0]}
              min={1000}
              max={100000}
              step={1000}
              onChange={(e, value) => handleBoundaryChange(0, value)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${new Intl.NumberFormat('en-US').format(value)}`}
              aria-labelledby="small-deal-boundary-slider"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" gutterBottom>
              Medium: ${new Intl.NumberFormat('en-US').format(sizeBoundaries[0])} - ${new Intl.NumberFormat('en-US').format(sizeBoundaries[1])}
            </Typography>
            <Slider
              value={sizeBoundaries[1]}
              min={sizeBoundaries[0] + 1000}
              max={250000}
              step={5000}
              onChange={(e, value) => handleBoundaryChange(1, value)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${new Intl.NumberFormat('en-US').format(value)}`}
              aria-labelledby="medium-deal-boundary-slider"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" gutterBottom>
              Large: ${new Intl.NumberFormat('en-US').format(sizeBoundaries[1])} - ${new Intl.NumberFormat('en-US').format(sizeBoundaries[2])}
            </Typography>
            <Slider
              value={sizeBoundaries[2]}
              min={sizeBoundaries[1] + 5000}
              max={1000000}
              step={10000}
              onChange={(e, value) => handleBoundaryChange(2, value)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${new Intl.NumberFormat('en-US').format(value)}`}
              aria-labelledby="large-deal-boundary-slider"
            />
          </Grid>
        </Grid>
        
        <Typography variant="body2" gutterBottom>
          Enterprise: ${new Intl.NumberFormat('en-US').format(sizeBoundaries[2])}+
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showAdvancedSettings}
                onChange={(e) => setShowAdvancedSettings(e.target.checked)}
                name="showAdvancedSettings"
              />
            }
            label="Show Advanced Settings"
          />
        </Box>
        
        {showAdvancedSettings && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="focus-stage-label">Focus Stage</InputLabel>
                  <Select
                    labelId="focus-stage-label"
                    value={focusStage}
                    label="Focus Stage"
                    onChange={(e) => setFocusStage(e.target.value)}
                  >
                    <MenuItem value="all">All Stages</MenuItem>
                    {pipelineData.map((stage) => (
                      <MenuItem key={stage.label} value={stage.label}>
                        {stage.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="sort-metric-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-metric-label"
                    value={sortMetric}
                    label="Sort By"
                    onChange={(e) => setSortMetric(e.target.value)}
                  >
                    <MenuItem value="winRate">Win Rate</MenuItem>
                    <MenuItem value="avgDealSize">Average Deal Size</MenuItem>
                    <MenuItem value="totalValue">Total Value</MenuItem>
                    <MenuItem value="dealCount">Deal Count</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      <Grid container spacing={3}>
        {/* Chart section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, mb: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Deal Size Performance Analysis
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {focusStage === 'all' 
                ? 'Comparing performance metrics across all deal size categories' 
                : `Comparing performance metrics for the "${focusStage}" stage by deal size category`}
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="Win Rate (%)" 
                    fill="#8884d8"
                    name="Win Rate (%)"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[entry.name]} />
                    ))}
                  </Bar>
                  <Bar 
                    yAxisId="right" 
                    dataKey="Deal Count" 
                    fill="#82ca9d"
                    name="Deal Count"
                    opacity={0.7}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recommendations section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, mb: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Strategic Recommendations
            </Typography>
            <Box sx={{ mt: 2 }}>
              {recommendations.map((rec, index) => (
                <Alert 
                  key={index} 
                  severity={rec.type === 'primary' ? 'success' : (rec.type === 'secondary' ? 'warning' : 'info')}
                  sx={{ mb: 2 }}
                >
                  {rec.message}
                </Alert>
              ))}
              
              {recommendations.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  Adjust the deal size boundaries to generate strategic recommendations.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Detailed table */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 0, mb: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Deal Size Category Performance
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Size Category</TableCell>
                    <TableCell align="right">Deal Count</TableCell>
                    <TableCell align="right">Avg. Deal Size ($)</TableCell>
                    <TableCell align="right">Total Value ($)</TableCell>
                    <TableCell align="right">Win Rate (%)</TableCell>
                    <TableCell align="right">Priority</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedTableData.map((row) => (
                    <TableRow key={row.name} hover>
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ 
                          borderLeft: `4px solid ${categoryColors[row.name]}`,
                          fontWeight: sortedTableData[0].name === row.name ? 'bold' : 'normal'
                        }}
                      >
                        {row.name}
                      </TableCell>
                      <TableCell align="right">{row['Deal Count']}</TableCell>
                      <TableCell align="right">
                        ${new Intl.NumberFormat('en-US').format(row['Avg. Deal Size'])}
                      </TableCell>
                      <TableCell align="right">
                        ${new Intl.NumberFormat('en-US').format(row['Total Value'])}
                      </TableCell>
                      <TableCell align="right">{row['Win Rate (%)'].toFixed(1)}%</TableCell>
                      <TableCell align="right">
                        {sortedTableData.findIndex(r => r.name === row.name) + 1}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OpportunitySizeSegmentation;