export type AlarmSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'NORMAL';

export type DeviceCategory = 'ALL' | 'TRANSMISSION' | 'SWITCH' | 'ROUTER' | 'WIRELESS';

export type DeviceType = 
  | 'OPTICAL_DWDM'       // ROADM / DWDM 전송장비
  | 'PACKET_POTN'        // POTN / OTN 패킷 광전송장비
  | 'MSPP_PTN'           // PTN / MPLS-TP 전송장비
  | 'OPTICAL_MUX'        // 광 분기결합기 (Optical Mux)
  | 'CORE_L3_SWITCH'     // 백본 코어 L3 스위치
  | 'DIST_L3_SWITCH'     // 집선 L3 스위치
  | 'ACCESS_L2_SWITCH'   // 가입자 L2 스위치
  | 'DIST_SWITCH'        // 기존 호환
  | 'ACCESS_SWITCH'      // 기존 호환
  | 'CORE_ROUTER'        // 코어 라우터
  | 'AGGREGATION_ROUTER' // 집선 라우터
  | '5G_BASE_STATION';   // 5G 기지국

export type LinkType = 
  | 'DWDM_OPTICAL_LAMBDA' // 전송망 광 파장 링크 (100G/400G Lambda)
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

export interface TransmissionDetails {
  wavelengthNm: number;       // 광 파장 (예: 1550.12nm)
  opticalPowerDbm: number;    // 광 수신 레벨 (예: -14.5 dBm)
  channelCount: number;       // 지원 파장 채널수 (예: 96ch)
  ringName: string;           // 소속 전송 광링 (예: '수도권 제1광링')
  laserState: 'ACTIVE' | 'WARNING' | 'FAIL';
}

export interface SwitchDetails {
  switchingCapacityGbps: number; // 스위칭 용량 (예: 12.8 Tbps)
  vlanCount: number;             // 할당 VLAN 수 (예: 64)
  macTableCount: number;         // 학습 MAC 수 (예: 14,200)
  spanningTreeState: 'STABLE' | 'TOPOLOGY_CHANGE' | 'LOOP_DETECTED';
}

export type NodeType = DeviceType;

export interface NodeMetrics {
  cpuPercent: number;
  memoryPercent: number;
  tempCelsius: number;
  trafficGbps: number;
  portCount: number;
  activePorts: number;
}

export interface HardwareSpec {
  powerWatts?: number;
  fanRpm?: number;
  psuRedundancy?: string;
  firmwareVersion?: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  type: DeviceType;
  category: DeviceCategory;
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
  metrics: NodeMetrics;
  alarms: AlarmItem[];
  transmissionDetails?: TransmissionDetails;
  switchDetails?: SwitchDetails;
  hardwareSpec?: HardwareSpec;
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

export const LAYER_PRESETS: Record<'DEFAULT' | 'MINIMAL' | 'MAXIMUM', LayerVisibilityConfig> = {
  DEFAULT: DEFAULT_LAYER_CONFIG,
  MINIMAL: {
    ...DEFAULT_LAYER_CONFIG,
    showMuniBorders: false,
    showHighways: false,
    showWaterways: false,
    showMountainPeaks: false,
  },
  MAXIMUM: {
    ...DEFAULT_LAYER_CONFIG,
    lodMode: 'ALWAYS_FULL',
  },
};

