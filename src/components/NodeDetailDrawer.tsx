import React from 'react';
import { X, Server, Cpu, HardDrive, Thermometer, Wifi, AlertTriangle, MapPin, ZoomIn, ArrowRight } from 'lucide-react';
import type { NetworkNode, RegionSummaryNode, AlarmSeverity } from '../types/topology';

interface NodeDetailDrawerProps {
  selectedNode: NetworkNode | RegionSummaryNode | null;
  onClose: () => void;
  onZoomToNode: (lat: number, lng: number, zoom: number) => void;
  onSelectSubNode: (node: NetworkNode) => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  selectedNode,
  onClose,
  onZoomToNode,
  onSelectSubNode,
}) => {
  if (!selectedNode) return null;

  const isSummary = 'level' in selectedNode;

  const getSeverityBadge = (severity: AlarmSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="badge-critical" style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>CRITICAL</span>;
      case 'MAJOR':
        return <span className="badge-major" style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>MAJOR</span>;
      case 'MINOR':
        return <span className="badge-minor" style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>MINOR</span>;
      default:
        return <span className="badge-normal" style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>NORMAL</span>;
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 90,
        right: 16,
        bottom: 30,
        width: 380,
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      {/* 상단 헤더 */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: 6,
              borderRadius: 6,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
            }}
          >
            <Server size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#f8fafc' }}>
              {isSummary ? (selectedNode as RegionSummaryNode).name : (selectedNode as NetworkNode).name}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {isSummary ? `권역 요약 (${(selectedNode as RegionSummaryNode).level})` : (selectedNode as NetworkNode).type}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* 바디 컨텐츠 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 1. 서머리 노드일 경우 */}
        {isSummary && (
          <>
            {/* 권역 요약 카드 */}
            <div className="glass-card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>최고 경보 레벨</span>
                {getSeverityBadge((selectedNode as RegionSummaryNode).highestSeverity)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 12 }}>
                <div>
                  <div style={{ color: '#64748b' }}>우편번호 대역</div>
                  <div style={{ fontWeight: 600, color: '#38bdf8' }}>{(selectedNode as RegionSummaryNode).postalCodePrefix}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>총 장비 대수</div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{(selectedNode as RegionSummaryNode).nodeCount}대</div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>총 대역폭 트래픽</div>
                  <div style={{ fontWeight: 600, color: '#06b6d4' }}>{(selectedNode as RegionSummaryNode).totalTrafficGbps} Gbps</div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>평균 CPU 부하</div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{(selectedNode as RegionSummaryNode).avgCpuPercent}%</div>
                </div>
              </div>
            </div>

            {/* 세부 경보 건수 집계 */}
            <div className="glass-card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
                경보 세부 집계
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Critical: {(selectedNode as RegionSummaryNode).criticalCount}</span>
                <span style={{ color: '#f97316', fontWeight: 600 }}>Major: {(selectedNode as RegionSummaryNode).majorCount}</span>
                <span style={{ color: '#eab308' }}>Minor: {(selectedNode as RegionSummaryNode).minorCount}</span>
                <span style={{ color: '#10b981' }}>Normal: {(selectedNode as RegionSummaryNode).normalCount}</span>
              </div>
            </div>

            {/* 3D 줌인 액션 버튼 */}
            <button
              onClick={() => onZoomToNode(selectedNode.lat, selectedNode.lng, (selectedNode as RegionSummaryNode).level === 'PROVINCE' ? 10 : 14)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
              }}
            >
              <ZoomIn size={16} />
              이 권역으로 3D 상세 줌인
            </button>

            {/* 소속 장비 리스트 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>
                소속 장비 목록 ({(selectedNode as RegionSummaryNode).childNodes.length}개)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                {(selectedNode as RegionSummaryNode).childNodes.map(child => (
                  <div
                    key={child.id}
                    onClick={() => onSelectSubNode(child)}
                    className="glass-card"
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{child.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{child.ipAddress} • {child.type}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {getSeverityBadge(child.status)}
                      <ArrowRight size={14} color="#64748b" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 2. 단일 장비 노드일 경우 */}
        {!isSummary && (
          <>
            {/* 기본 제원 및 주소 카드 */}
            <div className="glass-card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>장비 가동 상태</span>
                {getSeverityBadge((selectedNode as NetworkNode).status)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>IP 주소</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>{(selectedNode as NetworkNode).ipAddress}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>제조사 / 모델</span>
                  <span style={{ color: '#f8fafc' }}>{(selectedNode as NetworkNode).vendor} / {(selectedNode as NetworkNode).model}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>랙 위치</span>
                  <span style={{ color: '#f8fafc' }}>{(selectedNode as NetworkNode).rackLocation}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>우편번호</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{(selectedNode as NetworkNode).postalCode}</span>
                </div>
              </div>

              {/* 도로명 주소 */}
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <MapPin size={14} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.4 }}>
                  {(selectedNode as NetworkNode).address}
                </div>
              </div>
            </div>

            {/* 실시간 메트릭스 */}
            <div className="glass-card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 12 }}>
                실시간 텔레메트리 메트릭
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* CPU */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
                      <Cpu size={12} color="#06b6d4" /> CPU 부하율
                    </span>
                    <span style={{ fontWeight: 600, color: (selectedNode as NetworkNode).metrics.cpuPercent > 70 ? '#ef4444' : '#f8fafc' }}>
                      {(selectedNode as NetworkNode).metrics.cpuPercent}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(selectedNode as NetworkNode).metrics.cpuPercent}%`,
                        height: '100%',
                        background: (selectedNode as NetworkNode).metrics.cpuPercent > 70 ? '#ef4444' : '#06b6d4',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Memory */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
                      <HardDrive size={12} color="#38bdf8" /> 메모리 점유율
                    </span>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {(selectedNode as NetworkNode).metrics.memoryPercent}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(selectedNode as NetworkNode).metrics.memoryPercent}%`,
                        height: '100%',
                        background: '#38bdf8',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* 온도 & 트래픽 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
                  <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Thermometer size={12} /> 섀시 온도
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: (selectedNode as NetworkNode).metrics.tempCelsius > 60 ? '#f97316' : '#10b981', marginTop: 2 }}>
                      {(selectedNode as NetworkNode).metrics.tempCelsius}°C
                    </div>
                  </div>
                  <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Wifi size={12} /> 실시간 트래픽
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginTop: 2 }}>
                      {(selectedNode as NetworkNode).metrics.trafficGbps} Gbps
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 발생 경보 내역 */}
            <div className="glass-card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} color="#f97316" />
                발생 경보 내역 ({(selectedNode as NetworkNode).alarms.length}건)
              </div>

              {(selectedNode as NetworkNode).alarms.length === 0 ? (
                <div style={{ fontSize: 12, color: '#10b981', textAlign: 'center', padding: '12px 0' }}>
                  ✓ 현재 발생한 활성 경보가 없습니다.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(selectedNode as NetworkNode).alarms.map(alarm => (
                    <div
                      key={alarm.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: alarm.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                        border: `1px solid ${alarm.severity === 'CRITICAL' ? 'rgba(239,68,68,0.4)' : 'rgba(249,115,22,0.4)'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 'bold', color: alarm.severity === 'CRITICAL' ? '#fca5a5' : '#fdba74' }}>
                          {alarm.title}
                        </span>
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>{alarm.timestamp.split(' ')[1]}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.3 }}>
                        {alarm.description}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, fontFamily: 'monospace' }}>
                        CODE: {alarm.code}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3D 위치 포커스 버튼 */}
            <button
              onClick={() => onZoomToNode(selectedNode.lat, selectedNode.lng, 15)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <ZoomIn size={16} />
              이 장비로 3D 카메라 이동
            </button>
          </>
        )}
      </div>
    </div>
  );
};
