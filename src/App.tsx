import React, { useState, useCallback } from 'react';
import { TopologyMap } from './components/TopologyMap';
import { HeaderNav } from './components/HeaderNav';
import { AlarmDashboard } from './components/AlarmDashboard';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { generateInitialTopology } from './data/mockTopology';
import type { NetworkNode, NetworkEdge, RegionSummaryNode, AlarmSeverity, LabelConfig } from './types/topology';
import { DEFAULT_LABEL_CONFIG } from './types/topology';
import type { MapStyleType } from './data/mapStyles';
import { Layers } from 'lucide-react';

export const App: React.FC = () => {
  // 토폴로지 데이터 상태
  const [initialData] = useState(() => generateInitialTopology());
  const [nodes, setNodes] = useState<NetworkNode[]>(initialData.nodes);
  const [edges, setEdges] = useState<NetworkEdge[]>(initialData.edges);

  // 지도 스타일 상태 (기본값: 100% 완전 오프라인 Protomaps PMTiles 대한민국 풀벡터 다크 맵)
  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyleType>('OFFLINE_PMTILES_DARK');

  // 노드 라벨 규칙 설정 상태
  const [labelConfig, setLabelConfig] = useState<LabelConfig>(DEFAULT_LABEL_CONFIG);

  // 뷰포트 및 모드 상태
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<AlarmSeverity | 'ALL'>('ALL');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | RegionSummaryNode | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number; zoom?: number; pitch?: number } | null>(null);

  // 시뮬레이션 상태
  const [hasActiveSimulation, setHasActiveSimulation] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // 1. 우편번호/주소 검색 시 이동
  const handleSelectSearchTarget = useCallback((target: { lat: number; lng: number; zoom?: number; pitch?: number }) => {
    setFlyToTarget(target);
  }, []);

  // 2. 전도 보기로 카메라 리셋
  const handleResetView = useCallback(() => {
    setFlyToTarget({
      lat: 36.3,
      lng: 127.5,
      zoom: 6.8,
      pitch: is3DMode ? 48 : 0,
    });
    setSelectedNode(null);
  }, [is3DMode]);

  // 3. 임의 장애 시뮬레이션 발생
  const handleTriggerSimulatedAlarm = useCallback(() => {
    setNodes(prevNodes =>
      prevNodes.map(node => {
        // 광화문(03186) 및 세종(30151)에 추가 Critical 장애 주입
        if (node.postalCode === '03186' && node.type === 'CORE_ROUTER') {
          return {
            ...node,
            status: 'CRITICAL',
            metrics: { ...node.metrics, cpuPercent: 96, trafficGbps: 98.4 },
            alarms: [
              ...node.alarms,
              {
                id: `SIM_ALM_${Date.now()}_1`,
                severity: 'CRITICAL',
                code: 'ALM_CORE_OVERLOAD',
                title: 'Core Engine CPU Throttling',
                description: 'DDoS 공격 의심 트래픽 급증으로 CPU 96% 도달 및 패킷 드랍 발생',
                timestamp: '2026-09-16 17:15:00',
              },
            ],
          };
        }
        if (node.postalCode === '30151' && node.type === 'OPTICAL_MUX') {
          return {
            ...node,
            status: 'CRITICAL',
            alarms: [
              ...node.alarms,
              {
                id: `SIM_ALM_${Date.now()}_2`,
                severity: 'CRITICAL',
                code: 'ALM_DWDM_CH_FAIL',
                title: 'DWDM Wavelength Failure',
                description: '세종 정부청사 4번 트랜스폰더 광채널 소광 현상 발생',
                timestamp: '2026-09-16 17:15:20',
              },
            ],
          };
        }
        return node;
      })
    );

    setEdges(prevEdges =>
      prevEdges.map(edge => {
        if (edge.linkType === 'BACKBONE_100G' && edge.id.includes('03186')) {
          return {
            ...edge,
            status: 'DOWN',
            packetLossPercent: 100,
            trafficUtilPercent: 0,
          };
        }
        return edge;
      })
    );

    setHasActiveSimulation(true);
  }, []);

  // 4. 장애 정상화 복구
  const handleClearSimulatedAlarms = useCallback(() => {
    setNodes(prevNodes =>
      prevNodes.map(node => ({
        ...node,
        status: 'NORMAL',
        metrics: {
          ...node.metrics,
          cpuPercent: Math.floor(20 + Math.random() * 30),
        },
        alarms: [],
      }))
    );

    setEdges(prevEdges =>
      prevEdges.map(edge => ({
        ...edge,
        status: 'UP',
        packetLossPercent: 0,
        trafficUtilPercent: 45,
      }))
    );

    setHasActiveSimulation(false);
  }, []);

  // 5. 서머리 카드에서 서브노드 선택 시
  const handleSelectSubNode = useCallback((node: NetworkNode) => {
    setSelectedNode(node);
    setFlyToTarget({
      lat: node.lat,
      lng: node.lng,
      zoom: 15,
      pitch: 60,
    });
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 3D 지도 및 토폴로지 렌더러 */}
      <TopologyMap
        allNodes={nodes}
        allEdges={edges}
        selectedNode={selectedNode}
        onSelectNode={setSelectedNode}
        flyToTarget={flyToTarget}
        onFlyToComplete={() => setFlyToTarget(null)}
        is3DMode={is3DMode}
        filterSeverity={filterSeverity}
        currentMapStyle={currentMapStyle}
        labelConfig={labelConfig}
      />

      {/* 상단 네비게이션 & 우편번호 검색 */}
      <HeaderNav
        onSelectSearchTarget={handleSelectSearchTarget}
        is3DMode={is3DMode}
        onToggle3DMode={() => setIs3DMode(!is3DMode)}
        onResetView={handleResetView}
        onTriggerSimulatedAlarm={handleTriggerSimulatedAlarm}
        onClearSimulatedAlarms={handleClearSimulatedAlarms}
        hasActiveSimulation={hasActiveSimulation}
        currentMapStyle={currentMapStyle}
        onChangeMapStyle={setCurrentMapStyle}
        labelConfig={labelConfig}
        onChangeLabelConfig={setLabelConfig}
      />

      {/* 좌측 실시간 알람 통계 대시보드 */}
      <AlarmDashboard
        nodes={nodes}
        edges={edges}
        filterSeverity={filterSeverity}
        onSelectFilter={setFilterSeverity}
      />

      {/* 우측 노드/서머리 상세 인포그래픽 서랍 */}
      <NodeDetailDrawer
        selectedNode={selectedNode}
        onClose={() => setSelectedNode(null)}
        onZoomToNode={(lat, lng, zoom) => setFlyToTarget({ lat, lng, zoom, pitch: 58 })}
        onSelectSubNode={handleSelectSubNode}
      />

      {/* 좌측 하단 범례 안내 패널 */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: 20,
          left: 16,
          zIndex: 40,
          padding: '10px 14px',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: 11,
          color: '#cbd5e1',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setShowLegend(!showLegend)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold', color: '#38bdf8' }}>
            <Layers size={13} />
            <span>3D 토폴로지 가이드</span>
          </div>
          <span style={{ fontSize: 10, color: '#64748b' }}>{showLegend ? '접기 ▲' : '펼치기 ▼'}</span>
        </div>

        {showLegend && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444', border: '1px solid #fff', display: 'inline-block' }} />
              <span><strong>3D 4각 장비 섀시 (Square Box)</strong>: 랙 장비 형태, 높이는 장비/경보 수</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 2, background: '#06b6d4', display: 'inline-block' }} />
              <span><strong>3D 포물선 곡선 (Arc)</strong>: 100G/40G 백본 회선 (적색=단선)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #ef4444', display: 'inline-block' }} />
              <span><strong>외곽 펄스 링 (Pulse)</strong>: Critical/Major 경보 발생 위치 강조</span>
            </div>
            <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 2, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 4 }}>
              * 줌 레벨에 따라 <strong>전국 시도 ➔ 통신 국사 ➔ 개별 장비</strong>로 자동 요약 전환됩니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
