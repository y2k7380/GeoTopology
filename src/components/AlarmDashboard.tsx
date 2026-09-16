import React from 'react';
import { AlertCircle, AlertTriangle, AlertOctagon, CheckCircle, Network, Activity } from 'lucide-react';
import type { NetworkNode, NetworkEdge, AlarmSeverity } from '../types/topology';

interface AlarmDashboardProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  filterSeverity: AlarmSeverity | 'ALL';
  onSelectFilter: (severity: AlarmSeverity | 'ALL') => void;
}

export const AlarmDashboard: React.FC<AlarmDashboardProps> = ({
  nodes,
  edges,
  filterSeverity,
  onSelectFilter,
}) => {
  const criticalNodes = nodes.filter(n => n.status === 'CRITICAL').length;
  const majorNodes = nodes.filter(n => n.status === 'MAJOR').length;
  const minorNodes = nodes.filter(n => n.status === 'MINOR').length;
  const normalNodes = nodes.filter(n => n.status === 'NORMAL').length;

  const downEdges = edges.filter(e => e.status === 'DOWN').length;
  const warningEdges = edges.filter(e => e.status === 'WARNING').length;

  const filterCards = [
    {
      id: 'ALL' as const,
      label: '전체 장비',
      count: nodes.length,
      icon: Network,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.15)',
      border: 'rgba(56, 189, 248, 0.4)',
    },
    {
      id: 'CRITICAL' as const,
      label: 'CRITICAL',
      count: criticalNodes,
      icon: AlertOctagon,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      pulse: criticalNodes > 0,
    },
    {
      id: 'MAJOR' as const,
      label: 'MAJOR',
      count: majorNodes,
      icon: AlertTriangle,
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.15)',
      border: 'rgba(249, 115, 22, 0.4)',
    },
    {
      id: 'MINOR' as const,
      label: 'MINOR',
      count: minorNodes,
      icon: AlertCircle,
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.15)',
      border: 'rgba(234, 179, 8, 0.4)',
    },
    {
      id: 'NORMAL' as const,
      label: '정상 가동',
      count: normalNodes,
      icon: CheckCircle,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
    },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 90,
        left: 16,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 200,
        pointerEvents: 'auto',
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1' }}>
            실시간 경보 현황
          </span>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            총 {nodes.length}대
          </span>
        </div>

        {/* 심각도별 필터 버튼 카드들 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filterCards.map(card => {
            const isSelected = filterSeverity === card.id;
            const Icon = card.icon;

            return (
              <button
                key={card.id}
                onClick={() => onSelectFilter(card.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 6,
                  background: isSelected ? card.bg : 'rgba(30, 41, 59, 0.4)',
                  border: isSelected ? `1px solid ${card.color}` : '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={15} color={card.color} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>
                    {card.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: card.count > 0 ? card.color : '#64748b',
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: card.count > 0 && card.id !== 'NORMAL' ? card.bg : 'transparent',
                  }}
                >
                  {card.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 회선(링크) 상태 서머리 */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Activity size={12} color="#06b6d4" />
            <span>네트워크 회선 (총 {edges.length}개)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '0 4px' }}>
            <span style={{ color: downEdges > 0 ? '#ef4444' : '#64748b', fontWeight: downEdges > 0 ? 'bold' : 'normal' }}>
              단선: {downEdges}
            </span>
            <span style={{ color: warningEdges > 0 ? '#f97316' : '#64748b' }}>
              혼잡: {warningEdges}
            </span>
            <span style={{ color: '#10b981' }}>
              정상: {edges.length - downEdges - warningEdges}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
