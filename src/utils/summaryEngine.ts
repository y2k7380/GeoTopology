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
  PROVINCE_MAX: 6.2,   // zoom < 6.2 : 한반도 전체 및 극단적 줌아웃 시 17개 광역시도 서머리
  DISTRICT_MAX: 9.2,   // 6.2 <= zoom < 9.2 : 전국 80+ 통신국사/거점 허브 3D 블록 & 전국망 아크
  // zoom >= 9.2 : 국사 내부 상세 개별 장비(ROADM, POTN, PTN, L3, L2, 라우터) 및 세부 엣지
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
  currentZoom: number,
  lodMode: 'SMART_AUTO' | 'ALWAYS_FULL' = 'SMART_AUTO'
): ClusteredTopologyResult {
  // 사용자가 '항상 전체 표시(ALWAYS_FULL)'를 선택한 경우 줌과 상관없이 모든 장비 및 엣지 노출
  if (lodMode === 'ALWAYS_FULL') {
    return {
      currentLevel: 'DETAILED',
      summaryNodes: [],
      detailedNodes: allNodes,
      visibleEdges: allEdges,
    };
  }

  // 빠른 노드-엣지 조회를 위한 맵 구성
  const nodeEdgeCountMap = new Map<string, number>();
  const nodeEdgeListMap = new Map<string, NetworkEdge[]>();
  allEdges.forEach(edge => {
    // source
    const srcList = nodeEdgeListMap.get(edge.source) || [];
    srcList.push(edge);
    nodeEdgeListMap.set(edge.source, srcList);
    nodeEdgeCountMap.set(edge.source, (nodeEdgeCountMap.get(edge.source) || 0) + 1);

    // target
    const tgtList = nodeEdgeListMap.get(edge.target) || [];
    tgtList.push(edge);
    nodeEdgeListMap.set(edge.target, tgtList);
    nodeEdgeCountMap.set(edge.target, (nodeEdgeCountMap.get(edge.target) || 0) + 1);
  });

  // Level 1: 전국 광역시도 서머리 (Zoom < 6.2)
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

      // 소속 노드에 연결된 실제 회선 집합 계산
      const provNodeIdSet = new Set(provNodes.map(n => n.id));
      const childEdges = allEdges.filter(e => provNodeIdSet.has(e.source) || provNodeIdSet.has(e.target));

      summaryNodes.push({
        id: `SUM_PROV_${prov.code}`,
        level: 'PROVINCE',
        name: prov.name,
        province: prov.name,
        lat: prov.lat,
        lng: prov.lng,
        postalCodePrefix: prov.postalPrefix,
        nodeCount: provNodes.length,
        edgeCount: childEdges.length,
        criticalCount,
        majorCount,
        minorCount,
        normalCount,
        highestSeverity,
        totalTrafficGbps: Number(totalTraffic.toFixed(1)),
        avgCpuPercent: avgCpu,
        childNodes: provNodes,
        childEdges,
      });
    });

    // 전국 뷰에서도 백본 IP망과 광전송망(DWDM) 및 광역 메트로링이 아름답게 보이도록 설정
    const nationalEdges = allEdges.filter(
      e => e.linkType === 'BACKBONE_100G' || e.linkType === 'DWDM_OPTICAL_LAMBDA' || e.linkType === 'METRO_RING_40G'
    );

    return {
      currentLevel: 'PROVINCE',
      summaryNodes,
      detailedNodes: [],
      visibleEdges: nationalEdges,
    };
  }

  // Level 2: 시군구 및 주요 통신 국사 서머리 (6.2 <= Zoom < 9.2) - 전국 80+ 통신국사 허브
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

      // 국사 소속 장비들에 연결된 실제 엣지 계산
      const stationNodeIdSet = new Set(stationNodes.map(n => n.id));
      const childEdges = allEdges.filter(e => stationNodeIdSet.has(e.source) || stationNodeIdSet.has(e.target));

      summaryNodes.push({
        id: `SUM_STATION_${postalCode}`,
        level: 'STATION',
        name: `${first.stationName} [${postalCode}]`,
        province: first.province,
        cityDistrict: first.cityDistrict,
        lat: avgLat,
        lng: avgLng,
        postalCodePrefix: postalCode,
        nodeCount: stationNodes.length,
        edgeCount: childEdges.length,
        criticalCount,
        majorCount,
        minorCount,
        normalCount,
        highestSeverity,
        totalTrafficGbps: Number(totalTraffic.toFixed(1)),
        avgCpuPercent: avgCpu,
        childNodes: stationNodes,
        childEdges,
      });
    });

    // 국사 간 연결 엣지 (Intra 제외한 모든 전국망: DWDM, 100G Backbone, Metro 40G, Dist 10G)
    const interStationEdges = allEdges.filter(e => !e.id.startsWith('EDGE_INTRA_'));

    return {
      currentLevel: 'STATION',
      summaryNodes,
      detailedNodes: [],
      visibleEdges: interStationEdges,
    };
  }

  // Level 3: 상세 개별 장비 및 전체 엣지 (Zoom >= 9.2)
  return {
    currentLevel: 'DETAILED',
    summaryNodes: [],
    detailedNodes: allNodes,
    visibleEdges: allEdges,
  };
}
