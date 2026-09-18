import React, { useState } from 'react';
import {
  X,
  Server,
  Cpu,
  HardDrive,
  Thermometer,
  Wifi,
  ZoomIn,
  Activity,
  CheckCircle2,
  Zap,
  Fan,
} from 'lucide-react';
import type { NetworkNode, RegionSummaryNode, AlarmSeverity, NetworkEdge } from '../types/topology';
import { soundFx } from '../utils/audio';

export interface NodeDetailDrawerProps {
  selectedNode: NetworkNode | RegionSummaryNode | null;
  onClose: () => void;
  onZoomToNode: (lat: number, lng: number, zoom: number) => void;
  onSelectSubNode: (node: NetworkNode) => void;
  allEdges?: NetworkEdge[];
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  selectedNode,
  onClose,
  onZoomToNode,
  onSelectSubNode,
  allEdges = [],
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HARDWARE' | 'PERFORMANCE' | 'ALARMS'>('OVERVIEW');
  const [acknowledgedAlarms, setAcknowledgedAlarms] = useState<Record<string, boolean>>({});

  if (!selectedNode) return null;

  const isSummary = 'level' in selectedNode;
  const node = !isSummary ? (selectedNode as NetworkNode) : null;
  const summary = isSummary ? (selectedNode as RegionSummaryNode) : null;

  const handleAcknowledge = (alarmId: string) => {
    soundFx.playSuccess();
    setAcknowledgedAlarms(prev => ({ ...prev, [alarmId]: true }));
  };

  // 해당 노드와 연결된 인접 회선(Connected Links) 검색
  const connectedEdges = node
    ? allEdges.filter(e => e.source === node.id || e.target === node.id)
    : [];

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
        top: 84,
        right: 14,
        bottom: 24,
        width: 380,
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pointerEvents: 'auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
      }}
    >
      {/* 상단 헤더 */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(10, 16, 29, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: 8,
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
            }}
          >
            <Server size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>
              {isSummary ? summary?.name : node?.name}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {isSummary ? `권역 요약 (${summary?.level})` : `${node?.type} • ${node?.stationName}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => {
              soundFx.playFocus();
              onZoomToNode(selectedNode.lat, selectedNode.lng, isSummary ? 12 : 16);
            }}
            title="카메라 포커스 이동"
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 6,
              color: '#38bdf8',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
            }}
          >
            <ZoomIn size={13} />
            <span>줌인</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
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
      </div>

      {/* 노드(단일 장비)일 때의 상단 탭 네비게이션 */}
      {!isSummary && (
        <div
          style={{
            display: 'flex',
            padding: '6px 10px',
            gap: 4,
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(10, 16, 29, 0.3)',
          }}
        >
          <button
            className={`noc-tab-btn ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
            onClick={() => {
              soundFx.playClick();
              setActiveTab('OVERVIEW');
            }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <span>개요</span>
          </button>
          <button
            className={`noc-tab-btn ${activeTab === 'HARDWARE' ? 'active' : ''}`}
            onClick={() => {
              soundFx.playClick();
              setActiveTab('HARDWARE');
            }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <span>섀시 랙</span>
          </button>
          <button
            className={`noc-tab-btn ${activeTab === 'PERFORMANCE' ? 'active' : ''}`}
            onClick={() => {
              soundFx.playClick();
              setActiveTab('PERFORMANCE');
            }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <span>성능/포트</span>
          </button>
          <button
            className={`noc-tab-btn ${activeTab === 'ALARMS' ? 'active' : ''}`}
            onClick={() => {
              soundFx.playClick();
              setActiveTab('ALARMS');
            }}
            style={{ flex: 1, justifyContent: 'center', position: 'relative' }}
          >
            <span>경보({node?.alarms.length || 0})</span>
            {(node?.alarms.length || 0) > 0 && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            )}
          </button>
        </div>
      )}

      {/* 바디 컨텐츠 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 1. 권역 서머리 노드일 경우 */}
        {isSummary && summary && (
          <>
            <div className="glass-card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>권역 집계 현황</span>
                {getSeverityBadge(summary.highestSeverity)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>총 장비 수</div>
                  <div className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
                    {summary.nodeCount} 대
                  </div>
                </div>
                <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>연계 회선 수</div>
                  <div className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8' }}>
                    {summary.edgeCount} 개
                  </div>
                </div>
                <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>총 트래픽</div>
                  <div className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
                    {summary.totalTrafficGbps} Gbps
                  </div>
                </div>
                <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>평균 CPU 부하</div>
                  <div className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: '#f97316' }}>
                    {summary.avgCpuPercent}%
                  </div>
                </div>
              </div>
            </div>

            {/* 하위 장비 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>
                소속 장비 인벤토리 ({summary.childNodes.length}대)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
                {summary.childNodes.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => onSelectSubNode(sub)}
                    className="glass-card"
                    style={{
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{sub.name}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>
                        [{sub.postalCode}] {sub.type}
                      </div>
                    </div>
                    {getSeverityBadge(sub.status)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 2. 단일 장비 - [개요 (OVERVIEW)] 탭 */}
        {!isSummary && node && activeTab === 'OVERVIEW' && (
          <>
            {/* 기본 스펙 카드 */}
            <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>운영 현황</span>
                {getSeverityBadge(node.status)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>우편번호 (5자리)</span>
                  <strong className="font-mono" style={{ color: '#38bdf8' }}>{node.postalCode}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>소속 국사</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{node.stationName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>랙 위치 (Rack ID)</span>
                  <span className="font-mono" style={{ color: '#f1f5f9' }}>{node.rackLocation}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>관리 IP 주소</span>
                  <span className="font-mono" style={{ color: '#38bdf8' }}>{node.ipAddress}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>벤더 / 모델</span>
                  <span style={{ color: '#cbd5e1' }}>{node.vendor} {node.model}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>도로명 주소</span>
                  <span style={{ color: '#cbd5e1', fontSize: 11, textAlign: 'right', maxWidth: 200 }}>
                    {node.address}
                  </span>
                </div>
              </div>
            </div>

            {/* 연계 회선(Connected Links) 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={13} />
                <span>연계 회선 ({connectedEdges.length}개)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {connectedEdges.length === 0 ? (
                  <div style={{ fontSize: 11, color: '#64748b' }}>연결된 백본 회선이 없습니다.</div>
                ) : (
                  connectedEdges.map(edge => {
                    const isDown = edge.status === 'DOWN';
                    const isWarning = edge.status === 'WARNING';
                    return (
                      <div
                        key={edge.id}
                        className="glass-card"
                        style={{
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderLeft: isDown ? '3px solid #ef4444' : isWarning ? '3px solid #f97316' : '3px solid #10b981',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#f1f5f9' }}>
                            {edge.linkType} ({edge.bandwidthGbps} Gbps)
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>
                            {edge.source === node.id ? `To: ${edge.target}` : `From: ${edge.source}`}
                          </div>
                        </div>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: isDown ? '#ef4444' : isWarning ? '#f97316' : '#10b981',
                            padding: '1px 5px',
                            borderRadius: 3,
                            background: isDown ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                          }}
                        >
                          {edge.status} ({edge.trafficUtilPercent}%)
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* 3. 단일 장비 - [하드웨어 섀시 (HARDWARE)] 탭 */}
        {!isSummary && node && activeTab === 'HARDWARE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 장비 카테고리별 특화 섀시 시각화 그래픽 */}
            <div
              className="glass-card"
              style={{
                padding: '12px',
                background: 'linear-gradient(180deg, #111827 0%, #0b0f19 100%)',
                border: node.category === 'TRANSMISSION' ? '1px solid #c084fc' : node.category === 'SWITCH' ? '1px solid #34d399' : '1px solid #38bdf8',
                boxShadow: node.category === 'TRANSMISSION' ? '0 0 15px rgba(192, 132, 252, 0.25)' : node.category === 'SWITCH' ? '0 0 15px rgba(52, 211, 153, 0.25)' : '0 0 15px rgba(56, 189, 248, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>
                <span className="font-mono">
                  {node.category === 'TRANSMISSION' ? 'OPTICAL SHELF (전송 선반)' : node.category === 'SWITCH' ? 'SWITCH CHASSIS (스위치 섀시)' : 'ROUTER 섀시'}: {node.model}
                </span>
                <span style={{ color: '#10b981' }}>FAN: ACTIVE</span>
              </div>

              {/* 전면 슬롯 모듈 매트릭스 (장비군별 실제 라인카드 모듈 표시) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 10 }}>
                {(node.category === 'TRANSMISSION'
                  ? ['Slot 1 (100G Mux)', 'Slot 2 (EDFA 광증폭)', 'Slot 3 (WSS 파장스위치)', 'Slot 4 (OSC 감시)']
                  : node.category === 'SWITCH'
                  ? ['Slot 1 (100G QSFP)', 'Slot 2 (25G SFP28)', 'Slot 3 (L3 Fabric)', 'Slot 4 (Control CPU)']
                  : ['Slot 1 (100G Line)', 'Slot 2 (100G Line)', 'Slot 3 (Main CPU)', 'Slot 4 (Switch Fabric)']
                ).map((slot, i) => (
                  <div
                    key={slot}
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 4,
                      padding: '6px 4px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 && node.status === 'CRITICAL' ? '#ef4444' : '#10b981', margin: '0 auto 4px' }} />
                    <div style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 600 }}>{slot}</div>
                  </div>
                ))}
              </div>

              {/* 하단 전원 및 팬 모듈 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#94a3b8' }}>
                  <Zap size={13} color="#eab308" />
                  <span>PSU 1: 220V OK / PSU 2: STBY</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#94a3b8' }}>
                  <Fan size={13} color="#06b6d4" />
                  <span>4,850 RPM</span>
                </div>
              </div>
            </div>

            {/* 1. 전송장비(TRANSMISSION) 특화 광파장 및 광레벨 카드 */}
            {node.category === 'TRANSMISSION' && node.transmissionDetails && (
              <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '3px solid #c084fc' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🌟 전송망 광학 파장 채널 (DWDM/POTN)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 11 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8' }}>광 파장 (λ)</div>
                    <strong className="font-mono" style={{ color: '#f8fafc', fontSize: 13 }}>
                      {node.transmissionDetails.wavelengthNm} nm
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8' }}>수신 광 파워 (RX)</div>
                    <strong className="font-mono" style={{ color: node.transmissionDetails.opticalPowerDbm < -25 ? '#ef4444' : '#10b981', fontSize: 13 }}>
                      {node.transmissionDetails.opticalPowerDbm} dBm
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8' }}>파장 채널 수</div>
                    <strong className="font-mono" style={{ color: '#c084fc', fontSize: 13 }}>
                      {node.transmissionDetails.channelCount} ch
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8' }}>레이저 발진</div>
                    <strong style={{ color: node.transmissionDetails.laserState === 'ACTIVE' ? '#10b981' : '#ef4444', fontSize: 12 }}>
                      {node.transmissionDetails.laserState}
                    </strong>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 4 }}>
                  소속 광링: <strong style={{ color: '#cbd5e1' }}>{node.transmissionDetails.ringName}</strong>
                </div>
              </div>
            )}

            {/* 2. 스위치(SWITCH) 특화 스위칭 용량 및 VLAN/MAC 카드 */}
            {node.category === 'SWITCH' && node.switchDetails && (
              <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '3px solid #34d399' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⚡ L2/L3 스위칭 패브릭 엔진</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 11 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8' }}>스위칭 용량</div>
                    <strong className="font-mono" style={{ color: '#34d399', fontSize: 13 }}>
                      {node.switchDetails.switchingCapacityGbps >= 1000 ? `${(node.switchDetails.switchingCapacityGbps / 1000).toFixed(1)} Tbps` : `${node.switchDetails.switchingCapacityGbps} Gbps`}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8' }}>STP 상태</div>
                    <strong style={{ color: '#10b981', fontSize: 12 }}>
                      {node.switchDetails.spanningTreeState}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8' }}>할당 VLAN</div>
                    <strong className="font-mono" style={{ color: '#f8fafc', fontSize: 13 }}>
                      {node.switchDetails.vlanCount} 개
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8' }}>MAC 엔트리</div>
                    <strong className="font-mono" style={{ color: '#38bdf8', fontSize: 13 }}>
                      {node.switchDetails.macTableCount.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* 센서 게이지 카드 */}
            <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>온도 및 하드웨어 센서</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1' }}>
                  <Thermometer size={15} color={node.metrics.tempCelsius > 60 ? '#ef4444' : '#10b981'} />
                  <span>섀시 내부 온도</span>
                </div>
                <strong className="font-mono" style={{ color: node.metrics.tempCelsius > 60 ? '#ef4444' : '#10b981' }}>
                  {node.metrics.tempCelsius} °C
                </strong>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (node.metrics.tempCelsius / 80) * 100)}%`,
                    height: '100%',
                    background: node.metrics.tempCelsius > 60 ? '#ef4444' : '#10b981',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. 단일 장비 - [성능/포트 (PERFORMANCE)] 탭 */}
        {!isSummary && node && activeTab === 'PERFORMANCE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* CPU / 메모리 게이지 */}
            <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Cpu size={14} color="#38bdf8" />
                    <span>CPU 가동률</span>
                  </span>
                  <strong className="font-mono" style={{ color: node.metrics.cpuPercent > 80 ? '#ef4444' : '#38bdf8' }}>
                    {node.metrics.cpuPercent}%
                  </strong>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${node.metrics.cpuPercent}%`,
                      height: '100%',
                      background: node.metrics.cpuPercent > 80 ? '#ef4444' : '#38bdf8',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HardDrive size={14} color="#06b6d4" />
                    <span>메모리 점유율</span>
                  </span>
                  <strong className="font-mono" style={{ color: '#06b6d4' }}>
                    {node.metrics.memoryPercent}%
                  </strong>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${node.metrics.memoryPercent}%`,
                      height: '100%',
                      background: '#06b6d4',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Wifi size={14} color="#10b981" />
                    <span>실시간 전송 트래픽</span>
                  </span>
                  <strong className="font-mono" style={{ color: '#10b981' }}>
                    {node.metrics.trafficGbps} Gbps
                  </strong>
                </div>
              </div>
            </div>

            {/* 포트 매트릭스 그리드 */}
            <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>인터페이스 포트 상태</span>
                <span className="font-mono" style={{ fontSize: 11, color: '#10b981' }}>
                  {node.metrics.activePorts} / {node.metrics.portCount} UP
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
                {Array.from({ length: node.metrics.portCount || 16 }).map((_, idx) => {
                  const isUp = idx < (node.metrics.activePorts || 12);
                  return (
                    <div
                      key={idx}
                      title={`Port ${idx + 1}: ${isUp ? 'UP (100Gbps)' : 'DOWN'}`}
                      style={{
                        height: 20,
                        borderRadius: 3,
                        background: isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                        border: isUp ? '1px solid #10b981' : '1px solid #ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        color: '#f8fafc',
                        fontFamily: 'monospace',
                      }}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. 단일 장비 - [경보 & RCA (ALARMS)] 탭 */}
        {!isSummary && node && activeTab === 'ALARMS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {node.alarms.length === 0 ? (
              <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: '#10b981' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 13, fontWeight: 700 }}>활성 경보가 없습니다.</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>장비가 정상 작동 중입니다.</div>
              </div>
            ) : (
              node.alarms.map(alarm => {
                const isAck = acknowledgedAlarms[alarm.id];
                return (
                  <div
                    key={alarm.id}
                    className="glass-card"
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      borderLeft: `3px solid ${alarm.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge-critical" style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3 }}>
                        {alarm.severity}
                      </span>
                      <span className="font-mono" style={{ fontSize: 10, color: '#94a3b8' }}>
                        {alarm.timestamp}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
                        {alarm.title}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace', marginTop: 1 }}>
                        Code: {alarm.code}
                      </div>
                      <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
                        {alarm.description}
                      </div>
                    </div>

                    {/* RCA 추천 조치 가이드 */}
                    <div
                      style={{
                        padding: '8px',
                        borderRadius: 6,
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        fontSize: 11,
                        color: '#94a3b8',
                      }}
                    >
                      <strong style={{ color: '#38bdf8' }}>💡 NOC 조치 가이드(RCA):</strong>
                      <div style={{ marginTop: 2 }}>
                        대체 백본 경로 우회 트래픽 전환 및 광 접속 레벨 수신 감도(-18dBm) 측정 요망.
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <button
                        onClick={() => handleAcknowledge(alarm.id)}
                        disabled={isAck}
                        style={{
                          background: isAck ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.2)',
                          border: isAck ? '1px solid rgba(255,255,255,0.1)' : '1px solid #10b981',
                          color: isAck ? '#64748b' : '#86efac',
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: isAck ? 'default' : 'pointer',
                        }}
                      >
                        {isAck ? '✓ 조치 접수됨(ACK)' : '경보 확인 접수(ACK)'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
