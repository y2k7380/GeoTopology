import React, { useState, useCallback, useEffect } from 'react';
import { TopologyMap } from './TopologyMap';
import { HeaderNav } from './HeaderNav';
import { AlarmDashboard } from './AlarmDashboard';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { RightMapOverlay } from './RightMapOverlay';
import { generateInitialTopology } from '../data/mockTopology';
import type {
  NetworkNode,
  NetworkEdge,
  RegionSummaryNode,
  AlarmSeverity,
  LabelConfig,
  LayerVisibilityConfig,
} from '../types/topology';
import { DEFAULT_LABEL_CONFIG, DEFAULT_LAYER_CONFIG } from '../types/topology';
import type { MapStyleType } from '../data/mapStyles';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { soundFx } from '../utils/audio';
import '../App.css';

export interface GeoTopologyViewerProps {
  /**
   * 사용자 정의 노드 데이터셋 (미지정 시 전국 714대 기본 토폴로지 사용)
   */
  nodes?: NetworkNode[];
  /**
   * 사용자 정의 회선 데이터셋 (미지정 시 전국 983구간 기본 회선망 사용)
   */
  edges?: NetworkEdge[];
  /**
   * 초기 지도 스타일 (기본값: 'OFFLINE_PMTILES_DARK')
   */
  initialMapStyle?: MapStyleType;
  /**
   * 초기 3D 뷰 활성화 여부 (기본값: true)
   */
  initial3DMode?: boolean;
  /**
   * 상단 글로벌 관제 바(HeaderNav) 표시 여부 (기본값: true)
   */
  showNav?: boolean;
  /**
   * 좌측 NOC 통합 대시보드(AlarmDashboard) 표시 여부 (기본값: true)
   */
  showDashboard?: boolean;
  /**
   * 좌측 하단 3D 범례 패널 표시 여부 (기본값: true)
   */
  showLegend?: boolean;
  /**
   * 우측 상단 지도 테마/레이어 오버레이 표시 여부 (기본값: true)
   */
  showRightOverlay?: boolean;
  /**
   * 노드/서머리 선택 시 콜백 이벤트
   */
  onNodeSelect?: (node: NetworkNode | RegionSummaryNode | null) => void;
  /**
   * 커스텀 컨테이너 스타일
   */
  style?: React.CSSProperties;
  /**
   * 커스텀 컨테이너 클래스명
   */
  className?: string;
}

export const GeoTopologyViewer: React.FC<GeoTopologyViewerProps> = ({
  nodes: customNodes,
  edges: customEdges,
  initialMapStyle = 'OFFLINE_PMTILES_DARK',
  initial3DMode = true,
  showNav = true,
  showDashboard = true,
  showLegend: initialShowLegend = true,
  showRightOverlay = true,
  onNodeSelect,
  style,
  className = '',
}) => {
  // 토폴로지 데이터 상태
  const [internalData] = useState(() => generateInitialTopology());
  const [nodes, setNodes] = useState<NetworkNode[]>(customNodes || internalData.nodes);
  const [edges, setEdges] = useState<NetworkEdge[]>(customEdges || internalData.edges);

  // 외부 props 변경 동기화
  useEffect(() => {
    if (customNodes) setNodes(customNodes);
  }, [customNodes]);

  useEffect(() => {
    if (customEdges) setEdges(customEdges);
  }, [customEdges]);

  // 지도 스타일 상태
  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyleType>(initialMapStyle);

  // 노드 라벨 규칙 설정 상태
  const [labelConfig, setLabelConfig] = useState<LabelConfig>(DEFAULT_LABEL_CONFIG);

  // 지도 및 토폴로지 레이어 가시화 옵션 상태
  const [layerConfig, setLayerConfig] = useState<LayerVisibilityConfig>(DEFAULT_LAYER_CONFIG);

  // 현재 지도 줌 레벨 상태
  const [currentZoom, setCurrentZoom] = useState<number>(6.8);

  // 뷰포트 및 모드 상태
  const [is3DMode, setIs3DMode] = useState<boolean>(initial3DMode);
  const [filterSeverity, setFilterSeverity] = useState<AlarmSeverity | 'ALL'>('ALL');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | RegionSummaryNode | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number; zoom?: number; pitch?: number } | null>(null);

  // 시뮬레이션 상태
  const [hasActiveSimulation, setHasActiveSimulation] = useState<boolean>(false);
  const [showLegendPanel, setShowLegendPanel] = useState<boolean>(false);

  // 선택된 노드 변경 시 외부 콜백 호출
  const handleSelectNode = useCallback(
    (node: NetworkNode | RegionSummaryNode | null) => {
      setSelectedNode(node);
      onNodeSelect?.(node);
    },
    [onNodeSelect]
  );

  // ESC 키로 열린 서랍 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSelectNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectNode]);

  // 1. 우편번호/주소 및 장비 검색 시 이동
  const handleSelectSearchTarget = useCallback(
    (target: { lat: number; lng: number; zoom?: number; pitch?: number }, node?: NetworkNode) => {
      setFlyToTarget(target);
      if (node) {
        handleSelectNode(node);
      }
    },
    [handleSelectNode]
  );

  // 2. 전도 보기로 카메라 리셋
  const handleResetView = useCallback(() => {
    setFlyToTarget({
      lat: 36.3,
      lng: 127.5,
      zoom: 6.8,
      pitch: is3DMode ? 48 : 0,
    });
    handleSelectNode(null);
  }, [is3DMode, handleSelectNode]);

  // 3. 권역 퀵 점프
  const handleJumpRegion = useCallback(
    (target: { lat: number; lng: number; zoom: number; pitch: number }) => {
      setFlyToTarget({
        lat: target.lat,
        lng: target.lng,
        zoom: target.zoom,
        pitch: is3DMode ? target.pitch : 0,
      });
    },
    [is3DMode]
  );

  // 4. 이벤트 피드/장비 리스트에서 장비 포커스
  const handleFocusNode = useCallback(
    (node: NetworkNode) => {
      handleSelectNode(node);
      setFlyToTarget({
        lat: node.lat,
        lng: node.lng,
        zoom: 16,
        pitch: is3DMode ? 60 : 0,
      });
    },
    [is3DMode, handleSelectNode]
  );

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
        if (node.postalCode === '30151' && node.type === 'OPTICAL_DWDM') {
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
  const handleSelectSubNode = useCallback(
    (node: NetworkNode) => {
      soundFx.playFocus();
      handleSelectNode(node);
      setFlyToTarget({
        lat: node.lat,
        lng: node.lng,
        zoom: 16,
        pitch: is3DMode ? 60 : 0,
      });
    },
    [is3DMode, handleSelectNode]
  );

  return (
    <div
      className={`geotopo-app ${className}`}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div className="geotopo-vignette" />

      {/* 3D 지도 및 토폴로지 렌더러 */}
      <TopologyMap
        allNodes={nodes}
        allEdges={edges}
        selectedNode={selectedNode}
        onSelectNode={handleSelectNode}
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
      {showRightOverlay && (
        <RightMapOverlay
          currentMapStyle={currentMapStyle}
          onChangeMapStyle={setCurrentMapStyle}
          layerConfig={layerConfig}
          onChangeLayerConfig={setLayerConfig}
          currentZoom={currentZoom}
          onJumpRegion={handleJumpRegion}
        />
      )}

      {/* 상단 글로벌 관제 바 & 옴니서치 */}
      {showNav && (
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
      )}

      {/* 좌측 실시간 알람 통계 & 이벤트 피드 & 전국 장비 목록 및 검색 대시보드 */}
      {showDashboard && (
        <AlarmDashboard
          nodes={nodes}
          edges={edges}
          filterSeverity={filterSeverity}
          onSelectFilter={setFilterSeverity}
          onFocusNode={handleFocusNode}
          selectedNode={selectedNode}
        />
      )}

      {/* 우측 노드/서머리 상세 인포그래픽 서랍 */}
      <NodeDetailDrawer
        selectedNode={selectedNode}
        onClose={() => handleSelectNode(null)}
        onZoomToNode={(lat, lng, zoom) => setFlyToTarget({ lat, lng, zoom, pitch: 58 })}
        onSelectSubNode={handleSelectSubNode}
        allEdges={edges}
      />

      {/* 좌측 하단 3D 토폴로지 범례 미니 패널 */}
      {initialShowLegend && (
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
              setShowLegendPanel(!showLegendPanel);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#38bdf8' }}>
              <Layers size={13} />
              <span>3D 가이드 범례</span>
            </div>
            <div style={{ color: '#64748b' }}>
              {showLegendPanel ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </div>
          </div>

          {showLegendPanel && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#c084fc', border: '1px solid #fff', display: 'inline-block' }} />
                <span><strong>전송장비 (ROADM/POTN)</strong>: 보라색 광학 섀시</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#34d399', border: '1px solid #fff', display: 'inline-block' }} />
                <span><strong>L2/L3 스위치</strong>: 에메랄드 스위칭 섀시</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#38bdf8', border: '1px solid #fff', display: 'inline-block' }} />
                <span><strong>코어/집선 라우터</strong>: 블루 IP 패킷 섀시</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 3, background: '#c084fc', display: 'inline-block' }} />
                <span><strong>400G DWDM 광전송 아크</strong>: 보라색 포물선</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 3, background: '#0066ff', display: 'inline-block' }} />
                <span><strong>100G IP 백본 아크</strong>: 일렉트릭 블루 곡선</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 3, background: '#10b981', display: 'inline-block' }} />
                <span><strong>40G 메트로 스위치 링</strong>: 에메랄드 곡선</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
