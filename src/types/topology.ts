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
