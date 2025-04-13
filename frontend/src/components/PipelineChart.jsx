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
    const margin = { top: 0, right: 60, bottom: 0, left: 70 };
    let width = svgRef.current.clientWidth - margin.left - margin.right;
    const barHeight = isMobile ? 20 : is4K ? 40 : 25;
    const height = (barHeight + 5) * data.length;

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

    // Draw background bars (full width gray bars)
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

    // Draw centered green bars
    svg.selectAll('.foreground-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'foreground-bar')
      .attr('y', d => y(d.label))
      .attr('height', y.bandwidth())
      .attr('x', d => {
        const ratio = valueType === 'count' ? 
          d.percentages.stageToSuspect.count / 100 : 
          d.percentages.stageToSuspect.acv / 100;
        return (width - x(ratio)) / 2; // Center the bar
      })
      .attr('width', d => {
        const ratio = valueType === 'count' ? 
          d.percentages.stageToSuspect.count / 100 : 
          d.percentages.stageToSuspect.acv / 100;
        return x(ratio);
      })
      .attr('fill', '#8bc34a');

    // Add stage labels (left side)
    svg.selectAll('.stage-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'stage-label')
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('x', -10)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '10px' : is4K ? '14px' : '12px')
      .attr('fill', '#333')
      .text(d => d.label);

    // Add value labels (centered on green bars)
    svg.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('x', width / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '10px' : is4K ? '14px' : '12px')
      .attr('fill', '#fff')
      .text(d => valueType === 'count' ? d.count : d.formattedACV);

    // Add percentage labels (right side)
    svg.selectAll('.percentage-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'percentage-label')
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('x', width + 15)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '10px' : is4K ? '14px' : '12px')
      .attr('fill', '#333')
      .text(d => {
        const percentage = valueType === 'count' ? 
          d.percentages.wonToStage.count : 
          d.percentages.wonToStage.acv;
        return `${percentage}%`;
      });

    // Add transition percentage labels between bars
    svg.selectAll('.transition-label')
      .data(data.slice(0, -1))
      .enter()
      .append('text')
      .attr('class', 'transition-label')
      .attr('y', (d, i) => {
        const currentBarBottom = y(d.label) + y.bandwidth();
        const nextBarTop = i < data.length - 1 ? y(data[i + 1].label) : height;
        return (currentBarBottom + nextBarTop) / 2;
      })
      .attr('x', width / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '8px' : is4K ? '12px' : '10px')
      .attr('fill', '#666')
      .text((d, i) => {
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