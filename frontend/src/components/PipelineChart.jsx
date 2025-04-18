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

    // Set dimensions with increased margins for better readability
    const margin = { top: 20, right: 70, bottom: 20, left: 80 }; // Increased margins
    let width = svgRef.current.clientWidth - margin.left - margin.right;
    const barHeight = isMobile ? 24 : is4K ? 44 : 30; // Increased bar height
    const height = (barHeight + 12) * data.length; // Increased spacing

    // Create SVG with explicit viewBox for better scaling
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales with consistent padding
    const y = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, height])
      .padding(0.4);

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

    // Add stage labels (left side) - increased font size
    svg.selectAll('.stage-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'stage-label')
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('x', -12) // Moved slightly further left
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '11px' : is4K ? '16px' : '14px') // Increased font size
      .attr('font-weight', '500') // Added some weight to the font
      .attr('fill', '#333')
      .text(d => d.label);

    // Add value labels (centered on green bars) - increased font size
    svg.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('x', width / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '11px' : is4K ? '16px' : '14px') // Increased font size
      .attr('font-weight', 'bold') // Made the text bold
      .attr('fill', '#fff')
      .text(d => valueType === 'count' ? d.count : d.formattedACV);

    // Add percentage labels (right side) - increased font size
    svg.selectAll('.percentage-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'percentage-label')
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('x', width + 18) // Moved slightly further right
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '11px' : is4K ? '16px' : '14px') // Increased font size
      .attr('font-weight', '500') // Added some weight to the font
      .attr('fill', '#333')
      .text(d => {
        const percentage = valueType === 'count' ? 
          d.percentages.wonToStage.count : 
          d.percentages.wonToStage.acv;
        return `${percentage}%`;
      });

    // Add transition percentage labels with consistent spacing
    const transitionGap = (y.bandwidth() + y.step() * (1 - y.paddingInner())) / 2;
    
    svg.selectAll('.transition-label')
      .data(data.slice(0, -1))
      .enter()
      .append('text')
      .attr('class', 'transition-label')
      .attr('y', (d, i) => {
        const currentY = y(d.label);
        const nextY = y(data[i + 1].label);
        return currentY + y.bandwidth() + (nextY - (currentY + y.bandwidth())) / 2;
      })
      .attr('x', width / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', isMobile ? '10px' : is4K ? '14px' : '12px') // Increased font size
      .attr('font-weight', 'bold')
      .attr('fill', '#000')
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

    // Ensure all rows have consistent spacing
    const lastItemY = y(data[data.length - 1].label);
    const lastItemHeight = y.bandwidth();
    const bottomBuffer = svg.append('rect')
      .attr('width', 0)
      .attr('height', 0)
      .attr('y', lastItemY + lastItemHeight + transitionGap)
      .attr('opacity', 0);

  }, [data, valueType, isMobile, is4K]);

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      overflow: 'hidden', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '200px' // Added minimum height to ensure proper rendering
    }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </Box>
  );
};

export default PipelineChart;