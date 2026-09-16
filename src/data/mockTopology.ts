import type { NetworkNode, NetworkEdge, AlarmItem, AlarmSeverity } from '../types/topology';
import { KOREA_POSTAL_DIRECTORY } from './koreaPostalData';

// 경보 샘플 템플릿
const ALARM_TEMPLATES = [
  { severity: 'CRITICAL' as AlarmSeverity, code: 'ALM_OPT_LOS', title: 'Optical Loss of Signal', desc: '100G DWDM Trunk 광신호 전면 손실 발생' },
  { severity: 'CRITICAL' as AlarmSeverity, code: 'ALM_BGP_DOWN', title: 'BGP Peer Session Down', desc: 'Core 백본 BGP 이중화 세션 끊김' },
  { severity: 'MAJOR' as AlarmSeverity, code: 'ALM_PORT_FLAP', title: 'Interface Link Flapping', desc: '10G 이더넷 포트 지속적 링크 플래핑 발생' },
  { severity: 'MAJOR' as AlarmSeverity, code: 'ALM_HIGH_TEMP', title: 'Chassis Temperature High', desc: '섀시 내부 온도 기준치(65°C) 초과' },
  { severity: 'MINOR' as AlarmSeverity, code: 'ALM_FAN_WARN', title: 'Fan Tray 2 Speed Degradation', desc: '냉각 팬 회전수 이상 감지 (RPM 저하)' },
  { severity: 'MINOR' as AlarmSeverity, code: 'ALM_UTIL_HIGH', title: 'Bandwidth Threshold 80%', desc: '피크 트래픽 80% 임계치 도달' },
];

export function generateInitialTopology(): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];

  // 1. 각 통신 국사마다 3~6개의 세부 네트워크 장비 노드 생성
  KOREA_POSTAL_DIRECTORY.forEach((station, stationIdx) => {
    const devicesInStation = [
      { role: 'CORE_ROUTER' as const, suffix: 'CR01', model: 'Cisco 8808', vendor: 'Cisco', alt: 180 },
      { role: 'AGGREGATION_ROUTER' as const, suffix: 'AR01', model: 'Juniper PTX10001', vendor: 'Juniper', alt: 140 },
      { role: 'OPTICAL_MUX' as const, suffix: 'ROADM01', model: 'Nokia 1830 PSS', vendor: 'Nokia', alt: 110 },
      { role: 'DIST_SWITCH' as const, suffix: 'DS01', model: 'Arista 7280R3', vendor: 'Arista', alt: 80 },
      { role: 'ACCESS_SWITCH' as const, suffix: 'AS01', model: 'Dasan V5824G', vendor: 'Dasan Networks', alt: 50 },
    ];

    const stationNodes: NetworkNode[] = [];

    devicesInStation.forEach((dev, devIdx) => {
      const nodeId = `NODE_${station.postalCode}_${dev.suffix}`;
      
      // 장비별 지리적 위치 미세 분산 (국사 중심에서 수십 미터 반경으로 3D 분산)
      const offsetLat = (devIdx - 2) * 0.0006;
      const offsetLng = ((devIdx % 2 === 0 ? 1 : -1) * (devIdx + 1)) * 0.0007;

      // 특정 주요 국사 및 장비에 현실적인 경보 부여
      const alarms: AlarmItem[] = [];
      let status: AlarmSeverity = 'NORMAL';

      // 강남(06234), 판교(13494), 센텀(48058), 대전(34141), 세종(30151) 등에 경보 주입
      if (station.postalCode === '06234' && dev.suffix === 'CR01') {
        status = 'CRITICAL';
        alarms.push({
          id: `ALM_${nodeId}_01`,
          severity: 'CRITICAL',
          code: ALARM_TEMPLATES[0].code,
          title: ALARM_TEMPLATES[0].title,
          description: ALARM_TEMPLATES[0].desc,
          timestamp: '2026-09-16 16:42:10',
        });
      } else if (station.postalCode === '13494' && dev.suffix === 'AR01') {
        status = 'MAJOR';
        alarms.push({
          id: `ALM_${nodeId}_02`,
          severity: 'MAJOR',
          code: ALARM_TEMPLATES[2].code,
          title: ALARM_TEMPLATES[2].title,
          description: ALARM_TEMPLATES[2].desc,
          timestamp: '2026-09-16 16:55:04',
        });
      } else if (station.postalCode === '48058' && dev.suffix === 'ROADM01') {
        status = 'CRITICAL';
        alarms.push({
          id: `ALM_${nodeId}_03`,
          severity: 'CRITICAL',
          code: ALARM_TEMPLATES[1].code,
          title: ALARM_TEMPLATES[1].title,
          description: ALARM_TEMPLATES[1].desc,
          timestamp: '2026-09-16 17:02:18',
        });
      } else if (station.postalCode === '34141' && dev.suffix === 'DS01') {
        status = 'MINOR';
        alarms.push({
          id: `ALM_${nodeId}_04`,
          severity: 'MINOR',
          code: ALARM_TEMPLATES[4].code,
          title: ALARM_TEMPLATES[4].title,
          description: ALARM_TEMPLATES[4].desc,
          timestamp: '2026-09-16 17:08:44',
        });
      } else if (stationIdx % 7 === 0 && devIdx === 0) {
        status = 'MAJOR';
        alarms.push({
          id: `ALM_${nodeId}_05`,
          severity: 'MAJOR',
          code: ALARM_TEMPLATES[3].code,
          title: ALARM_TEMPLATES[3].title,
          description: ALARM_TEMPLATES[3].desc,
          timestamp: '2026-09-16 16:30:12',
        });
      } else if (stationIdx % 5 === 0 && devIdx === 3) {
        status = 'MINOR';
        alarms.push({
          id: `ALM_${nodeId}_06`,
          severity: 'MINOR',
          code: ALARM_TEMPLATES[5].code,
          title: ALARM_TEMPLATES[5].title,
          description: ALARM_TEMPLATES[5].desc,
          timestamp: '2026-09-16 16:11:00',
        });
      }

      const node: NetworkNode = {
        id: nodeId,
        name: `${station.fullAddress.match(/\((.*?)\)/)?.[1] || station.cityDistrict} ${dev.suffix}`,
        type: dev.role,
        lat: station.lat + offsetLat,
        lng: station.lng + offsetLng,
        altitude: dev.alt,
        status,
        postalCode: station.postalCode,
        province: station.province,
        cityDistrict: station.cityDistrict,
        address: station.fullAddress,
        stationName: station.fullAddress.match(/\((.*?)\)/)?.[1] || station.cityDistrict,
        rackLocation: `Rack-${String.fromCharCode(65 + devIdx)}0${devIdx + 1}-Slot${(devIdx + 1) * 2}`,
        ipAddress: `10.${stationIdx + 10}.${devIdx + 1}.1`,
        vendor: dev.vendor,
        model: dev.model,
        metrics: {
          cpuPercent: Math.floor(25 + Math.random() * 55),
          memoryPercent: Math.floor(40 + Math.random() * 45),
          tempCelsius: Math.floor(38 + Math.random() * 25),
          trafficGbps: Number((Math.random() * (dev.role === 'CORE_ROUTER' ? 85 : 20) + 5).toFixed(1)),
          portCount: dev.role === 'CORE_ROUTER' ? 64 : 48,
          activePorts: dev.role === 'CORE_ROUTER' ? 52 : 36,
        },
        alarms,
      };

      nodes.push(node);
      stationNodes.push(node);
    });

    // 국사 내부 장비 간 인터링크 (Intra-station Links)
    for (let i = 0; i < stationNodes.length - 1; i++) {
      const src = stationNodes[i];
      const tgt = stationNodes[i + 1];
      edges.push({
        id: `EDGE_INTRA_${src.id}_${tgt.id}`,
        source: src.id,
        target: tgt.id,
        sourceCoordinates: [src.lng, src.lat],
        targetCoordinates: [tgt.lng, tgt.lat],
        linkType: i === 0 ? 'DIST_10G' : 'ACCESS_1G',
        status: (src.status === 'CRITICAL' || tgt.status === 'CRITICAL') ? 'DOWN' : 'UP',
        bandwidthGbps: i === 0 ? 40 : 10,
        trafficUtilPercent: Math.floor(40 + Math.random() * 45),
        latencyMs: Number((0.2 + Math.random() * 0.5).toFixed(2)),
        packetLossPercent: 0,
        alarms: [],
      });
    }
  });

  // 2. 전국 주요 코어 라우터 간 3D 백본망 (National Backbone Ring & Mesh)
  // 대표 코어 노드 선별
  const coreNodes = nodes.filter(n => n.type === 'CORE_ROUTER');
  
  // 서울(종로, 강남) - 판교 - 대전 - 세종 - 대구 - 부산 - 광주 - 전주 - 강원(원주) - 제주를 잇는 대규모 3D 백본망
  const backbonePairs = [
    // 서울-판교-대전 축
    { srcPostal: '03186', tgtPostal: '06234' }, // 광화문 <-> 강남
    { srcPostal: '06234', tgtPostal: '13494' }, // 강남 <-> 판교
    { srcPostal: '13494', tgtPostal: '30151' }, // 판교 <-> 세종
    { srcPostal: '30151', tgtPostal: '34141' }, // 세종 <-> 대전
    // 대전-대구-부산 축
    { srcPostal: '34141', tgtPostal: '42194' }, // 대전 <-> 대구
    { srcPostal: '42194', tgtPostal: '48058' }, // 대구 <-> 부산센텀
    { srcPostal: '48058', tgtPostal: '44675' }, // 부산 <-> 울산
    { srcPostal: '48058', tgtPostal: '51435' }, // 부산 <-> 창원
    // 남부-호남 축
    { srcPostal: '51435', tgtPostal: '61947' }, // 창원 <-> 광주
    { srcPostal: '61947', tgtPostal: '54994' }, // 광주 <-> 전주
    { srcPostal: '54994', tgtPostal: '34141' }, // 전주 <-> 대전
    // 서해안/인천 축
    { srcPostal: '07335', tgtPostal: '21998' }, // 여의도 <-> 송도인천
    { srcPostal: '21998', tgtPostal: '03186' }, // 송도 <-> 광화문
    // 중부/강원 축
    { srcPostal: '03186', tgtPostal: '26464' }, // 광화문 <-> 원주
    { srcPostal: '26464', tgtPostal: '25457' }, // 원주 <-> 강릉
    { srcPostal: '25457', tgtPostal: '37666' }, // 강릉 <-> 포항
    { srcPostal: '37666', tgtPostal: '42194' }, // 포항 <-> 대구
    // 제주 해저 광케이블 연계
    { srcPostal: '59724', tgtPostal: '63122' }, // 여수 <-> 제주
    { srcPostal: '61947', tgtPostal: '63565' }, // 광주 <-> 서귀포
  ];

  backbonePairs.forEach((pair, idx) => {
    const srcNode = coreNodes.find(n => n.postalCode === pair.srcPostal);
    const tgtNode = coreNodes.find(n => n.postalCode === pair.tgtPostal);

    if (srcNode && tgtNode) {
      const isCriticalPair = (srcNode.status === 'CRITICAL' && tgtNode.status === 'CRITICAL') ||
                             (srcNode.postalCode === '06234' && tgtNode.postalCode === '13494');

      edges.push({
        id: `EDGE_BB_${srcNode.id}_${tgtNode.id}`,
        source: srcNode.id,
        target: tgtNode.id,
        sourceCoordinates: [srcNode.lng, srcNode.lat],
        targetCoordinates: [tgtNode.lng, tgtNode.lat],
        linkType: 'BACKBONE_100G',
        status: isCriticalPair ? 'DOWN' : (srcNode.status === 'MAJOR' ? 'WARNING' : 'UP'),
        bandwidthGbps: 100,
        trafficUtilPercent: isCriticalPair ? 0 : Math.floor(55 + Math.random() * 38),
        latencyMs: Number((1.5 + Math.random() * 4.0).toFixed(2)),
        packetLossPercent: isCriticalPair ? 100 : 0,
        alarms: isCriticalPair ? [
          {
            id: `ALM_EDGE_${idx}`,
            severity: 'CRITICAL',
            title: '100G Fiber Cut Detected',
            code: 'ALM_TRUNK_CUT',
            timestamp: '2026-09-16 16:44:00',
            description: `${srcNode.stationName} ~ ${tgtNode.stationName} 구간 주 광선로 단선 감지됨`,
          }
        ] : [],
      });
    }
  });

  return { nodes, edges };
}
