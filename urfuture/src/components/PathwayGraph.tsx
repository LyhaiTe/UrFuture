'use client';

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
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

const TYPE_STYLES: Record<
  PathwayStepInput['type'],
  { border: string; bg: string; color: string }
> = {
  CURRENT_STATE: { border: '#00d2ff', bg: '#0b192e', color: '#38bdf8' },
  MAJOR: { border: '#10b981', bg: '#081d19', color: '#34d399' },
  COURSE_MILESTONE: { border: '#0284c7', bg: '#0c1b33', color: '#bae6fd' },
  CERTIFICATION: { border: '#f59e0b', bg: '#1f1606', color: '#fcd34d' },
  INTERNSHIP: { border: '#6366f1', bg: '#131433', color: '#c7d2fe' },
  CAREER_ENTRY: { border: '#00d2ff', bg: '#042233', color: '#67e8f9' },
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
    const nodes: Node[] = sorted.map((s, i) => {
      const style = TYPE_STYLES[s.type] || TYPE_STYLES.CURRENT_STATE;
      return {
        id: s.id,
        position: { x: i * 220, y: (i % 2) * 80 + 30 },
        data: { label: s.label },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          border: `1.5px solid ${style.border}`,
          borderRadius: 12,
          padding: '10px 14px',
          fontSize: 11,
          fontWeight: 600,
          background: style.bg,
          color: style.color,
          boxShadow: `0 0 15px ${style.border}22`,
          width: 180,
        },
      };
    });

    const edges: Edge[] = sorted.slice(1).map((s, i) => ({
      id: `e-${sorted[i].id}-${s.id}`,
      source: sorted[i].id,
      target: s.id,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#00d2ff' },
      style: { stroke: '#00d2ff88', strokeWidth: 1.5 },
    }));

    return { nodes, edges };
  }, [steps]);

  if (!steps.length) {
    return (
      <div className="card-dark p-6 flex flex-col items-center justify-center h-72 text-center border-[#1b2947] bg-[#0c1426]">
        <div className="w-10 h-10 rounded-xl bg-[#0d1e38] border border-[#1b3c66] flex items-center justify-center text-[#00d2ff] mb-2">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold text-white">Career Progression Graph</h4>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
          Select a career recommendation to plot your step-by-step academic & milestone pathway.
        </p>
      </div>
    );
  }

  return (
    <div className="card-dark overflow-hidden border-[#1b2947] bg-[#0c1426]">
      {title && (
        <div className="border-b border-[#1b2947] px-5 py-3 text-xs font-bold text-white flex items-center gap-2 bg-[#09101d]">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          {title}
        </div>
      )}
      <div style={{ height: 300 }} className="bg-[#080d19]">
        <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
          <Background gap={18} color="#182742" />
          <Controls showInteractive={false} className="bg-[#0c1426] border-[#1b2947] text-white" />
        </ReactFlow>
      </div>
    </div>
  );
}
