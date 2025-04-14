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
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';

const PipelineTable = ({ data, valueType, compact = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [copied, setCopied] = useState(false);

  // Process raw pipeline data into a format suitable for table display
  const tableData = data.map((stage, index) => {
    const cameToStage = valueType === 'count' ? stage.count : stage.acv;

    // Calculate lost value: current - next stage
    let lostValue = 0;
    if (index < data.length - 1) {
      const nextStage = data[index + 1];
      lostValue = cameToStage - (valueType === 'count' ? nextStage.count : nextStage.acv);
    }

    // Calculate moved value (same as next stage value)
    let movedValue = 0;
    if (index < data.length - 1) {
      const nextStage = data[index + 1];
      movedValue = valueType === 'count' ? nextStage.count : nextStage.acv;
    }

    // Win rate value for each stage
    const winRate = stage.percentages.wonToStage[valueType];

    return {
      stage: stage.label,
      cameToStage: valueType === 'count'
        ? cameToStage
        : new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(cameToStage),
      lostValue: valueType === 'count'
        ? lostValue
        : new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(lostValue),
      movedValue: valueType === 'count'
        ? movedValue
        : new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(movedValue),
      winRate: `${winRate}%`,
    };
  });

  // Calculate total lost value across all stages
  const totalLost = data.reduce((total, stage, index) => {
    if (index < data.length - 1) {
      const nextStage = data[index + 1];
      return total + (
        valueType === 'count'
          ? stage.count - nextStage.count
          : stage.acv - nextStage.acv
      );
    }
    return total;
  }, 0);

  // Define shared cell style, adaptable based on compact mode
  const cellStyle = {
    border: '1px solid #ddd',
    padding: compact ? '4px 8px' : undefined,
    fontSize: compact ? '0.8rem' : undefined,
  };

  // Copy table data to clipboard in a tab-separated format
  const copyToClipboard = () => {
    let tableText = 'Stage\tCame to Stage\tLost / Disqualified\tMoved to next\tWin Rate %\n';

    tableData.forEach((row) => {
      tableText += `${row.stage}\t${row.cameToStage}\t${row.stage === 'Won' ? '-' : row.lostValue}\t${row.stage === 'Won' ? '-' : row.movedValue}\t${row.winRate}\n`;
    });

    tableText += `Total\t-\t${valueType === 'count'
      ? totalLost
      : new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(totalLost)
    }\t-\t-`;

    navigator.clipboard.writeText(tableText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset "copied" state after 2 seconds
    });
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Floating copy icon at top-right */}
      <Box sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}>
        <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
          <IconButton 
            onClick={copyToClipboard} 
            size="small" 
            sx={{ padding: '2px', '& svg': { fontSize: '0.9rem' } }}
          >
            {copied ? <CheckIcon color="success" fontSize="inherit" /> : <ContentCopyIcon fontSize="inherit" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Table container with MUI Paper component */}
      <TableContainer 
        component={Paper} 
        sx={{
          overflow: 'auto',
          width: '100%',
          height: '100%',
          m: 0,
          p: 0,
          borderRadius: 0,
          boxShadow: 'none',
        }}
      >
        {/* Main table */}
        <Table
          size={compact || isMobile ? 'small' : 'medium'}
          sx={{
            tableLayout: 'fixed',
            width: '100%',
            m: 0,
            height: '100%',
          }}
        >
          {/* Table header */}
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

          {/* Table body with data rows */}
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
            
            {/* Total row at the bottom */}
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell align="right" sx={cellStyle}>Total</TableCell>
              <TableCell align="right" sx={cellStyle}>-</TableCell>
              <TableCell align="right" sx={cellStyle}>
                {valueType === 'count'
                  ? totalLost
                  : new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(totalLost)}
              </TableCell>
              <TableCell align="right" sx={cellStyle}>-</TableCell>
              <TableCell align="right" sx={cellStyle}>-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PipelineTable;
