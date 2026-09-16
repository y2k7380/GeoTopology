import type { NetworkNode, NetworkEdge, RegionSummaryNode, AlarmSeverity } from '../types/topology';
import { KOREA_PROVINCES } from '../data/koreaPostalData';

// 심각도 우선순위 판정
export function getHighestSeverity(severities: AlarmSeverity[]): AlarmSeverity {
  if (severities.includes('CRITICAL')) return 'CRITICAL';
  if (severities.includes('MAJOR')) return 'MAJOR';
  if (severities.includes('MINOR')) return 'MINOR';
  return 'NORMAL';
}

// 줌 레벨 정의
export const ZOOM_THRESHOLDS = {
  PROVINCE_MAX: 7.8,   // zoom < 7.8 : 전국 시도 단위 서머리
  DISTRICT_MAX: 11.5,  // 7.8 <= zoom < 11.5 : 시군구 / 통신 국사 서머리
  // zoom >= 11.5 : 상세 개별 장비 및 세부 엣지
};

export interface ClusteredTopologyResult {
  currentLevel: 'PROVINCE' | 'STATION' | 'DETAILED';
  summaryNodes: RegionSummaryNode[];
  detailedNodes: NetworkNode[];
  visibleEdges: NetworkEdge[];
}

export function computeHierarchicalTopology(
  allNodes: NetworkNode[],
  allEdges: NetworkEdge[],
  currentZoom: number
): ClusteredTopologyResult {
  // Level 1: 전국 광역시도 서머리 (Zoom < 7.8)
  if (currentZoom < ZOOM_THRESHOLDS.PROVINCE_MAX) {
    const summaryNodes: RegionSummaryNode[] = [];

    KOREA_PROVINCES.forEach(prov => {
      const provNodes = allNodes.filter(n => n.province.includes(prov.shortName) || n.province === prov.name);
      if (provNodes.length === 0) return;

      const severities = provNodes.map(n => n.status);
      const highestSeverity = getHighestSeverity(severities);
      const criticalCount = provNodes.filter(n => n.status === 'CRITICAL').length;
      const majorCount = provNodes.filter(n => n.status === 'MAJOR').length;
      const minorCount = provNodes.filter(n => n.status === 'MINOR').length;
      const normalCount = provNodes.filter(n => n.status === 'NORMAL').length;
      const totalTraffic = provNodes.reduce((acc, cur) => acc + cur.metrics.trafficGbps, 0);
      const avgCpu = Math.round(provNodes.reduce((acc, cur) => acc + cur.metrics.cpuPercent, 0) / provNodes.length);

      summaryNodes.push({
        id: `SUM_PROV_${prov.code}`,
        level: 'PROVINCE',
        name: prov.name,
        province: prov.name,
        lat: prov.lat,
        lng: prov.lng,
        postalCodePrefix: prov.postalPrefix,
        nodeCount: provNodes.length,
        edgeCount: 0,
        criticalCount,
        majorCount,
        minorCount,
        normalCount,
        highestSeverity,
        totalTrafficGbps: Number(totalTraffic.toFixed(1)),
        avgCpuPercent: avgCpu,
        childNodes: provNodes,
        childEdges: [],
      });
    });

    // 광역 간 백본 엣지만 표시
    const backboneEdges = allEdges.filter(e => e.linkType === 'BACKBONE_100G');

    return {
      currentLevel: 'PROVINCE',
      summaryNodes,
      detailedNodes: [],
      visibleEdges: backboneEdges,
    };
  }

  // Level 2: 시군구 및 주요 통신 국사 서머리 (7.8 <= Zoom < 11.5)
  if (currentZoom < ZOOM_THRESHOLDS.DISTRICT_MAX) {
    // postalCode(국사) 기준으로 그룹핑
    const stationMap = new Map<string, NetworkNode[]>();
    allNodes.forEach(node => {
      const list = stationMap.get(node.postalCode) || [];
      list.push(node);
      stationMap.set(node.postalCode, list);
    });

    const summaryNodes: RegionSummaryNode[] = [];

    stationMap.forEach((stationNodes, postalCode) => {
      const first = stationNodes[0];
      const severities = stationNodes.map(n => n.status);
      const highestSeverity = getHighestSeverity(severities);
      const criticalCount = stationNodes.filter(n => n.status === 'CRITICAL').length;
      const majorCount = stationNodes.filter(n => n.status === 'MAJOR').length;
      const minorCount = stationNodes.filter(n => n.status === 'MINOR').length;
      const normalCount = stationNodes.filter(n => n.status === 'NORMAL').length;
      const totalTraffic = stationNodes.reduce((acc, cur) => acc + cur.metrics.trafficGbps, 0);
      const avgCpu = Math.round(stationNodes.reduce((acc, cur) => acc + cur.metrics.cpuPercent, 0) / stationNodes.length);

      // 국사 중심 좌표 (소속 노드들의 평균)
      const avgLat = stationNodes.reduce((sum, n) => sum + n.lat, 0) / stationNodes.length;
      const avgLng = stationNodes.reduce((sum, n) => sum + n.lng, 0) / stationNodes.length;

      summaryNodes.push({
        id: `SUM_STATION_${postalCode}`,
        level: 'STATION',
        name: `${first.stationName} (${postalCode})`,
        province: first.province,
        cityDistrict: first.cityDistrict,
        lat: avgLat,
        lng: avgLng,
        postalCodePrefix: postalCode,
        nodeCount: stationNodes.length,
        edgeCount: 0,
        criticalCount,
        majorCount,
        minorCount,
        normalCount,
        highestSeverity,
        totalTrafficGbps: Number(totalTraffic.toFixed(1)),
        avgCpuPercent: avgCpu,
        childNodes: stationNodes,
        childEdges: [],
      });
    });

    // 국사 간 연결 엣지 (Intra 제외한 백본 및 메트로 링)
    const interStationEdges = allEdges.filter(e => !e.id.startsWith('EDGE_INTRA_'));

    return {
      currentLevel: 'STATION',
      summaryNodes,
      detailedNodes: [],
      visibleEdges: interStationEdges,
    };
  }

  // Level 3: 상세 개별 장비 및 전체 엣지 (Zoom >= 11.5)
  return {
    currentLevel: 'DETAILED',
    summaryNodes: [],
    detailedNodes: allNodes,
    visibleEdges: allEdges,
  };
}
