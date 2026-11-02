import { ChartSpec } from './visualTypes';

export function createDefaultChartSpec(type: ChartSpec['chartType']): ChartSpec {
  if (type === 'pie') {
    return {
      chartType: 'pie',
      title: 'Global Translation Distribution',
      xAxisLabel: 'Languages',
      yAxisLabel: 'Share (%)',
      unit: '%',
      sourceCitation: 'UNESCO Index Translationum Editorial Database 2026',
      dataPoints: [
        { label: 'English Source', value: 48, color: '#345CFF' },
        { label: 'Spanish Source', value: 26, color: '#16C8BA' },
        { label: 'French Source', value: 16, color: '#E9BC72' },
        { label: 'Other Sources', value: 10, color: '#101F37' },
      ],
    };
  }

  if (type === 'line' || type === 'time_series') {
    return {
      chartType: 'line',
      title: 'Author Manuscript Production Velocity',
      xAxisLabel: 'Production Weeks',
      yAxisLabel: 'Pages Written',
      unit: 'pages',
      sourceCitation: 'EditorynIQ™ Internal Production Logs 2026',
      dataPoints: [
        { label: 'W1', value: 12, color: '#345CFF' },
        { label: 'W2', value: 28, color: '#345CFF' },
        { label: 'W3', value: 54, color: '#345CFF' },
        { label: 'W4', value: 92, color: '#16C8BA' },
        { label: 'W5', value: 140, color: '#16C8BA' },
        { label: 'W6', value: 210, color: '#E9BC72' },
      ],
    };
  }

  // Default Bar / Comparative
  return {
    chartType: 'bar',
    title: 'Editorial Reader Engagement Benchmark',
    xAxisLabel: 'Content Genre',
    yAxisLabel: 'Completion Rate (%)',
    unit: '%',
    sourceCitation: 'Enterprise Publishing Guild Annual Report 2026',
    dataPoints: [
      { label: 'Non-Fiction Tech', value: 84, color: '#345CFF' },
      { label: 'Business Strategy', value: 78, color: '#16C8BA' },
      { label: 'Scientific Guides', value: 91, color: '#E9BC72' },
      { label: 'Literary Prose', value: 72, color: '#101F37' },
    ],
  };
}

export function validateChartData(spec: ChartSpec): { valid: boolean; error?: string } {
  if (!spec.dataPoints || spec.dataPoints.length === 0) {
    return { valid: false, error: 'Chart must contain at least one data point.' };
  }

  for (const p of spec.dataPoints) {
    if (typeof p.value !== 'number' || isNaN(p.value)) {
      return { valid: false, error: `Invalid numeric value for data point "${p.label}".` };
    }
  }

  return { valid: true };
}

export function generateChartSVG(spec: ChartSpec, width = 600, height = 360): string {
  const points = spec.dataPoints || [];
  const maxVal = Math.max(...points.map((p) => p.value), 10);

  if (spec.chartType === 'pie') {
    // Render Donut / Pie Chart
    const total = points.reduce((acc, p) => acc + Math.max(0, p.value), 0) || 1;
    const cx = 180;
    const cy = 180;
    const radius = 100;
    let startAngle = 0;

    const slices = points.map((p) => {
      const sliceAngle = (p.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      startAngle = endAngle;
      return `<path d="${pathData}" fill="${p.color || '#345CFF'}" stroke="#FFFFFF" stroke-width="2"/>`;
    });

    const legends = points.map((p, i) => {
      const ly = 80 + i * 28;
      const pct = Math.round((p.value / total) * 100);
      return `<g transform="translate(340, ${ly})">
        <rect width="14" height="14" rx="3" fill="${p.color || '#345CFF'}" />
        <text x="22" y="12" fill="#081629" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="600">
          ${escapeXml(p.label)} (${pct}%)
        </text>
      </g>`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <rect width="${width}" height="${height}" fill="#FFFFFF" rx="8" />
      <text x="25" y="35" fill="#081629" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="bold">${escapeXml(
        spec.title
      )}</text>
      ${slices.join('\n')}
      ${legends.join('\n')}
      <text x="25" y="${height - 15}" fill="#64748B" font-family="sans-serif" font-size="9">Source: ${escapeXml(
      spec.sourceCitation
    )}</text>
    </svg>`;
  }

  if (spec.chartType === 'line' || spec.chartType === 'time_series') {
    // Line Chart
    const margin = { top: 60, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const coords = points.map((p, i) => {
      const x = margin.left + (i / Math.max(1, points.length - 1)) * chartWidth;
      const y = margin.top + chartHeight - (p.value / maxVal) * chartHeight;
      return { x, y, point: p };
    });

    const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');

    const ticks = [0, Math.round(maxVal / 2), maxVal].map((val) => {
      const y = margin.top + chartHeight - (val / maxVal) * chartHeight;
      return `<g>
        <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#F1F5F9" stroke-dasharray="3,3" />
        <text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" fill="#64748B" font-family="monospace" font-size="9">${val}</text>
      </g>`;
    });

    const xLabels = coords.map(
      (c) => `<text x="${c.x}" y="${height - margin.bottom + 20}" text-anchor="middle" fill="#64748B" font-family="sans-serif" font-size="10">${escapeXml(
        c.point.label
      )}</text>`
    );

    const dots = coords.map(
      (c) => `<circle cx="${c.x}" cy="${c.y}" r="5" fill="${c.point.color || '#345CFF'}" stroke="#FFFFFF" stroke-width="2" />
      <text x="${c.x}" y="${c.y - 10}" text-anchor="middle" fill="#081629" font-family="monospace" font-size="9" font-weight="bold">${c.point.value}${spec.unit}</text>`
    );

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <rect width="${width}" height="${height}" fill="#FFFFFF" rx="8" />
      <text x="25" y="35" fill="#081629" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="bold">${escapeXml(
        spec.title
      )}</text>
      ${ticks.join('\n')}
      <polyline points="${polylinePoints}" fill="none" stroke="#345CFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots.join('\n')}
      ${xLabels.join('\n')}
      <text x="25" y="${height - 15}" fill="#64748B" font-family="sans-serif" font-size="9">Source: ${escapeXml(
      spec.sourceCitation
    )}</text>
    </svg>`;
  }

  // Bar Chart
  const margin = { top: 60, right: 30, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const barWidth = Math.min(60, chartWidth / points.length - 20);

  const bars = points.map((p, i) => {
    const barHeight = (p.value / maxVal) * chartHeight;
    const x = margin.left + i * (chartWidth / points.length) + 10;
    const y = margin.top + chartHeight - barHeight;

    return `<g>
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${p.color || '#345CFF'}" rx="4" />
      <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" fill="#081629" font-family="monospace" font-size="10" font-weight="bold">${p.value}${spec.unit}</text>
      <text x="${x + barWidth / 2}" y="${height - margin.bottom + 20}" text-anchor="middle" fill="#64748B" font-family="sans-serif" font-size="10">${escapeXml(
      p.label
    )}</text>
    </g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <rect width="${width}" height="${height}" fill="#FFFFFF" rx="8" />
    <text x="25" y="35" fill="#081629" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="bold">${escapeXml(
      spec.title
    )}</text>
    <line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${width - margin.right}" y2="${margin.top + chartHeight}" stroke="#CBD5E1" stroke-width="1"/>
    ${bars.join('\n')}
    <text x="25" y="${height - 15}" fill="#64748B" font-family="sans-serif" font-size="9">Source: ${escapeXml(
    spec.sourceCitation
  )}</text>
  </svg>`;
}

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
