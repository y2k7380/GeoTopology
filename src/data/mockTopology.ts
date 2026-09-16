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
  // 3. [전국 산악 통신 중계국사망 (Mountain Repeater Stations)]
  // 통신 3사 및 국가자가망 산악 정상 무선 중계 거점 14개소
  const MOUNTAIN_REPEATER_STATIONS = [
    { name: '설악산대청봉중계국사', mountain: '설악산', postalCode: '25001', province: '강원특별자치도', cityDistrict: '양양군', lat: 38.1194, lng: 128.4656, elevation: 1708, linkedPostal: '25457' },
    { name: '지리산천왕봉중계국사', mountain: '지리산', postalCode: '52201', province: '경상남도', cityDistrict: '산청군', lat: 35.3372, lng: 128.2831, elevation: 1915, linkedPostal: '51435' },
    { name: '한라산백록담중계국사', mountain: '한라산', postalCode: '63001', province: '제주특별자치도', cityDistrict: '서귀포시', lat: 33.3617, lng: 126.5332, elevation: 1950, linkedPostal: '63122' },
    { name: '북한산백운대중계소', mountain: '북한산', postalCode: '01001', province: '서울특별시', cityDistrict: '강북구', lat: 37.6586, lng: 126.9781, elevation: 836, linkedPostal: '03186' },
    { name: '관악산연주대중계국사', mountain: '관악산', postalCode: '08701', province: '서울특별시', cityDistrict: '관악구', lat: 37.4444, lng: 126.9639, elevation: 629, linkedPostal: '06611' },
    { name: '용문산통신중계소', mountain: '용문산', postalCode: '12501', province: '경기도', cityDistrict: '양평군', lat: 37.5558, lng: 127.5458, elevation: 1157, linkedPostal: '13494' },
    { name: '치악산비로봉중계소', mountain: '치악산', postalCode: '26401', province: '강원특별자치도', cityDistrict: '원주시', lat: 37.3639, lng: 128.0556, elevation: 1288, linkedPostal: '26464' },
    { name: '태백산장군봉중계국사', mountain: '태백산', postalCode: '26001', province: '강원특별자치도', cityDistrict: '태백시', lat: 37.0983, lng: 128.9172, elevation: 1567, linkedPostal: '37666' },
    { name: '계룡산천황봉중계국사', mountain: '계룡산', postalCode: '32001', province: '충청남도', cityDistrict: '계룡시', lat: 36.3389, lng: 127.2069, elevation: 845, linkedPostal: '34141' },
    { name: '속리산천왕봉중계소', mountain: '속리산', postalCode: '28901', province: '충청북도', cityDistrict: '보은군', lat: 36.5333, lng: 127.8333, elevation: 1058, linkedPostal: '30151' },
    { name: '덕유산향적봉중계국사', mountain: '덕유산', postalCode: '55501', province: '전북특별자치도', cityDistrict: '무주군', lat: 35.8603, lng: 127.7472, elevation: 1614, linkedPostal: '54994' },
    { name: '팔공산비로봉중계국사', mountain: '팔공산', postalCode: '41001', province: '대구광역시', cityDistrict: '동구', lat: 35.9867, lng: 128.6989, elevation: 1193, linkedPostal: '42194' },
    { name: '무등산서석대중계소', mountain: '무등산', postalCode: '61001', province: '광주광역시', cityDistrict: '동구', lat: 35.1389, lng: 126.9889, elevation: 1187, linkedPostal: '61947' },
    { name: '금정산고당봉중계소', mountain: '금정산', postalCode: '46201', province: '부산광역시', cityDistrict: '금정구', lat: 35.2789, lng: 129.0558, elevation: 801, linkedPostal: '48058' },
  ];

  const mountainCoreNodes: NetworkNode[] = [];

  MOUNTAIN_REPEATER_STATIONS.forEach((mtn, mtnIdx) => {
    const baseAlt = Math.round(mtn.elevation * 0.35 + 150); // 산 정상 해발 고도 반영
    const mtnDevices = [
      { role: 'CORE_ROUTER' as const, suffix: 'MW01', model: 'Ericsson MINI-LINK 6600', vendor: 'Ericsson', alt: baseAlt + 60, roleName: '마이크로웨이브 송수신기' },
      { role: 'AGGREGATION_ROUTER' as const, suffix: 'AR01', model: 'Cisco NCS 540 Rugged', vendor: 'Cisco', alt: baseAlt + 30, roleName: '내환경 산악 라우터' },
      { role: 'DIST_SWITCH' as const, suffix: 'RTU01', model: 'Moxa EDS-G512E', vendor: 'Moxa', alt: baseAlt, roleName: '고지대 환경감시 제어기' },
    ];

    const mtnStationNodes: NetworkNode[] = [];

    mtnDevices.forEach((dev, devIdx) => {
      const nodeId = `NODE_${mtn.postalCode}_${dev.suffix}`;
      const offsetLat = (devIdx - 1) * 0.0005;
      const offsetLng = (devIdx % 2 === 0 ? 1 : -1) * 0.0006;

      // 설악산과 지리산 마이크로웨이브 링크에 기상 악화(돌풍/폭설) 경보 시뮬레이션
      let status: AlarmSeverity = 'NORMAL';
      const alarms: AlarmItem[] = [];

      if (mtn.postalCode === '25001' && dev.suffix === 'MW01') {
        status = 'MAJOR';
        alarms.push({
          id: `ALM_${nodeId}_01`,
          severity: 'MAJOR',
          code: 'ALM_MW_FADING',
          title: 'Microwave Rain/Snow Fading',
          description: '설악산 정상 기상 악화(돌풍/폭설)로 마이크로웨이브 수신레벨(RSL) 15dB 저하',
          timestamp: '2026-09-16 17:10:00',
        });
      } else if (mtn.postalCode === '52201' && dev.suffix === 'AR01') {
        status = 'MINOR';
        alarms.push({
          id: `ALM_${nodeId}_02`,
          severity: 'MINOR',
          code: 'ALM_SOLAR_LOW',
          title: 'Solar Battery Level Warning',
          description: '지리산 천왕봉 태양광 보조 배터리 충전 전압 저하 (흐린 날씨)',
          timestamp: '2026-09-16 16:50:00',
        });
      }

      const node: NetworkNode = {
        id: nodeId,
        name: `${mtn.name} [${mtn.mountain}] ${dev.suffix}`,
        type: dev.role,
        lat: mtn.lat + offsetLat,
        lng: mtn.lng + offsetLng,
        altitude: dev.alt,
        status,
        postalCode: mtn.postalCode,
        province: mtn.province,
        cityDistrict: mtn.cityDistrict,
        address: `${mtn.province} ${mtn.cityDistrict} ${mtn.mountain} 정상 (${mtn.name})`,
        stationName: `${mtn.name} (해발 ${mtn.elevation}m)`,
        rackLocation: `MtnShelter-R01-Slot${devIdx + 1}`,
        ipAddress: `10.88.${mtnIdx + 1}.${devIdx + 1}`,
        vendor: dev.vendor,
        model: dev.model,
        metrics: {
          cpuPercent: Math.floor(20 + Math.random() * 45),
          memoryPercent: Math.floor(35 + Math.random() * 35),
          tempCelsius: Math.floor(12 + Math.random() * 18), // 산 정상은 기온이 낮음
          trafficGbps: Number((Math.random() * 35 + 8).toFixed(1)),
          portCount: 24,
          activePorts: 16,
        },
        alarms,
      };

      nodes.push(node);
      mtnStationNodes.push(node);
      if (dev.suffix === 'MW01') {
        mountainCoreNodes.push(node);
      }
    });

    // 산악 국사 내부 인터링크
    for (let i = 0; i < mtnStationNodes.length - 1; i++) {
      const src = mtnStationNodes[i];
      const tgt = mtnStationNodes[i + 1];
      edges.push({
        id: `EDGE_MTN_INTRA_${src.id}_${tgt.id}`,
        source: src.id,
        target: tgt.id,
        sourceCoordinates: [src.lng, src.lat],
        targetCoordinates: [tgt.lng, tgt.lat],
        linkType: 'DIST_10G',
        status: 'UP',
        bandwidthGbps: 10,
        trafficUtilPercent: Math.floor(30 + Math.random() * 40),
        latencyMs: 0.35,
        packetLossPercent: 0,
        alarms: [],
      });
    }

    // 산악 중계소 <-> 인근 평지 도심 국사 간 고주파 무선 마이크로웨이브 백본 링크
    const mainStationNode = coreNodes.find(n => n.postalCode === mtn.linkedPostal);
    const mtnMwNode = mtnStationNodes.find(n => n.name.includes('MW01'));
    if (mainStationNode && mtnMwNode) {
      edges.push({
        id: `EDGE_MW_${mtnMwNode.id}_${mainStationNode.id}`,
        source: mtnMwNode.id,
        target: mainStationNode.id,
        sourceCoordinates: [mtnMwNode.lng, mtnMwNode.lat],
        targetCoordinates: [mainStationNode.lng, mainStationNode.lat],
        linkType: 'METRO_RING_40G',
        status: mtnMwNode.status === 'MAJOR' ? 'WARNING' : 'UP',
        bandwidthGbps: 40,
        trafficUtilPercent: Math.floor(45 + Math.random() * 40),
        latencyMs: Number((1.2 + Math.random() * 2.0).toFixed(2)),
        packetLossPercent: mtnMwNode.status === 'MAJOR' ? 1.5 : 0,
        alarms: mtnMwNode.status === 'MAJOR' ? [
          {
            id: `ALM_MW_EDGE_${mtnIdx}`,
            severity: 'MAJOR',
            title: 'Wireless Backbone Degradation',
            code: 'ALM_LINK_DEG',
            timestamp: '2026-09-16 17:11:00',
            description: `${mtnMwNode.stationName} ~ ${mainStationNode.stationName} 무선 마이크로웨이브 감쇄 발생`,
          }
        ] : [],
      });
    }
  });

  // 4. 백두대간 및 주요 산맥을 잇는 산악 무선 백본 링 (Mountain Wireless Backbone Ring)
  // 북한산 - 용문산 - 설악산 - 치악산 - 태백산 - 속리산 - 덕유산 - 지리산
  const mtnRingPairs = [
    { srcName: '북한산', tgtName: '용문산' },
    { srcName: '용문산', tgtName: '설악산' },
    { srcName: '설악산', tgtName: '치악산' },
    { srcName: '치악산', tgtName: '태백산' },
    { srcName: '태백산', tgtName: '속리산' },
    { srcName: '속리산', tgtName: '팔공산' },
    { srcName: '팔공산', tgtName: '지리산' },
    { srcName: '지리산', tgtName: '무등산' },
    { srcName: '속리산', tgtName: '계룡산' },
    { srcName: '계룡산', tgtName: '관악산' },
    { srcName: '관악산', tgtName: '북한산' },
  ];

  mtnRingPairs.forEach(pair => {
    const srcNode = mountainCoreNodes.find(n => n.name.includes(pair.srcName));
    const tgtNode = mountainCoreNodes.find(n => n.name.includes(pair.tgtName));
    if (srcNode && tgtNode) {
      edges.push({
        id: `EDGE_MTN_RING_${srcNode.id}_${tgtNode.id}`,
        source: srcNode.id,
        target: tgtNode.id,
        sourceCoordinates: [srcNode.lng, srcNode.lat],
        targetCoordinates: [tgtNode.lng, tgtNode.lat],
        linkType: 'METRO_RING_40G',
        status: (srcNode.status === 'MAJOR' || tgtNode.status === 'MAJOR') ? 'WARNING' : 'UP',
        bandwidthGbps: 40,
        trafficUtilPercent: Math.floor(40 + Math.random() * 35),
        latencyMs: Number((2.0 + Math.random() * 2.5).toFixed(2)),
        packetLossPercent: 0,
        alarms: [],
      });
    }
  });

  return { nodes, edges };
}
