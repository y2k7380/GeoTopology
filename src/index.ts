// ============================================================================
// GeoTopology 3D - 대한민국 네트워크 3D 통합 관제 시스템 라이브러리
// ============================================================================

// 메인 원클릭 관제 뷰어 컴포넌트
export { GeoTopologyViewer } from './components/GeoTopologyViewer';
export type { GeoTopologyViewerProps } from './components/GeoTopologyViewer';
export { GeoTopologyViewer as default } from './components/GeoTopologyViewer';

// 개별 서브 모듈 컴포넌트 (커스텀 대시보드 구축용)
export { TopologyMap } from './components/TopologyMap';
export type { TopologyMapProps } from './components/TopologyMap';

export { AlarmDashboard } from './components/AlarmDashboard';
export type { AlarmDashboardProps } from './components/AlarmDashboard';

export { NodeDetailDrawer } from './components/NodeDetailDrawer';
export type { NodeDetailDrawerProps } from './components/NodeDetailDrawer';

export { HeaderNav } from './components/HeaderNav';
export type { HeaderNavProps } from './components/HeaderNav';

export { RightMapOverlay } from './components/RightMapOverlay';
export type { RightMapOverlayProps } from './components/RightMapOverlay';

// 도메인 타입 및 상수
export type {
  NetworkNode,
  NetworkEdge,
  RegionSummaryNode,
  NodeType,
  AlarmSeverity,
  DeviceCategory,
  LinkType,
  AlarmItem,
  NodeMetrics,
  HardwareSpec,
  PostalAddressItem,
  LabelConfig,
  LayerVisibilityConfig,
} from './types/topology';

export type { ProvinceMeta, ProvinceMeta as KoreaProvinceInfo } from './data/koreaPostalData';

export {
  DEFAULT_LABEL_CONFIG,
  DEFAULT_LAYER_CONFIG,
  LAYER_PRESETS,
} from './types/topology';

// 지도 스타일 및 PMTiles 옵션
export {
  FREE_MAP_OPTIONS,
  getDefaultMapStyle,
  isOfflineStyle,
} from './data/mapStyles';
export type { MapStyleType, MapStyleOption } from './data/mapStyles';

// 기본 토폴로지 및 우편번호/권역 데이터셋
export { generateInitialTopology } from './data/mockTopology';
export { KOREA_POSTAL_DIRECTORY, KOREA_PROVINCES } from './data/koreaPostalData';

// 공간 요약 엔진 및 오디오 유틸리티
export { computeHierarchicalTopology, ZOOM_THRESHOLDS } from './utils/summaryEngine';
export type { ClusteredTopologyResult } from './utils/summaryEngine';
export { soundFx } from './utils/audio';
