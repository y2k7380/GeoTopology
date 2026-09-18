import React, { useState, useCallback, useEffect } from 'react';
import { TopologyMap } from './components/TopologyMap';
import { HeaderNav } from './components/HeaderNav';
import { AlarmDashboard } from './components/AlarmDashboard';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { RightMapOverlay } from './components/RightMapOverlay';
import { generateInitialTopology } from './data/mockTopology';
import type { NetworkNode, NetworkEdge, RegionSummaryNode, AlarmSeverity, LabelConfig, LayerVisibilityConfig } from './types/topology';
import { DEFAULT_LABEL_CONFIG, DEFAULT_LAYER_CONFIG } from './types/topology';
import type { MapStyleType } from './data/mapStyles';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { soundFx } from './utils/audio';
import './App.css';

export const App: React.FC = () => {
  // 토폴로지 데이터 상태
  const [initialData] = useState(() => generateInitialTopology());
  const [nodes, setNodes] = useState<NetworkNode[]>(initialData.nodes);
  const [edges, setEdges] = useState<NetworkEdge[]>(initialData.edges);

  // 지도 스타일 상태 (기본값: 100% 완전 오프라인 Protomaps PMTiles 대한민국 풀벡터 다크 맵)
  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyleType>('OFFLINE_PMTILES_DARK');

  // 노드 라벨 규칙 설정 상태
  const [labelConfig, setLabelConfig] = useState<LabelConfig>(DEFAULT_LABEL_CONFIG);

  // 지도 및 토폴로지 레이어 가시화 옵션 상태
  const [layerConfig, setLayerConfig] = useState<LayerVisibilityConfig>(DEFAULT_LAYER_CONFIG);

  // 현재 지도 줌 레벨 상태
  const [currentZoom, setCurrentZoom] = useState<number>(6.8);

  // 뷰포트 및 모드 상태
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<AlarmSeverity | 'ALL'>('ALL');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | RegionSummaryNode | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number; zoom?: number; pitch?: number } | null>(null);

  // 시뮬레이션 상태
  const [hasActiveSimulation, setHasActiveSimulation] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);

  // ESC 키로 열린 서랍 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. 우편번호/주소 및 장비 검색 시 이동
  const handleSelectSearchTarget = useCallback((target: { lat: number; lng: number; zoom?: number; pitch?: number }, node?: NetworkNode) => {
    setFlyToTarget(target);
    if (node) {
      setSelectedNode(node);
    }
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

  // 3. 권역 퀵 점프
  const handleJumpRegion = useCallback((target: { lat: number; lng: number; zoom: number; pitch: number }) => {
    setFlyToTarget({
      lat: target.lat,
      lng: target.lng,
      zoom: target.zoom,
      pitch: is3DMode ? target.pitch : 0,
    });
  }, [is3DMode]);

  // 4. 이벤트 피드에서 장비 포커스
  const handleFocusNode = useCallback((node: NetworkNode) => {
    setSelectedNode(node);
    setFlyToTarget({
      lat: node.lat,
      lng: node.lng,
      zoom: 16,
      pitch: is3DMode ? 60 : 0,
    });
  }, [is3DMode]);

  // 5. 임의 장애 시뮬레이션 발생
  const handleTriggerSimulatedAlarm = useCallback(() => {
    setNodes(prevNodes =>
      prevNodes.map(node => {
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
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
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
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
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

  // 6. 장애 정상화 복구
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

  // 7. 서머리 카드에서 서브노드 선택 시
  const handleSelectSubNode = useCallback((node: NetworkNode) => {
    soundFx.playFocus();
    setSelectedNode(node);
    setFlyToTarget({
      lat: node.lat,
      lng: node.lng,
      zoom: 16,
      pitch: is3DMode ? 60 : 0,
    });
  }, [is3DMode]);

  return (
    <div className="geotopo-app" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div className="geotopo-vignette" />

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
        layerConfig={layerConfig}
        onZoomChange={setCurrentZoom}
      />

      {/* 지도 오른쪽 상단 플로팅 레이어 & 테마 제어 오버레이 */}
      <RightMapOverlay
        currentMapStyle={currentMapStyle}
        onChangeMapStyle={setCurrentMapStyle}
        layerConfig={layerConfig}
        onChangeLayerConfig={setLayerConfig}
        currentZoom={currentZoom}
        onJumpRegion={handleJumpRegion}
      />

      {/* 상단 글로벌 관제 바 & 옴니서치 */}
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
        nodes={nodes}
        edges={edges}
      />

      {/* 좌측 실시간 알람 통계 & 이벤트 피드 & 전국 장비 목록 및 검색 대시보드 */}
      <AlarmDashboard
        nodes={nodes}
        edges={edges}
        filterSeverity={filterSeverity}
        onSelectFilter={setFilterSeverity}
        onFocusNode={handleFocusNode}
        selectedNode={selectedNode}
      />

      {/* 우측 노드/서머리 상세 인포그래픽 서랍 */}
      <NodeDetailDrawer
        selectedNode={selectedNode}
        onClose={() => setSelectedNode(null)}
        onZoomToNode={(lat, lng, zoom) => setFlyToTarget({ lat, lng, zoom, pitch: 58 })}
        onSelectSubNode={handleSelectSubNode}
        allEdges={edges}
      />

      {/* 좌측 하단 3D 토폴로지 범례 미니 패널 */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: 16,
          left: 14,
          zIndex: 40,
          padding: '8px 12px',
          maxWidth: 290,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: 11,
          color: '#cbd5e1',
          pointerEvents: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => {
            soundFx.playClick();
            setShowLegend(!showLegend)}
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#38bdf8' }}>
            <Layers size={13} />
            <span>3D 가이드 범례</span>
          </div>
          <div style={{ color: '#64748b' }}>
            {showLegend ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </div>
        </div>

        {showLegend && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#c084fc', border: '1px solid #fff', display: 'inline-block' }} />
              <span><strong>전송장비 (ROADM/POTN)</strong>: 보라색 광학 섀시</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#34d399', border: '1px solid #fff', display: 'inline-block' }} />
              <span><strong>스위치 (L3/L2 Switch)</strong>: 에메랄드 스위칭 섀시</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#38bdf8', border: '1px solid #fff', display: 'inline-block' }} />
              <span><strong>코어/집선 라우터</strong>: 블루 IP 백본 섀시</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 3, background: '#e879f9', display: 'inline-block' }} />
              <span><strong>DWDM 광전송 링크</strong>: 400G 파장 채널 곡선</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 2, background: '#06b6d4', display: 'inline-block' }} />
              <span><strong>IP 백본 / 스위치 링</strong>: 100G/40G 회선</span>
            </div>
            <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 2, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 4 }}>
              * 줌 레벨에 따라 <strong>시도 ➔ 국사 ➔ 개별 장비</strong>로 자동 전환
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
