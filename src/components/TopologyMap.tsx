import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ArcLayer, ColumnLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { FREE_MAP_OPTIONS } from '../data/mapStyles';
import type { MapStyleType } from '../data/mapStyles';
import type { NetworkNode, NetworkEdge, RegionSummaryNode, AlarmSeverity, LabelConfig } from '../types/topology';
import type { ClusteredTopologyResult } from '../utils/summaryEngine';
import { computeHierarchicalTopology } from '../utils/summaryEngine';

interface TopologyMapProps {
  allNodes: NetworkNode[];
  allEdges: NetworkEdge[];
  selectedNode: NetworkNode | RegionSummaryNode | null;
  onSelectNode: (node: NetworkNode | RegionSummaryNode | null) => void;
  flyToTarget: { lat: number; lng: number; zoom?: number; pitch?: number } | null;
  onFlyToComplete: () => void;
  is3DMode: boolean;
  filterSeverity: AlarmSeverity | 'ALL';
  currentMapStyle: MapStyleType;
  labelConfig: LabelConfig;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({
  allNodes,
  allEdges,
  selectedNode,
  onSelectNode,
  flyToTarget,
  onFlyToComplete,
  is3DMode,
  filterSeverity,
  currentMapStyle,
  labelConfig,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(6.8);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    object: any;
    type: 'summary' | 'device' | 'edge';
  } | null>(null);

  // 1. 맵 및 MapboxOverlay 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialOption = FREE_MAP_OPTIONS.find(opt => opt.id === currentMapStyle) || FREE_MAP_OPTIONS[0];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialOption.style as any,
      center: [127.5, 36.3], // 대한민국 중심부
      zoom: 6.8,
      pitch: 48,
      bearing: -12,
      maxPitch: 85,
      minZoom: 5.0,
      maxZoom: 19.0,
    });

    const overlay = new MapboxOverlay({
      interleaved: false,
    });

    map.addControl(overlay as any);

    map.on('zoom', () => {
      setCurrentZoom(map.getZoom());
    });

    mapRef.current = map;
    overlayRef.current = overlay;

    return () => {
      overlay.finalize();
      map.remove();
    };
  }, []);

  // 2. 외부 flyToTarget 요청 감지 및 카메라 이동
  useEffect(() => {
    if (!mapRef.current || !flyToTarget) return;

    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 14,
      pitch: flyToTarget.pitch ?? 55,
      bearing: -15,
      essential: true,
      duration: 1800,
    });

    onFlyToComplete();
  }, [flyToTarget, onFlyToComplete]);

  // 3. 2D / 3D 모드 토글 반영
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.easeTo({
      pitch: is3DMode ? 55 : 0,
      bearing: is3DMode ? -15 : 0,
      duration: 1000,
    });
  }, [is3DMode]);

  // 3-1. 무료 지도 스타일 동적 변경 반영
  useEffect(() => {
    if (!mapRef.current) return;
    const opt = FREE_MAP_OPTIONS.find(o => o.id === currentMapStyle) || FREE_MAP_OPTIONS[0];
    mapRef.current.setStyle(opt.style as any);
  }, [currentMapStyle]);

  // 4. 심각도별 RGB 컬러 반환
  const getSeverityColor = useCallback((severity: AlarmSeverity, alpha = 230): [number, number, number, number] => {
    switch (severity) {
      case 'CRITICAL':
        return [239, 68, 68, alpha]; // Red
      case 'MAJOR':
        return [249, 115, 22, alpha]; // Orange
      case 'MINOR':
        return [234, 179, 8, alpha];  // Yellow
      case 'NORMAL':
      default:
        return [16, 185, 129, alpha]; // Emerald Green
    }
  }, []);

  // 5. 줌 레벨에 따른 계층 토폴로지 계산 및 Deck.gl 레이어 업데이트
  useEffect(() => {
    if (!overlayRef.current) return;

    const topologyData: ClusteredTopologyResult = computeHierarchicalTopology(
      allNodes,
      allEdges,
      currentZoom
    );

    // 필터 적용
    let filteredSummaryNodes = topologyData.summaryNodes;
    let filteredDetailedNodes = topologyData.detailedNodes;
    let filteredEdges = topologyData.visibleEdges;

    if (filterSeverity !== 'ALL') {
      filteredSummaryNodes = filteredSummaryNodes.filter(s => s.highestSeverity === filterSeverity);
      filteredDetailedNodes = filteredDetailedNodes.filter(d => d.status === filterSeverity);
      filteredEdges = filteredEdges.filter(e => {
        if (filterSeverity === 'CRITICAL') return e.status === 'DOWN';
        if (filterSeverity === 'MAJOR' || filterSeverity === 'MINOR') return e.status === 'WARNING';
        return e.status === 'UP';
      });
    }

    const layers: any[] = [];

    // [Layer A-1] 3D Arc 회선 외곽선 (Black Outline Shadow for High Contrast on Any Map)
    if (filteredEdges.length > 0) {
      layers.push(
        new ArcLayer<NetworkEdge>({
          id: 'network-edges-arc-outline',
          data: filteredEdges,
          getSourcePosition: d => d.sourceCoordinates,
          getTargetPosition: d => d.targetCoordinates,
          getSourceColor: [10, 15, 30, 230], // 고대비 블랙 외곽선
          getTargetColor: [10, 15, 30, 230],
          getWidth: d => {
            if (d.linkType === 'BACKBONE_100G') return 8.5;
            if (d.linkType === 'METRO_RING_40G') return 6.0;
            return 4.5;
          },
          widthMinPixels: 4.0, // 줌아웃해도 최소 4픽셀 두께 보장
          getHeight: 0.42,
          pickable: false,
        })
      );

      // [Layer A-2] 3D Arc 회선 코어 라인 (Vibrant High-Contrast Neon Core)
      layers.push(
        new ArcLayer<NetworkEdge>({
          id: 'network-edges-arc-core',
          data: filteredEdges,
          getSourcePosition: d => d.sourceCoordinates,
          getTargetPosition: d => d.targetCoordinates,
          getSourceColor: d => {
            if (d.status === 'DOWN') return [255, 35, 60, 255]; // 네온 크림슨 레드
            if (d.status === 'WARNING') return [255, 145, 0, 255]; // 네온 앰버 오렌지
            return [0, 102, 255, 255]; // 일렉트릭 블루
          },
          getTargetColor: d => {
            if (d.status === 'DOWN') return [255, 80, 80, 255];
            if (d.status === 'WARNING') return [255, 180, 0, 255];
            return [0, 220, 255, 255]; // 네온 사이안
          },
          getWidth: d => {
            if (d.linkType === 'BACKBONE_100G') return 5.5;
            if (d.linkType === 'METRO_RING_40G') return 3.8;
            return 2.5;
          },
          widthMinPixels: 2.5, // 줌아웃해도 최소 2.5픽셀 코어 보장
          getHeight: 0.42, // 볼록한 3D 포물선 곡선
          pickable: true,
          onHover: info => {
            if (info.object) {
              setHoverInfo({
                x: info.x,
                y: info.y,
                object: info.object,
                type: 'edge',
              });
            } else {
              setHoverInfo(null);
            }
          },
        })
      );
    }

    // [Layer B] 서머리 노드 (전국 시도 & 국사 클러스터 3D Column)
    if (filteredSummaryNodes.length > 0) {
      const isProvince = topologyData.currentLevel === 'PROVINCE';

      // 펄스 링 (심각 경보 지역 강조)
      layers.push(
        new ScatterplotLayer<RegionSummaryNode>({
          id: 'summary-pulse-rings',
          data: filteredSummaryNodes.filter(s => s.highestSeverity === 'CRITICAL' || s.highestSeverity === 'MAJOR'),
          getPosition: d => [d.lng, d.lat, 0],
          getRadius: isProvince ? 24000 : 2800,
          getFillColor: d => d.highestSeverity === 'CRITICAL' ? [239, 68, 68, 60] : [249, 115, 22, 50],
          getLineColor: d => d.highestSeverity === 'CRITICAL' ? [239, 68, 68, 220] : [249, 115, 22, 200],
          stroked: true,
          lineWidthMinPixels: 2,
          pickable: false,
        })
      );

      // 3D 4각 통신국사/권역 서머리 빌딩 블록 (Square Chassis Block)
      layers.push(
        new ColumnLayer<RegionSummaryNode>({
          id: 'summary-3d-columns',
          data: filteredSummaryNodes,
          getPosition: d => [d.lng, d.lat],
          getElevation: d => {
            // 높이: 경보 수 및 총 장비 수 반영
            const alarmWeight = (d.criticalCount * 3 + d.majorCount * 2 + d.minorCount) * 1500;
            if (isProvince) {
              return 15000 + alarmWeight + d.nodeCount * 400;
            }
            return 2500 + alarmWeight + d.nodeCount * 250;
          },
          getFillColor: d => getSeverityColor(d.highestSeverity),
          radius: isProvince ? 14000 : 1500,
          diskResolution: 4, // 원통형 대신 4각형 직육면체 블록
          angle: 45, // 축 정렬된 4각 큐브
          extruded: true,
          stroked: true,
          getLineColor: [255, 255, 255, 160],
          lineWidthMinPixels: 2,
          pickable: true,
          onClick: info => {
            if (info.object) {
              onSelectNode(info.object);
              // 서머리 노드 클릭 시 해당 위치로 줌인 (시도 -> 국사, 국사 -> 상세 장비)
              if (mapRef.current) {
                const targetZoom = isProvince ? 9.5 : 13.5;
                mapRef.current.flyTo({
                  center: [info.object.lng, info.object.lat],
                  zoom: targetZoom,
                  pitch: 55,
                  duration: 1500,
                });
              }
            }
          },
          onHover: info => {
            if (info.object) {
              setHoverInfo({
                x: info.x,
                y: info.y,
                object: info.object,
                type: 'summary',
              });
            } else {
              setHoverInfo(null);
            }
          },
        })
      );

      // 3D 텍스트 라벨 (서머리 노드 - 규칙 적용)
      layers.push(
        new TextLayer<RegionSummaryNode>({
          id: 'summary-text-labels',
          data: filteredSummaryNodes,
          getPosition: d => [d.lng, d.lat, isProvince ? 22000 : 4200],
          getText: d => {
            const parts: string[] = [];
            // 지역명/국사명
            if (labelConfig.showRegion || labelConfig.showName) {
              parts.push(d.name);
            }
            // 우편번호
            if (labelConfig.showPostalCode && d.postalCodePrefix) {
              parts.push(`[${d.postalCodePrefix}]`);
            }

            // 하단 상태 라인 (경보, 장비수, 메트릭스)
            const subParts: string[] = [];
            if (labelConfig.showAlarm) {
              const alarmStr = d.criticalCount > 0 ? `CRIT ${d.criticalCount}` : (d.majorCount > 0 ? `WARN ${d.majorCount}` : 'OK');
              subParts.push(alarmStr);
            }
            subParts.push(`${d.nodeCount}대`);
            if (labelConfig.showMetrics && d.totalTrafficGbps) {
              subParts.push(`${d.totalTrafficGbps}G`);
            }

            const header = parts.join(' ');
            const sub = subParts.length > 0 ? `[${subParts.join(' · ')}]` : '';
            return header ? (sub ? `${header}\n${sub}` : header) : sub;
          },
          getSize: isProvince ? 15 : 13,
          getColor: [255, 255, 255, 255],
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'bottom',
          billboard: true,
          fontFamily: 'Pretendard, -apple-system, sans-serif',
          fontWeight: 700,
          background: true,
          getBackgroundColor: [15, 23, 42, 210],
          backgroundPadding: [6, 4, 6, 4],
        })
      );
    }

    // [Layer C] 상세 개별 장비 노드 (Zoom >= 11.5)
    if (filteredDetailedNodes.length > 0) {
      // 펄스 링 (CRITICAL 장비)
      layers.push(
        new ScatterplotLayer<NetworkNode>({
          id: 'device-pulse-rings',
          data: filteredDetailedNodes.filter(d => d.status === 'CRITICAL'),
          getPosition: d => [d.lng, d.lat, 0],
          getRadius: 120,
          getFillColor: [239, 68, 68, 70],
          getLineColor: [239, 68, 68, 240],
          stroked: true,
          lineWidthMinPixels: 2,
          pickable: false,
        })
      );

      // 3D 4각형 네트워크 장비 섀시 (Square 19-inch Rack Chassis)
      layers.push(
        new ColumnLayer<NetworkNode>({
          id: 'device-3d-columns',
          data: filteredDetailedNodes,
          getPosition: d => [d.lng, d.lat],
          getElevation: d => d.altitude * 1.8,
          getFillColor: d => getSeverityColor(d.status),
          radius: 45,
          diskResolution: 4, // 4각형 네트워크 장비 박스 모양
          angle: 45, // 반듯한 4각 직육면체 섀시 정렬
          extruded: true,
          stroked: true,
          getLineColor: [255, 255, 255, 210], // 메탈 섀시 외곽선 강조
          lineWidthMinPixels: 1.5,
          pickable: true,
          onClick: info => {
            if (info.object) {
              onSelectNode(info.object);
            }
          },
          onHover: info => {
            if (info.object) {
              setHoverInfo({
                x: info.x,
                y: info.y,
                object: info.object,
                type: 'device',
              });
            } else {
              setHoverInfo(null);
            }
          },
        })
      );

      // [동일 위치 국사 밀집 장비 처리 규칙]
      // 동일 국사에 여러 장비가 함께 배치된 경우 국사 통합 헤더 뱃지 렌더링
      if (labelConfig.coLocationMode === 'SMART_STATION_GROUP') {
        // 국사별 장비 맵 집계
        const stationGroups = new Map<string, NetworkNode[]>();
        filteredDetailedNodes.forEach(n => {
          const list = stationGroups.get(n.postalCode) || [];
          list.push(n);
          stationGroups.set(n.postalCode, list);
        });

        const stationHeaders: { name: string; postalCode: string; count: number; lat: number; lng: number; maxAlt: number }[] = [];
        stationGroups.forEach((group, pCode) => {
          if (group.length > 1) {
            const first = group[0];
            const avgLat = group.reduce((s, g) => s + g.lat, 0) / group.length;
            const avgLng = group.reduce((s, g) => s + g.lng, 0) / group.length;
            const maxAlt = Math.max(...group.map(g => g.altitude * 1.8));
            stationHeaders.push({
              name: first.stationName,
              postalCode: pCode,
              count: group.length,
              lat: avgLat,
              lng: avgLng,
              maxAlt,
            });
          }
        });

        if (stationHeaders.length > 0 && labelConfig.showRegion) {
          layers.push(
            new TextLayer({
              id: 'station-group-header-labels',
              data: stationHeaders,
              getPosition: d => [d.lng, d.lat, d.maxAlt + 110], // 장비들 최상단 상공에 띄움
              getText: d => `POP: ${d.name} (${d.count}대 수용)${labelConfig.showPostalCode ? ` · ${d.postalCode}` : ''}`,
              getSize: 14,
              getColor: [56, 189, 248, 255],
              getTextAnchor: 'middle',
              getAlignmentBaseline: 'bottom',
              billboard: true,
              fontFamily: 'Pretendard, -apple-system, sans-serif',
              fontWeight: 800,
              background: true,
              getBackgroundColor: [15, 23, 42, 230],
              backgroundPadding: [8, 4, 8, 4],
            })
          );
        }
      }

      // 3D 장비별 텍스트 라벨 (사용자 규칙 반영)
      layers.push(
        new TextLayer<NetworkNode>({
          id: 'device-text-labels',
          data: filteredDetailedNodes,
          getPosition: d => [d.lng, d.lat, d.altitude * 1.8 + 20],
          getText: d => {
            const lines: string[] = [];

            // 라인 1: 장비 식별자
            let nameStr = '';
            if (labelConfig.coLocationMode === 'SMART_STATION_GROUP') {
              // 밀집 스마트 모드: 간결한 롤/슬롯명 위주로 표시하여 겹침 방지
              const roleSuffix = d.name.split(' ').slice(-1)[0] || d.name;
              nameStr = labelConfig.showName ? roleSuffix : '';
            } else {
              // 전체 표시 모드
              nameStr = labelConfig.showName ? d.name : '';
            }

            // 경보 상태
            if (labelConfig.showAlarm && d.status !== 'NORMAL') {
              nameStr = nameStr ? `[${d.status}] ${nameStr}` : `[${d.status}]`;
            }
            if (nameStr) lines.push(nameStr);

            // 라인 2: IP 주소 및 우편번호
            const metaParts: string[] = [];
            if (labelConfig.showIp) metaParts.push(d.ipAddress);
            if (labelConfig.showPostalCode) metaParts.push(d.postalCode);
            if (metaParts.length > 0) lines.push(metaParts.join(' '));

            // 라인 3: 메트릭스 (트래픽 / CPU)
            if (labelConfig.showMetrics) {
              lines.push(`CPU:${d.metrics.cpuPercent}% · ${d.metrics.trafficGbps}G`);
            }

            return lines.join('\n') || d.name;
          },
          getSize: 12,
          getColor: [241, 245, 249, 255],
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'bottom',
          billboard: true,
          fontFamily: 'Pretendard, -apple-system, sans-serif',
          fontWeight: 600,
          background: true,
          getBackgroundColor: [15, 23, 42, 220],
          backgroundPadding: [4, 2, 4, 2],
        })
      );
    }

    // [Layer D] 선택된 노드 하이라이트 레이어
    if (selectedNode) {
      layers.push(
        new ScatterplotLayer({
          id: 'selected-node-highlight',
          data: [selectedNode],
          getPosition: (d: any) => [d.lng, d.lat, 0],
          getRadius: 'level' in selectedNode ? (selectedNode.level === 'PROVINCE' ? 32000 : 3500) : 180,
          getFillColor: [6, 182, 212, 80],
          getLineColor: [56, 189, 248, 255],
          stroked: true,
          lineWidthMinPixels: 3,
          pickable: false,
        })
      );
    }

    overlayRef.current.setProps({ layers });
  }, [allNodes, allEdges, currentZoom, filterSeverity, getSeverityColor, onSelectNode, selectedNode, labelConfig]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* MapLibre WebGL Canvas Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* 줌 레벨 인디케이터 (하단 우측) */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          pointerEvents: 'none',
          padding: '6px 14px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 8,
          fontSize: 12,
          color: '#94a3b8',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span>
          줌 레벨: <strong style={{ color: '#38bdf8' }}>{currentZoom.toFixed(1)}</strong>
        </span>
        <span>•</span>
        <span>
          표시 모드:{' '}
          <strong style={{ color: '#10b981' }}>
            {currentZoom < 7.8
              ? '전국 광역시도 서머리'
              : currentZoom < 11.5
              ? '통신국사/우편번호 서머리'
              : '상세 개별 장비 및 물리 링크'}
          </strong>
        </span>
      </div>

      {/* 툴팁 오버레이 */}
      {hoverInfo && (
        <div
          style={{
            position: 'absolute',
            left: hoverInfo.x + 12,
            top: hoverInfo.y + 12,
            pointerEvents: 'none',
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#f8fafc',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            fontSize: 13,
            maxWidth: 320,
            backdropFilter: 'blur(10px)',
          }}
        >
          {hoverInfo.type === 'summary' && (
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 14, color: '#38bdf8', marginBottom: 4 }}>
                {hoverInfo.object.name}
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>
                우편번호 대역: {hoverInfo.object.postalCodePrefix}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, fontSize: 12 }}>
                <div>총 장비: <strong>{hoverInfo.object.nodeCount}대</strong></div>
                <div>트래픽: <strong>{hoverInfo.object.totalTrafficGbps} Gbps</strong></div>
                <div style={{ color: '#ef4444' }}>Critical: <strong>{hoverInfo.object.criticalCount}</strong></div>
                <div style={{ color: '#f97316' }}>Major: <strong>{hoverInfo.object.majorCount}</strong></div>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: '#64748b' }}>
                클릭 시 해당 권역으로 3D 줌인합니다.
              </div>
            </div>
          )}

          {hoverInfo.type === 'device' && (
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 14, color: '#38bdf8', marginBottom: 2 }}>
                {hoverInfo.object.name}
              </div>
              <div style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 4 }}>
                {hoverInfo.object.ipAddress} ({hoverInfo.object.type})
              </div>
              <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                우편번호: [{hoverInfo.object.postalCode}] {hoverInfo.object.address}
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 12, marginBottom: 4 }}>
                <div>상태: <span style={{ fontWeight: 600, color: hoverInfo.object.status === 'CRITICAL' ? '#ef4444' : '#10b981' }}>{hoverInfo.object.status}</span></div>
                <div>CPU: <strong>{hoverInfo.object.metrics.cpuPercent}%</strong></div>
                <div>트래픽: <strong>{hoverInfo.object.metrics.trafficGbps}G</strong></div>
              </div>
              {hoverInfo.object.alarms.length > 0 && (
                <div style={{ marginTop: 4, color: '#ef4444', fontSize: 11, borderTop: '1px solid rgba(239,68,68,0.2)', paddingTop: 4 }}>
                  🚨 {hoverInfo.object.alarms[0].title}
                </div>
              )}
            </div>
          )}

          {hoverInfo.type === 'edge' && (
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 13, color: '#38bdf8', marginBottom: 4 }}>
                {hoverInfo.object.linkType} 링크
              </div>
              <div style={{ fontSize: 12, marginBottom: 2 }}>
                상태: <span style={{ color: hoverInfo.object.status === 'DOWN' ? '#ef4444' : '#10b981', fontWeight: 600 }}>{hoverInfo.object.status}</span>
              </div>
              <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                대역폭: {hoverInfo.object.bandwidthGbps} Gbps (사용률 {hoverInfo.object.trafficUtilPercent}%)
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                지연시간: {hoverInfo.object.latencyMs} ms
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
