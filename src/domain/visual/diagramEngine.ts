import { DiagramSpec, DiagramNode, DiagramEdge } from './visualTypes';

export function createDefaultDiagramSpec(type: DiagramSpec['diagramType']): DiagramSpec {
  if (type === 'flowchart') {
    return {
      diagramType: 'flowchart',
      title: 'Technical Logic Flow',
      nodes: [
        { id: 'n1', label: 'Start Process', type: 'start_end', x: 200, y: 30, width: 140, height: 40, bgColor: '#345CFF', textColor: '#FFFFFF' },
        { id: 'n2', label: 'Validate Input Payload', type: 'process', x: 200, y: 110, width: 160, height: 50, bgColor: '#101F37', textColor: '#FFFFFF' },
        { id: 'n3', label: 'Authorization Check?', type: 'decision', x: 200, y: 200, width: 160, height: 60, bgColor: '#E9BC72', textColor: '#081629' },
        { id: 'n4', label: 'Execute System Core', type: 'system', x: 200, y: 300, width: 160, height: 50, bgColor: '#16C8BA', textColor: '#081629' },
        { id: 'n5', label: 'End / Return Output', type: 'start_end', x: 200, y: 390, width: 140, height: 40, bgColor: '#345CFF', textColor: '#FFFFFF' },
      ],
      edges: [
        { id: 'e1', sourceId: 'n1', targetId: 'n2', label: 'Initiate' },
        { id: 'e2', sourceId: 'n2', targetId: 'n3', label: 'Valid' },
        { id: 'e3', sourceId: 'n3', targetId: 'n4', label: 'Authorized' },
        { id: 'e4', sourceId: 'n4', targetId: 'n5', label: 'Complete' },
      ],
    };
  }

  if (type === 'hierarchy') {
    return {
      diagramType: 'hierarchy',
      title: 'Editorial System Hierarchy',
      nodes: [
        { id: 'h1', label: 'Book Master Brain', type: 'system', x: 250, y: 30, width: 180, height: 50, bgColor: '#345CFF', textColor: '#FFFFFF' },
        { id: 'h2', label: 'E1 Book Intelligence', type: 'process', x: 100, y: 130, width: 150, height: 45, bgColor: '#101F37', textColor: '#FFFFFF' },
        { id: 'h3', label: 'E2 Manuscript Factory', type: 'process', x: 260, y: 130, width: 150, height: 45, bgColor: '#101F37', textColor: '#FFFFFF' },
        { id: 'h4', label: 'E3 Visual Production', type: 'process', x: 420, y: 130, width: 150, height: 45, bgColor: '#16C8BA', textColor: '#081629' },
      ],
      edges: [
        { id: 'eh1', sourceId: 'h1', targetId: 'h2' },
        { id: 'eh2', sourceId: 'h1', targetId: 'h3' },
        { id: 'eh3', sourceId: 'h1', targetId: 'h4' },
      ],
    };
  }

  // Default Architecture Diagram
  return {
    diagramType: 'architecture',
    title: 'Enterprise Architecture Overview',
    nodes: [
      { id: 'a1', label: 'Client Workspace (React 19)', type: 'system', x: 80, y: 60, width: 180, height: 50, bgColor: '#101F37', textColor: '#FFFFFF' },
      { id: 'a2', label: 'IndexedDB Offline Cache', type: 'database', x: 80, y: 160, width: 180, height: 50, bgColor: '#345CFF', textColor: '#FFFFFF' },
      { id: 'a3', label: 'Express Security Gate API', type: 'process', x: 340, y: 60, width: 180, height: 50, bgColor: '#16C8BA', textColor: '#081629' },
      { id: 'a4', label: 'Gemini 3.8 Flash Engine', type: 'system', x: 340, y: 160, width: 180, height: 50, bgColor: '#E9BC72', textColor: '#081629' },
    ],
    edges: [
      { id: 'ea1', sourceId: 'a1', targetId: 'a2', label: 'Local Persistence' },
      { id: 'ea2', sourceId: 'a1', targetId: 'a3', label: 'Default Deny Proxy' },
      { id: 'ea3', sourceId: 'a3', targetId: 'a4', label: 'Authorized Token' },
    ],
  };
}

export function generateDiagramSVG(spec: DiagramSpec, width = 640, height = 480): string {
  const nodeMap = new Map<string, DiagramNode>();
  spec.nodes.forEach((n) => nodeMap.set(n.id, n));

  const edgesMarkup = spec.edges
    .map((edge) => {
      const source = nodeMap.get(edge.sourceId);
      const target = nodeMap.get(edge.targetId);
      if (!source || !target) return '';

      const x1 = source.x + source.width / 2;
      const y1 = source.y + source.height / 2;
      const x2 = target.x + target.width / 2;
      const y2 = target.y + target.height / 2;

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      return `<g>
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#345CFF" stroke-width="2" stroke-dasharray="${edge.lineStyle === 'dashed' ? '5,5' : 'none'}" marker-end="url(#arrowhead)" />
        ${
          edge.label
            ? `<rect x="${midX - 35}" y="${midY - 10}" width="70" height="18" fill="#FFFFFF" rx="3" stroke="#CBD5E1" stroke-width="0.5"/>
               <text x="${midX}" y="${midY + 3}" text-anchor="middle" fill="#081629" font-family="sans-serif" font-size="9" font-weight="bold">${escapeXml(edge.label)}</text>`
            : ''
        }
      </g>`;
    })
    .join('\n');

  const nodesMarkup = spec.nodes
    .map((node) => {
      const rx = node.type === 'start_end' ? 20 : node.type === 'decision' ? 8 : 4;
      const stroke = node.type === 'database' ? '#E9BC72' : '#345CFF';

      return `<g transform="translate(${node.x}, ${node.y})">
        <rect width="${node.width}" height="${node.height}" rx="${rx}" fill="${node.bgColor || '#101F37'}" stroke="${stroke}" stroke-width="1.5" />
        <text x="${node.width / 2}" y="${node.height / 2 + 4}" text-anchor="middle" fill="${node.textColor || '#FFFFFF'}" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="600">
          ${escapeXml(node.label)}
        </text>
      </g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#345CFF" />
    </marker>
  </defs>

  <rect width="${width}" height="${height}" fill="#F8FAFC" rx="8" />
  <rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="none" stroke="#E2E8F0" stroke-width="1" rx="6" />

  <!-- Diagram Title -->
  <text x="25" y="35" fill="#081629" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="bold">
    ${escapeXml(spec.title)}
  </text>

  <!-- Edges & Connections -->
  ${edgesMarkup}

  <!-- Nodes -->
  ${nodesMarkup}
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
