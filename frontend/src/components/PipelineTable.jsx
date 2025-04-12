// src/components/PipelineTable.jsx
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useTheme, useMediaQuery } from '@mui/material';

const PipelineTable = ({ data, valueType }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate lost/moved values
  const tableData = data.map((stage, index) => {
    // For the "Came to Stage" column
    const cameToStage = valueType === 'count' ? stage.count : stage.acv;
    
    // For the "Lost/Disqualified" column
    let lostValue = 0;
    if (index < data.length - 1) {
      const nextStage = data[index + 1];
      lostValue = cameToStage - (valueType === 'count' ? nextStage.count : nextStage.acv);
    }
    
    // For the "Moved to next stage" column
    let movedValue = 0;
    if (index < data.length - 1) {
      const nextStage = data[index + 1];
      movedValue = valueType === 'count' ? nextStage.count : nextStage.acv;
    }
    
    // For the "Win Rate %" column
    const winRate = stage.percentages.wonToStage[valueType];
    
    return {
      stage: stage.label,
      cameToStage: valueType === 'count' ? 
        cameToStage : 
        new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(cameToStage),
      lostValue: valueType === 'count' ? 
        lostValue : 
        new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(lostValue),
      movedValue: valueType === 'count' ? 
        movedValue : 
        new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(movedValue),
      winRate: `${winRate}%`
    };
  });

  // Calculate total lost
  const totalLost = data.reduce((total, stage, index) => {
    if (index < data.length - 1) {
      const nextStage = data[index + 1];
      return total + (valueType === 'count' ? 
        (stage.count - nextStage.count) : 
        (stage.acv - nextStage.acv));
    }
    return total;
  }, 0);

  return (
    <TableContainer component={Paper} sx={{ mt: 4, overflow: 'auto' }}>
      <Table size={isMobile ? "small" : "medium"}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>Stage</TableCell>
            <TableCell align="right">Came to Stage</TableCell>
            <TableCell align="right" sx={{ bgcolor: '#e57373' }}>Lost / Disqualified from Stage</TableCell>
            <TableCell align="right" sx={{ bgcolor: '#81c784' }}>Moved to next stage</TableCell>
            <TableCell align="right">Win Rate %</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row) => (
            <TableRow
              key={row.stage}
              sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                backgroundColor: row.stage === 'Won' ? '#81c784' : 'inherit'
              }}
            >
              <TableCell component="th" scope="row">{row.stage}</TableCell>
              <TableCell align="right">{row.cameToStage}</TableCell>
              <TableCell align="right">{row.stage === 'Won' ? '-' : row.lostValue}</TableCell>
              <TableCell align="right">{row.stage === 'Won' ? '-' : row.movedValue}</TableCell>
              <TableCell align="right">{row.winRate}</TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>Total</TableCell>
            <TableCell align="right">-</TableCell>
            <TableCell align="right">
              {valueType === 'count' ? 
                totalLost : 
                new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(totalLost)}
            </TableCell>
            <TableCell align="right">-</TableCell>
            <TableCell align="right">-</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PipelineTable;