export type AlarmSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'NORMAL';

export type DeviceType = 
  | 'CORE_ROUTER' 
  | 'AGGREGATION_ROUTER' 
  | 'DIST_SWITCH' 
  | 'ACCESS_SWITCH' 
  | 'OPTICAL_MUX' 
  | '5G_BASE_STATION';

export type LinkType = 
  | 'BACKBONE_100G' 
  | 'METRO_RING_40G' 
  | 'DIST_10G' 
  | 'ACCESS_1G';

export interface AlarmItem {
  id: string;
  severity: AlarmSeverity;
  title: string;
  code: string;
  timestamp: string;
  description: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  type: DeviceType;
  lat: number;
  lng: number;
  altitude: number; // 3D 높이 (m)
  status: AlarmSeverity;
  postalCode: string; // 5자리 우편번호 (e.g., '06234')
  province: string; // 시·도 (e.g., '서울특별시')
  cityDistrict: string; // 시·군·구 (e.g., '강남구')
  address: string; // 도로명 주소
  stationName: string; // 소속 통신국사/POP
  rackLocation: string; // 랙 위치 (e.g., 'Rack-12-Slot04')
  ipAddress: string;
  vendor: string;
  model: string;
  metrics: {
    cpuPercent: number;
    memoryPercent: number;
    tempCelsius: number;
    trafficGbps: number;
    portCount: number;
    activePorts: number;
  };
  alarms: AlarmItem[];
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  sourceCoordinates: [number, number]; // [lng, lat]
  targetCoordinates: [number, number]; // [lng, lat]
  linkType: LinkType;
  status: 'UP' | 'WARNING' | 'DOWN';
  bandwidthGbps: number;
  trafficUtilPercent: number;
  latencyMs: number;
  packetLossPercent: number;
  alarms: AlarmItem[];
}

export interface RegionSummaryNode {
  id: string;
  level: 'PROVINCE' | 'DISTRICT' | 'STATION';
  name: string;
  lat: number;
  lng: number;
  postalCodePrefix: string;
  province?: string;
  cityDistrict?: string;
  nodeCount: number;
  edgeCount: number;
  criticalCount: number;
  majorCount: number;
  minorCount: number;
  normalCount: number;
  highestSeverity: AlarmSeverity;
  totalTrafficGbps: number;
  avgCpuPercent: number;
  childNodes: NetworkNode[];
  childEdges: NetworkEdge[];
}

export interface PostalAddressItem {
  postalCode: string;
  province: string;
  cityDistrict: string;
  dongOrRoad: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

export interface LabelConfig {
  showName: boolean;       // 장비 이름 표시
  showRegion: boolean;     // 소속 국사 및 지역 표시
  showPostalCode: boolean; // 5자리 우편번호 표시
  showIp: boolean;         // IP 주소 표시
  showAlarm: boolean;      // 경보 상태/건수 배지 표시
  showMetrics: boolean;    // 트래픽/CPU 메트릭 표시
  coLocationMode: 'SMART_STATION_GROUP' | 'INDIVIDUAL_ALL'; // 동일 국사 밀집 장비 표시 규칙
}

export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  showName: true,
  showRegion: true,
  showPostalCode: false,
  showIp: true,
  showAlarm: true,
  showMetrics: false,
  coLocationMode: 'SMART_STATION_GROUP',
};

// 지도 레이어별 표시정보 옵션 처리 인터페이스
export interface LayerVisibilityConfig {
  // 🗺️ 배경 지도 요소
  showProvinceBorders: boolean;    // 시도 행정경계선 (17개 광역시도)
  showMuniBorders: boolean;        // 시군구 행정경계선 (250개 시군구)
  showHighways: boolean;           // 고속도로 및 주요 도로망
  showWaterways: boolean;          // 주요 수계/하천 (한강, 낙동강 등)
  showCityLabels: boolean;         // 도시 및 시군구 지명 라벨
  showMountainPeaks: boolean;      // 30대 명산 및 해발고도 표고점

  // 📡 관제 토폴로지 요소
  showBackboneEdges: boolean;      // 3D 백본/메트로 회선 아크 (Arc)
  showEquipmentBoxes: boolean;     // 국사/장비 섀시 (3D Box)
  showSummaryNodes: boolean;       // 광역/국사 요약 카드 (Summary Node)
  showDeviceLabels: boolean;       // 장비 텍스트 라벨 (Text Layer)
  showAlarmPulses: boolean;        // 장애 경보 펄스 링 (Pulse Circle)

  // 🎯 디테일 수준(LOD) 모드
  lodMode: 'SMART_AUTO' | 'ALWAYS_FULL'; // 스마트 자동(전국 뷰 깔끔 정돈) vs 항상 전체 표시
}

export const DEFAULT_LAYER_CONFIG: LayerVisibilityConfig = {
  showProvinceBorders: true,
  showMuniBorders: true,
  showHighways: true,
  showWaterways: true,
  showCityLabels: true,
  showMountainPeaks: true,

  showBackboneEdges: true,
  showEquipmentBoxes: true,
  showSummaryNodes: true,
  showDeviceLabels: true,
  showAlarmPulses: true,

  lodMode: 'SMART_AUTO', // 기본값: 줌아웃 시 조잡함 방지 스마트 자동 정돈
};

