import type { NetworkNode, NetworkEdge, AlarmItem, AlarmSeverity } from '../types/topology';
import { KOREA_POSTAL_DIRECTORY } from './koreaPostalData';

// 전국 주요 국사 장비 및 산악 중계소 토폴로지 데이터 생성기

export function generateInitialTopology(): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];

  // 1. 각 통신 국사마다 전송장비(ROADM/POTN/PTN), 스위치(L3/L2), 라우터(Core/Agg) 배치
  KOREA_POSTAL_DIRECTORY.forEach((station, stationIdx) => {
    const devicesInStation = [
      // 전송장비 군 (Transmission Optical Equipment)
      {
        role: 'OPTICAL_DWDM' as const,
        category: 'TRANSMISSION' as const,
        suffix: 'ROADM01',
        model: 'Nokia 1830 PSS-32',
        vendor: 'Nokia',
        alt: 190,
        transmissionDetails: {
          wavelengthNm: Number((1545.32 + (stationIdx % 16) * 0.8).toFixed(2)),
          opticalPowerDbm: Number((-12.5 - (stationIdx % 8) * 0.9).toFixed(1)),
          channelCount: 96,
          ringName: stationIdx < 12 ? '수도권 제1광전송링' : stationIdx < 24 ? '영남권 메트로광링' : '호남/충청 광전송망',
          laserState: 'ACTIVE' as 'ACTIVE' | 'WARNING' | 'FAIL',
        },
      },
      {
        role: 'PACKET_POTN' as const,
        category: 'TRANSMISSION' as const,
        suffix: 'POTN01',
        model: 'Cowiwer POTN-1000',
        vendor: 'Cowiwer',
        alt: 160,
        transmissionDetails: {
          wavelengthNm: Number((1550.92 + (stationIdx % 8) * 0.8).toFixed(2)),
          opticalPowerDbm: Number((-14.0 - (stationIdx % 5) * 0.7).toFixed(1)),
          channelCount: 48,
          ringName: '전국 백본 패킷광전송망(POTN)',
          laserState: 'ACTIVE' as 'ACTIVE' | 'WARNING' | 'FAIL',
        },
      },
      {
        role: 'MSPP_PTN' as const,
        category: 'TRANSMISSION' as const,
        suffix: 'PTN01',
        model: 'Ubiquoss PTN-500',
        vendor: 'Ubiquoss',
        alt: 130,
        transmissionDetails: {
          wavelengthNm: 1310.0,
          opticalPowerDbm: -11.2,
          channelCount: 16,
          ringName: '모바일 백홀 PTN망',
          laserState: 'ACTIVE' as 'ACTIVE' | 'WARNING' | 'FAIL',
        },
      },
      // 스위치 군 (Switching Equipment)
      {
        role: 'CORE_L3_SWITCH' as const,
        category: 'SWITCH' as const,
        suffix: 'CS01',
        model: 'Arista 7280R3-48YC',
        vendor: 'Arista',
        alt: 110,
        switchDetails: {
          switchingCapacityGbps: 12800,
          vlanCount: 128,
          macTableCount: 32400,
          spanningTreeState: 'STABLE' as const,
        },
      },
      {
        role: 'DIST_L3_SWITCH' as const,
        category: 'SWITCH' as const,
        suffix: 'DS01',
        model: 'Ubiquoss E6000-24X',
        vendor: 'Ubiquoss',
        alt: 85,
        switchDetails: {
          switchingCapacityGbps: 1920,
          vlanCount: 64,
          macTableCount: 16384,
          spanningTreeState: 'STABLE' as const,
        },
      },
      {
        role: 'ACCESS_L2_SWITCH' as const,
        category: 'SWITCH' as const,
        suffix: 'AS01',
        model: 'Dasan V2824G-PoE',
        vendor: 'Dasan Networks',
        alt: 60,
        switchDetails: {
          switchingCapacityGbps: 128,
          vlanCount: 32,
          macTableCount: 8192,
          spanningTreeState: 'STABLE' as const,
        },
      },
      // 라우터 군 (Routing Equipment)
      {
        role: 'CORE_ROUTER' as const,
        category: 'ROUTER' as const,
        suffix: 'CR01',
        model: 'Cisco 8808',
        vendor: 'Cisco',
        alt: 210,
      },
      {
        role: 'AGGREGATION_ROUTER' as const,
        category: 'ROUTER' as const,
        suffix: 'AR01',
        model: 'Juniper PTX10001',
        vendor: 'Juniper',
        alt: 140,
      },
    ];

    const stationNodes: NetworkNode[] = [];

    devicesInStation.forEach((dev, devIdx) => {
      const nodeId = `NODE_${station.postalCode}_${dev.suffix}`;
      
      // 장비별 지리적 위치 미세 분산 (국사 중심에서 수십 미터 반경으로 3D 분산)
      const offsetLat = (devIdx - 3) * 0.00045;
      const offsetLng = ((devIdx % 2 === 0 ? 1 : -1) * (devIdx + 1)) * 0.00055;

      // 특정 주요 국사 및 장비에 현실적인 경보 부여 (전송망 광손실, 스위치 루프 등)
      const alarms: AlarmItem[] = [];
      let status: AlarmSeverity = 'NORMAL';

      // 강남(06234) ROADM 전송장비 광신호 단선
      if (station.postalCode === '06234' && dev.suffix === 'ROADM01') {
        status = 'CRITICAL';
        alarms.push({
          id: `ALM_${nodeId}_01`,
          severity: 'CRITICAL',
          code: 'ALM_OPT_LOS',
          title: 'ROADM Optical Loss of Signal',
          description: '100G DWDM 16번 파장(1550.92nm) 주선로 광신호 전면 손실 발생',
          timestamp: '2026-09-18 14:42:10',
        });
        if (dev.transmissionDetails) {
          dev.transmissionDetails.laserState = 'FAIL';
          dev.transmissionDetails.opticalPowerDbm = -38.5;
        }
      } else if (station.postalCode === '06234' && dev.suffix === 'CR01') {
        status = 'CRITICAL';
        alarms.push({
          id: `ALM_${nodeId}_01b`,
          severity: 'CRITICAL',
          code: 'ALM_BGP_DOWN',
          title: 'Core Router BGP Session Down',
          description: '전송망 단선으로 인한 Core 백본 BGP 이중화 세션 단절',
          timestamp: '2026-09-18 14:42:12',
        });
      } else if (station.postalCode === '13494' && dev.suffix === 'CS01') {
        // 판교(13494) 코어 L3 스위치 포트 플래핑
        status = 'MAJOR';
        alarms.push({
          id: `ALM_${nodeId}_02`,
          severity: 'MAJOR',
          code: 'ALM_PORT_FLAP',
          title: 'Core Switch 100G Port Flapping',
          description: 'QSFP28 트렁크 포트 1/1/2 지속적인 링크 플래핑 발생',
          timestamp: '2026-09-18 14:55:04',
        });
      } else if (station.postalCode === '48058' && dev.suffix === 'POTN01') {
        // 센텀(48058) POTN 전송장비 수신 감도 저하
        status = 'MAJOR';
        alarms.push({
          id: `ALM_${nodeId}_03`,
          severity: 'MAJOR',
          code: 'ALM_OPT_PWR_LOW',
          title: 'POTN Optical Power Degraded',
          description: '광 감쇄 현상으로 수신 감도 임계치(-22dBm) 초과 도달',
          timestamp: '2026-09-18 15:02:18',
        });
        if (dev.transmissionDetails) {
          dev.transmissionDetails.laserState = 'WARNING';
          dev.transmissionDetails.opticalPowerDbm = -24.2;
        }
      } else if (station.postalCode === '34141' && dev.suffix === 'DS01') {
        // 대전(34141) L3 집선 스위치 고부하
        status = 'MINOR';
        alarms.push({
          id: `ALM_${nodeId}_04`,
          severity: 'MINOR',
          code: 'ALM_SWITCH_HIGH_UTIL',
          title: 'L3 Switch Traffic Peak 85%',
          description: '연구단지 백본 데이터 송출 급증으로 포트 버퍼 임계치 도달',
          timestamp: '2026-09-18 15:08:44',
        });
      } else if (stationIdx % 6 === 0 && dev.suffix === 'PTN01') {
        status = 'MINOR';
        alarms.push({
          id: `ALM_${nodeId}_05`,
          severity: 'MINOR',
          code: 'ALM_PTN_SYNC_WARN',
          title: 'PTN Clock PTP Sync Deviation',
          description: 'IEEE 1588v2 PTP 패킷 동기화 위상차 50ns 발생',
          timestamp: '2026-09-18 14:15:00',
        });
      }

      const node: NetworkNode = {
        id: nodeId,
        name: `${station.fullAddress.match(/\((.*?)\)/)?.[1] || station.cityDistrict} ${dev.suffix}`,
        type: dev.role,
        category: dev.category,
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
          cpuPercent: Math.floor(25 + Math.random() * 50),
          memoryPercent: Math.floor(40 + Math.random() * 40),
          tempCelsius: Math.floor(38 + Math.random() * 22),
          trafficGbps: Number((Math.random() * (dev.category === 'TRANSMISSION' ? 95 : dev.category === 'SWITCH' ? 45 : 65) + 8).toFixed(1)),
          portCount: dev.role === 'CORE_L3_SWITCH' ? 48 : dev.role === 'CORE_ROUTER' ? 64 : 24,
          activePorts: dev.role === 'CORE_L3_SWITCH' ? 40 : dev.role === 'CORE_ROUTER' ? 52 : 18,
        },
        alarms,
        transmissionDetails: (dev as any).transmissionDetails,
        switchDetails: (dev as any).switchDetails,
      };

      nodes.push(node);
      stationNodes.push(node);
    });

    // 국사 내부 장비 간 계층적 인터링크 (Intra-station Links: 전송장비 ➔ 코어 라우터 ➔ L3 스위치 ➔ L2 스위치)
    for (let i = 0; i < stationNodes.length - 1; i++) {
      const src = stationNodes[i];
      const tgt = stationNodes[i + 1];
      const isTransmissionLink = src.category === 'TRANSMISSION' && tgt.category === 'TRANSMISSION';
      edges.push({
        id: `EDGE_INTRA_${src.id}_${tgt.id}`,
        source: src.id,
        target: tgt.id,
        sourceCoordinates: [src.lng, src.lat],
        targetCoordinates: [tgt.lng, tgt.lat],
        linkType: isTransmissionLink ? 'DWDM_OPTICAL_LAMBDA' : (i < 4 ? 'DIST_10G' : 'ACCESS_1G'),
        status: (src.status === 'CRITICAL' || tgt.status === 'CRITICAL') ? 'DOWN' : 'UP',
        bandwidthGbps: isTransmissionLink ? 100 : (i < 4 ? 40 : 10),
        trafficUtilPercent: Math.floor(40 + Math.random() * 45),
        latencyMs: Number((0.15 + Math.random() * 0.35).toFixed(2)),
        packetLossPercent: 0,
        alarms: [],
      });
    }
  });

  // 2. 대한민국 전역 전송망(DWDM 400G), 코어 IP망(100G), 메트로 스위치링(40G) 전국망 구성
  // 대한민국 17개 시도, 80개 주요 국사 및 도서 거점 전체를 촘촘히 엮는 국가 기간망
  const nationwidePairs: Array<{ srcPostal: string; tgtPostal: string; ringName?: string }> = [
    // [A] 국가 초고속 엑스선 코어 백본망 (National Super-Backbone Cross-X Trunks)
    { srcPostal: '03186', tgtPostal: '34141', ringName: '경부 제1백본 엑스선' }, // 광화문 <-> 대전대덕
    { srcPostal: '34141', tgtPostal: '42194', ringName: '경부 제1백본 엑스선' }, // 대전대덕 <-> 대구수성
    { srcPostal: '42194', tgtPostal: '48058', ringName: '경부 제1백본 엑스선' }, // 대구수성 <-> 부산센텀
    { srcPostal: '06234', tgtPostal: '13494', ringName: '호남 제2백본 엑스선' }, // 강남 <-> 판교
    { srcPostal: '13494', tgtPostal: '30151', ringName: '호남 제2백본 엑스선' }, // 판교 <-> 세종
    { srcPostal: '30151', tgtPostal: '61947', ringName: '호남 제2백본 엑스선' }, // 세종 <-> 광주상무
    { srcPostal: '61947', tgtPostal: '59724', ringName: '호남 제2백본 엑스선' }, // 광주상무 <-> 여수
    { srcPostal: '03186', tgtPostal: '26464', ringName: '영동 제3백본 엑스선' }, // 광화문 <-> 원주
    { srcPostal: '26464', tgtPostal: '25457', ringName: '영동 제3백본 엑스선' }, // 원주 <-> 강릉
    { srcPostal: '34141', tgtPostal: '54994', ringName: '충청-호남 연계축' },   // 대전대덕 <-> 전주혁신
    { srcPostal: '42194', tgtPostal: '51435', ringName: '영남-호남 횡단축' },   // 대구수성 <-> 창원
    { srcPostal: '51435', tgtPostal: '61947', ringName: '영남-호남 횡단축' },   // 창원 <-> 광주상무

    // [B] 서울특별시 도심 환상링 (Seoul Metro Ring - 12개 국사 루프)
    { srcPostal: '03186', tgtPostal: '03925' }, // 광화문 <-> 마포상암
    { srcPostal: '03925', tgtPostal: '07335' }, // 상암 <-> 여의도
    { srcPostal: '07335', tgtPostal: '08503' }, // 여의도 <-> 금천가산
    { srcPostal: '08503', tgtPostal: '08708' }, // 가산 <-> 관악
    { srcPostal: '08708', tgtPostal: '06611' }, // 관악 <-> 서초IDC
    { srcPostal: '06611', tgtPostal: '06234' }, // 서초 <-> 강남
    { srcPostal: '06234', tgtPostal: '05551' }, // 강남 <-> 잠실
    { srcPostal: '05551', tgtPostal: '04763' }, // 잠실 <-> 한양성동
    { srcPostal: '04763', tgtPostal: '02043' }, // 한양 <-> 중랑상봉
    { srcPostal: '02043', tgtPostal: '01395' }, // 상봉 <-> 도봉창동
    { srcPostal: '01395', tgtPostal: '03186' }, // 창동 <-> 광화문

    // [C] 인천광역시 및 서부 메트로 링 (Incheon & West Metro Ring)
    { srcPostal: '07335', tgtPostal: '07505' }, // 여의도 <-> 강서마곡
    { srcPostal: '07505', tgtPostal: '14558' }, // 마곡 <-> 부천중동
    { srcPostal: '14558', tgtPostal: '21554' }, // 부천 <-> 인천시청
    { srcPostal: '21554', tgtPostal: '21998' }, // 인천시청 <-> 송도바이오
    { srcPostal: '21998', tgtPostal: '22382' }, // 송도 <-> 인천공항
    { srcPostal: '22382', tgtPostal: '22726' }, // 인천공항 <-> 청라국제
    { srcPostal: '22726', tgtPostal: '10414' }, // 청라 <-> 일산호수
    { srcPostal: '21998', tgtPostal: '15355' }, // 송도 <-> 안산스마트허브
    { srcPostal: '15355', tgtPostal: '14067' }, // 안산 <-> 안양평촌
    { srcPostal: '14067', tgtPostal: '06611' }, // 평촌 <-> 서초IDC

    // [D] 경기도 남부 첨단 반도체/IT 벨트 링 (Gyeonggi South Semiconductor Ring)
    { srcPostal: '13494', tgtPostal: '14067' }, // 판교IDC <-> 평촌스마트
    { srcPostal: '14067', tgtPostal: '16490' }, // 평촌 <-> 수원중앙
    { srcPostal: '16490', tgtPostal: '18469' }, // 수원 <-> 화성동탄
    { srcPostal: '18469', tgtPostal: '17093' }, // 동탄 <-> 용인반도체
    { srcPostal: '17093', tgtPostal: '13494' }, // 용인 <-> 판교IDC
    { srcPostal: '18469', tgtPostal: '17901' }, // 동탄 <-> 평택고덕
    { srcPostal: '17901', tgtPostal: '31156' }, // 평택 <-> 천안아산

    // [E] 경기도 북부 및 평화 번영 링 (Gyeonggi North Loop)
    { srcPostal: '03925', tgtPostal: '10414' }, // 상암 <-> 일산호수
    { srcPostal: '10414', tgtPostal: '10881' }, // 일산 <-> 파주디스플레이
    { srcPostal: '10881', tgtPostal: '11651' }, // 파주 <-> 의정부북부
    { srcPostal: '11651', tgtPostal: '01395' }, // 의정부 <-> 도봉창동
    { srcPostal: '11651', tgtPostal: '12133' }, // 의정부 <-> 남양주다산
    { srcPostal: '12133', tgtPostal: '02043' }, // 남양주 <-> 상봉통신
    { srcPostal: '12133', tgtPostal: '24249' }, // 남양주 <-> 춘천강원도청

    // [F] 서해 최북단 도서 국경 링크 (West Sea Frontier Baengnyeongdo Link)
    { srcPostal: '22382', tgtPostal: '23100', ringName: '서해 영토 방위 통신망' }, // 인천공항 <-> 백령도 (해상 마이크로웨이브 & 광케이블)

    // [G] 충청/대전/세종 중부 R&D 광역 링 (Central Chungcheong R&D Ring)
    { srcPostal: '34141', tgtPostal: '35242' }, // 대전대덕 <-> 대전둔산
    { srcPostal: '35242', tgtPostal: '30151' }, // 대전둔산 <-> 정부세종청사
    { srcPostal: '30151', tgtPostal: '32589' }, // 세종 <-> 공주백제
    { srcPostal: '32589', tgtPostal: '35015' }, // 공주 <-> 충남도청내포
    { srcPostal: '35015', tgtPostal: '31959' }, // 내포 <-> 서산대산
    { srcPostal: '31959', tgtPostal: '31434' }, // 서산 <-> 아산탕정
    { srcPostal: '31434', tgtPostal: '31156' }, // 아산탕정 <-> 천안아산
    { srcPostal: '31156', tgtPostal: '28644' }, // 천안아산 <-> 청주하이닉스
    { srcPostal: '28644', tgtPostal: '34141' }, // 청주 <-> 대전대덕
    { srcPostal: '28644', tgtPostal: '27316' }, // 청주 <-> 충주기업도시
    { srcPostal: '27316', tgtPostal: '27158' }, // 충주 <-> 제천통신
    { srcPostal: '27158', tgtPostal: '26464' }, // 제천 <-> 원주혁신

    // [H] 강원특별자치도 영동/영서 순환 링 (Gangwon Loop Ring)
    { srcPostal: '24249', tgtPostal: '24822' }, // 춘천 <-> 속초설악
    { srcPostal: '24822', tgtPostal: '25457' }, // 속초 <-> 강릉동해안
    { srcPostal: '25457', tgtPostal: '25749' }, // 강릉 <-> 동해항만
    { srcPostal: '25749', tgtPostal: '25932' }, // 동해 <-> 태백고원
    { srcPostal: '25932', tgtPostal: '27158' }, // 태백 <-> 제천
    { srcPostal: '26464', tgtPostal: '24249' }, // 원주 <-> 춘천

    // [I] 동해안 에너지망 및 울릉도/독도 심해 해저망 (East Sea, Ulleungdo & Dokdo Links)
    { srcPostal: '25749', tgtPostal: '36323' }, // 동해 <-> 울진한울원자력
    { srcPostal: '36323', tgtPostal: '37666' }, // 울진 <-> 포항제철소
    { srcPostal: '36323', tgtPostal: '40200', ringName: '동해 심해 해저 광전송망' }, // 울진 <-> 울릉도 (심해 해저 100G)
    { srcPostal: '40200', tgtPostal: '40240', ringName: '독도 영토 통신망' }, // 울릉도 <-> 독도 (영토 초고속 마이크로웨이브 & 해저선)

    // [J] 대구/경북 첨단 산업 벨트 링 (Daegu/Gyeongbuk Industrial Ring)
    { srcPostal: '42194', tgtPostal: '41911' }, // 대구수성IDC <-> 대구중앙
    { srcPostal: '41911', tgtPostal: '39281' }, // 대구중앙 <-> 구미전자산단
    { srcPostal: '39281', tgtPostal: '39512' }, // 구미 <-> 김천혁신
    { srcPostal: '39512', tgtPostal: '36691' }, // 김천 <-> 안동도청
    { srcPostal: '36691', tgtPostal: '37666' }, // 안동 <-> 포항제철소
    { srcPostal: '37666', tgtPostal: '38102' }, // 포항 <-> 경주원전
    { srcPostal: '38102', tgtPostal: '42194' }, // 경주 <-> 대구수성
    { srcPostal: '42194', tgtPostal: '42988' }, // 대구수성 <-> 대구국가산단
    { srcPostal: '42988', tgtPostal: '51435' }, // 대구국가산단 <-> 창원

    // [K] 부울경 동남권 메가 링 (Busan/Ulsan/Gyeongnam Mega Ring)
    { srcPostal: '38102', tgtPostal: '44248' }, // 경주 <-> 울산자동차
    { srcPostal: '44248', tgtPostal: '44675' }, // 울산자동차 <-> 울산석유화학
    { srcPostal: '44675', tgtPostal: '50600' }, // 울산 <-> 양산물류
    { srcPostal: '50600', tgtPostal: '48058' }, // 양산 <-> 부산센텀
    { srcPostal: '48058', tgtPostal: '47545' }, // 부산센텀 <-> 부산시청
    { srcPostal: '47545', tgtPostal: '48938' }, // 부산시청 <-> 부산항만
    { srcPostal: '48938', tgtPostal: '46726' }, // 부산항만 <-> 부산녹산산단
    { srcPostal: '46726', tgtPostal: '51000' }, // 부산녹산 <-> 김해스마트
    { srcPostal: '51000', tgtPostal: '50600' }, // 김해 <-> 양산물류
    { srcPostal: '46726', tgtPostal: '53201' }, // 부산녹산 <-> 거제대우조선
    { srcPostal: '53201', tgtPostal: '53000' }, // 거제 <-> 통영해양
    { srcPostal: '53000', tgtPostal: '52828' }, // 통영 <-> 진주항공
    { srcPostal: '52828', tgtPostal: '51435' }, // 진주 <-> 창원기계
    { srcPostal: '51435', tgtPostal: '51000' }, // 창원 <-> 김해

    // [L] 호남/전라권 순환 링 (Honam/Jeolla Loop Ring)
    { srcPostal: '54994', tgtPostal: '54000' }, // 전주혁신 <-> 군산새만금
    { srcPostal: '54000', tgtPostal: '54500' }, // 군산 <-> 익산국가식품
    { srcPostal: '54500', tgtPostal: '61947' }, // 익산 <-> 광주상무
    { srcPostal: '61947', tgtPostal: '61011' }, // 광주상무 <-> 광주AI첨단
    { srcPostal: '61947', tgtPostal: '58200' }, // 광주상무 <-> 나주에너지
    { srcPostal: '58200', tgtPostal: '58564' }, // 나주 <-> 무안남악
    { srcPostal: '58564', tgtPostal: '58600' }, // 무안 <-> 목포항만
    { srcPostal: '58600', tgtPostal: '59000' }, // 목포 <-> 해남땅끝
    { srcPostal: '59000', tgtPostal: '57900' }, // 해남 <-> 순천생태
    { srcPostal: '57900', tgtPostal: '59724' }, // 순천 <-> 여수산단
    { srcPostal: '59724', tgtPostal: '57700' }, // 여수 <-> 광양제철소
    { srcPostal: '57700', tgtPostal: '57900' }, // 광양 <-> 순천
    { srcPostal: '57700', tgtPostal: '52828' }, // 광양 <-> 진주항공 (영호남 남해안 연계)
    { srcPostal: '57900', tgtPostal: '54994' }, // 순천 <-> 전주혁신 (내륙 종단축)
    { srcPostal: '54000', tgtPostal: '35015' }, // 군산 <-> 내포홍성 (서해안 종단축)

    // [M] 남해안 & 제주 해저 광케이블망 (Jeju Submarine Optical Network)
    { srcPostal: '59000', tgtPostal: '63122', ringName: '제1 제주-육지 해저 광케이블' }, // 해남 <-> 제주시
    { srcPostal: '59724', tgtPostal: '63565', ringName: '제2 제주-육지 해저 광케이블' }, // 여수 <-> 서귀포
    { srcPostal: '48058', tgtPostal: '63565', ringName: '동남권 제주 직통 해저 광케이블' }, // 부산센텀 <-> 서귀포
    { srcPostal: '63122', tgtPostal: '63000' }, // 제주중앙 <-> 제주첨단
    { srcPostal: '63000', tgtPostal: '63565' }, // 제주첨단 <-> 서귀포해저
    { srcPostal: '63565', tgtPostal: '63122' }, // 서귀포 <-> 제주중앙 (제주도 일주 링)
  ];

  // 대표 장비 노드 선별 (전송장비, 코어 스위치, 코어 라우터)
  const coreNodes = nodes.filter(n => n.type === 'CORE_ROUTER');
  const roadmNodes = nodes.filter(n => n.type === 'OPTICAL_DWDM');
  const switchNodes = nodes.filter(n => n.type === 'CORE_L3_SWITCH');

  nationwidePairs.forEach((pair, idx) => {
    // 1) 코어 라우터 간 100G 백본 IP 링크
    const srcCore = coreNodes.find(n => n.postalCode === pair.srcPostal);
    const tgtCore = coreNodes.find(n => n.postalCode === pair.tgtPostal);
    if (srcCore && tgtCore) {
      const isCriticalPair = (srcCore.status === 'CRITICAL' && tgtCore.status === 'CRITICAL') ||
                             (srcCore.postalCode === '06234' && tgtCore.postalCode === '13494');

      edges.push({
        id: `EDGE_BB_${srcCore.id}_${tgtCore.id}`,
        source: srcCore.id,
        target: tgtCore.id,
        sourceCoordinates: [srcCore.lng, srcCore.lat],
        targetCoordinates: [tgtCore.lng, tgtCore.lat],
        linkType: 'BACKBONE_100G',
        status: isCriticalPair ? 'DOWN' : (srcCore.status === 'MAJOR' ? 'WARNING' : 'UP'),
        bandwidthGbps: 100,
        trafficUtilPercent: isCriticalPair ? 0 : Math.floor(55 + Math.random() * 38),
        latencyMs: Number((1.2 + Math.random() * 3.5).toFixed(2)),
        packetLossPercent: isCriticalPair ? 100 : 0,
        alarms: isCriticalPair ? [
          {
            id: `ALM_EDGE_${idx}`,
            severity: 'CRITICAL',
            title: '100G IP Trunk Session Down',
            code: 'ALM_TRUNK_CUT',
            timestamp: '2026-09-18 14:44:00',
            description: `${srcCore.stationName} ~ ${tgtCore.stationName} 구간 주 백본 IP 트렁크 단절`,
          }
        ] : [],
      });
    }

    // 2) 전송장비 ROADM 간 DWDM 광 파장 전송 링크 (Optical Lambda - 400G)
    const srcRoadm = roadmNodes.find(n => n.postalCode === pair.srcPostal);
    const tgtRoadm = roadmNodes.find(n => n.postalCode === pair.tgtPostal);
    if (srcRoadm && tgtRoadm) {
      const isRoadmDown = srcRoadm.status === 'CRITICAL' || tgtRoadm.status === 'CRITICAL';
      edges.push({
        id: `EDGE_DWDM_${srcRoadm.id}_${tgtRoadm.id}`,
        source: srcRoadm.id,
        target: tgtRoadm.id,
        sourceCoordinates: [srcRoadm.lng, srcRoadm.lat],
        targetCoordinates: [tgtRoadm.lng, tgtRoadm.lat],
        linkType: 'DWDM_OPTICAL_LAMBDA',
        status: isRoadmDown ? 'DOWN' : 'UP',
        bandwidthGbps: 400,
        trafficUtilPercent: isRoadmDown ? 0 : Math.floor(45 + Math.random() * 40),
        latencyMs: Number((0.6 + Math.random() * 1.5).toFixed(2)),
        packetLossPercent: isRoadmDown ? 100 : 0,
        alarms: isRoadmDown ? [
          {
            id: `ALM_OPT_LAMBDA_${idx}`,
            severity: 'CRITICAL',
            title: 'DWDM Optical Lambda Loss',
            code: 'ALM_LAMBDA_LOS',
            timestamp: '2026-09-18 14:42:15',
            description: `광 전송망 ${srcRoadm.stationName} ~ ${tgtRoadm.stationName} 파장 채널 광신호 감쇄 손실`,
          }
        ] : [],
      });
    }

    // 3) 코어 L3 스위치 간 메트로 링 스위치 링크 (Metro Ring 40G)
    const srcSwitch = switchNodes.find(n => n.postalCode === pair.srcPostal);
    const tgtSwitch = switchNodes.find(n => n.postalCode === pair.tgtPostal);
    if (srcSwitch && tgtSwitch) {
      edges.push({
        id: `EDGE_SW_METRO_${srcSwitch.id}_${tgtSwitch.id}`,
        source: srcSwitch.id,
        target: tgtSwitch.id,
        sourceCoordinates: [srcSwitch.lng, srcSwitch.lat],
        targetCoordinates: [tgtSwitch.lng, tgtSwitch.lat],
        linkType: 'METRO_RING_40G',
        status: 'UP',
        bandwidthGbps: 40,
        trafficUtilPercent: Math.floor(35 + Math.random() * 45),
        latencyMs: Number((0.5 + Math.random() * 1.2).toFixed(2)),
        packetLossPercent: 0,
        alarms: [],
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
        category: dev.role === 'DIST_SWITCH' ? 'SWITCH' : 'ROUTER',
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
