import { useRef, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import * as d3 from 'd3';

const PipelineChart = ({ data, valueType }) => {
  const svgRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const is4K = useMediaQuery('(min-width:3840px)');

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear any existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set dimensions
    const margin = { top: 20, right: 100, bottom: 30, left: 100 };
    let width = svgRef.current.clientWidth - margin.left - margin.right;
    const barHeight = isMobile ? 25 : is4K ? 50 : 35;
    const height = (barHeight + 10) * data.length;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales
    const y = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, height])
      .padding(0.3);

    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

    // Helper function to format values
    const formatValue = (value, type) => {
      if (type === 'acv') {
        return `$${Math.round(value).toLocaleString()}`;
      }
      return Math.round(value);
    };

    // Draw background bars (gray bars)
    svg.selectAll('.background-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'background-bar')
      .attr('y', d => y(d.label))
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', width)
      .attr('fill', '#e0e0e0');

    // Draw the green bars (foreground)
    svg.selectAll('.foreground-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'foreground-bar')
      .attr('y', d => y(d.label))
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', d => {
        // Calculate the width based on the diffRate or diffacvRate
        const ratio = valueType === 'count' ? 
          d.percentages.stageToSuspect.count / 100 : 
          d.percentages.stageToSuspect.acv / 100;
        return x(ratio);
      })
      .attr('fill', '#8bc34a');

    // Add stage labels
    svg.selectAll('.stage-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'stage-label')
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('x', -10)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '12px' : is4K ? '18px' : '14px')
      .attr('fill', '#333')
      .text(d => d.label);

    // Add value labels inside bars
    svg.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('x', d => {
        const ratio = valueType === 'count' ? 
          d.percentages.stageToSuspect.count / 100 : 
          d.percentages.stageToSuspect.acv / 100;
        const xPos = x(ratio) / 2;
        return Math.max(xPos, 30); // Ensure label is visible
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '12px' : is4K ? '18px' : '14px')
      .attr('fill', '#fff')
      .text(d => valueType === 'count' ? d.count : d.formattedACV);

    // Add percentage labels on right side
    svg.selectAll('.percentage-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'percentage-label')
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('x', width + 20)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '12px' : is4K ? '18px' : '14px')
      .attr('fill', '#333')
      .text(d => {
        // Show Win Rate percentages
        const percentage = valueType === 'count' ? 
          d.percentages.wonToStage.count : 
          d.percentages.wonToStage.acv;
        return `${percentage}%`;
      });

    // Add percentage labels between bars for transition rates
    svg.selectAll('.transition-label')
      .data(data.slice(0, -1)) // Skip the last item (Won)
      .enter()
      .append('text')
      .attr('class', 'transition-label')
      .attr('y', (d, i) => {
        // Position vertically between current bar and next bar
        const currentBarBottom = y(d.label) + y.bandwidth();
        const nextBarTop = i < data.length - 1 ? y(data[i + 1].label) : height;
        return (currentBarBottom + nextBarTop) / 2; // Middle point between bars
      })
      .attr('x', d => width / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '10px' : is4K ? '16px' : '12px')
      .attr('fill', '#666')
      .text((d, i) => {
        // Calculate the percentage to the next stage
        if (i < data.length - 1) {
          const nextStage = data[i + 1];
          const percentage = valueType === 'count' ? 
            Math.round((nextStage.count / d.count) * 100) : 
            Math.round((nextStage.acv / d.acv) * 100);
          return `${percentage}%`;
        }
        return '';
      });

  }, [data, valueType, isMobile, is4K]);

  return (
    <Box sx={{ width: '100%', height: 'auto', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

export default PipelineChart;