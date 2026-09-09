'use client';

import { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MarkerType,
  Node,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

export interface PathwayStepInput {
  id: string;
  type: 'CURRENT_STATE' | 'MAJOR' | 'COURSE_MILESTONE' | 'CERTIFICATION' | 'INTERNSHIP' | 'CAREER_ENTRY';
  label: string;
  order: number;
}

const TYPE_COLOR: Record<PathwayStepInput['type'], string> = {
  CURRENT_STATE: '#241c14',
  MAJOR: '#7a1f2b',
  COURSE_MILESTONE: '#0a63c2',
  CERTIFICATION: '#c9a24b',
  INTERNSHIP: '#0f7ef2',
  CAREER_ENTRY: '#1c7a4d',
};

export default function PathwayGraph({
  steps,
  title,
}: {
  steps: PathwayStepInput[];
  title?: string;
}) {
  const { nodes, edges } = useMemo(() => {
    const sorted = [...steps].sort((a, b) => a.order - b.order);
    const nodes: Node[] = sorted.map((s, i) => ({
      id: s.id,
      position: { x: i * 220, y: (i % 2) * 90 },
      data: { label: s.label },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        border: `2px solid ${TYPE_COLOR[s.type]}`,
        borderRadius: 8,
        padding: 10,
        fontSize: 12,
        background: 'white',
        width: 190,
      },
    }));
    const edges: Edge[] = sorted.slice(1).map((s, i) => ({
      id: `e-${sorted[i].id}-${s.id}`,
      source: sorted[i].id,
      target: s.id,
      animated: s.type === 'CAREER_ENTRY',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#241c1466' },
    }));
    return { nodes, edges };
  }, [steps]);

  if (!steps.length) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-black/50 card">
        No pathway generated yet — pick a career recommendation to see its steps.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {title && <div className="border-b border-black/10 px-4 py-2 text-sm font-medium text-angkor-maroon">{title}</div>}
      <div style={{ height: 300 }}>
        <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
          <Background gap={16} color="#00000011" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
