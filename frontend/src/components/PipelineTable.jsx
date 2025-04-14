// src/components/PipelineTable.jsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const PipelineTable = ({ data, valueType, compact = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const tableData = data.map((stage, index) => {
    const cameToStage = valueType === 'count' ? stage.count : stage.acv;

    let lostValue = 0;
    if (index < data.length - 1) {
      const nextStage = data[index + 1];
      lostValue =
        cameToStage -
        (valueType === 'count' ? nextStage.count : nextStage.acv);
    }

    let movedValue = 0;
    if (index < data.length - 1) {
      const nextStage = data[index + 1];
      movedValue =
        valueType === 'count' ? nextStage.count : nextStage.acv;
    }

    const winRate = stage.percentages.wonToStage[valueType];

    return {
      stage: stage.label,
      cameToStage:
        valueType === 'count'
          ? cameToStage
          : new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 0,
            }).format(cameToStage),
      lostValue:
        valueType === 'count'
          ? lostValue
          : new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 0,
            }).format(lostValue),
      movedValue:
        valueType === 'count'
          ? movedValue
          : new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 0,
            }).format(movedValue),
      winRate: `${winRate}%`,
    };
  });

  const totalLost = data.reduce((total, stage, index) => {
    if (index < data.length - 1) {
      const nextStage = data[index + 1];
      return (
        total +
        (valueType === 'count'
          ? stage.count - nextStage.count
          : stage.acv - nextStage.acv)
      );
    }
    return total;
  }, 0);

  const cellStyle = {
    border: '1px solid #ddd',
    padding: compact ? '4px 8px' : undefined,
    fontSize: compact ? '0.8rem' : undefined
  };

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        overflow: 'auto',
        width: '100%',
        height: '100%',
        m: 0,
        p: 0,
        borderRadius: 0,
        boxShadow: 'none'
      }}
    >
      <Table 
        size={compact || isMobile ? 'small' : 'medium'} 
        sx={{ 
          tableLayout: 'fixed',
          width: '100%',
          m: 0,
          height: '100%'
        }}
      >
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell align="center" sx={cellStyle}>Stage</TableCell>
            <TableCell align="center" sx={cellStyle}>Came to Stage</TableCell>
            <TableCell align="center" sx={{ ...cellStyle, bgcolor: '#e57373' }}>
              Lost / Disqualified
            </TableCell>
            <TableCell align="center" sx={{ ...cellStyle, bgcolor: '#81c784' }}>
              Moved to next
            </TableCell>
            <TableCell align="center" sx={cellStyle}>Win Rate %</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row) => (
            <TableRow
              key={row.stage}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                backgroundColor: row.stage === 'Won' ? '#81c784' : 'inherit',
              }}
            >
              <TableCell align="right" sx={cellStyle}>{row.stage}</TableCell>
              <TableCell align="right" sx={cellStyle}>{row.cameToStage}</TableCell>
              <TableCell align="right" sx={cellStyle}>
                {row.stage === 'Won' ? '-' : row.lostValue}
              </TableCell>
              <TableCell align="right" sx={cellStyle}>
                {row.stage === 'Won' ? '-' : row.movedValue}
              </TableCell>
              <TableCell align="right" sx={cellStyle}>{row.winRate}</TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell align="right" sx={cellStyle}>Total</TableCell>
            <TableCell align="right" sx={cellStyle}>-</TableCell>
            <TableCell align="right" sx={cellStyle}>
              {valueType === 'count'
                ? totalLost
                : new Intl.NumberFormat('en-US', {
                    maximumFractionDigits: 0,
                  }).format(totalLost)}
            </TableCell>
            <TableCell align="right" sx={cellStyle}>-</TableCell>
            <TableCell align="right" sx={cellStyle}>-</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PipelineTable;