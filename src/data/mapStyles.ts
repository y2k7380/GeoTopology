import layers from 'protomaps-themes-base';

// 다양한 100% 무료 온라인 지도 및 100% 로컬 내장 오프라인 벡터 지도 스타일 정의

export type MapStyleType = 
  | 'OFFLINE_PMTILES_DARK'
  | 'OFFLINE_PMTILES_LIGHT'
  | 'OFFLINE_TILE_STREET'
  | 'OFFLINE_TILE_TOPO'
  | 'OFFLINE_VECTOR_DARK'
  | 'OFFLINE_VECTOR_LIGHT'
  | 'OFFLINE_VECTOR_CYBER'
  | 'OSM_STANDARD'
  | 'CARTO_VOYAGER'
  | 'CARTO_DARK'
  | 'SATELLITE_FREE';

export interface MapStyleOption {
  id: MapStyleType;
  name: string;
  badge: 'OFFLINE' | 'ONLINE';
  description: string;
  style: any;
}

const getOrigin = () => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return 'http://127.0.0.1:5173';
};

// [오프라인 PMTiles 1] Protomaps PMTiles 대한민국 단일 파일(73MB) 풀벡터 다크 맵 (고대비 NMS 특화)
export const createPmtilesDarkStyle = () => {
  const rawLayers = (layers as any)('protomaps', 'dark', 'ko');
  
  // NMS 관제 센터에 최적화된 고대비 선명 컬러 팔레트 오버라이드
  const enhancedLayers = rawLayers.map((l: any) => {
    if (l.id === 'background') {
      return { ...l, paint: { ...l.paint, 'background-color': '#090e1a' } }; // 깊은 네이비 다크 바다
    }
    if (l.id === 'earth') {
      return { ...l, paint: { ...l.paint, 'fill-color': '#131c2e' } }; // 뚜렷한 관제 다크 육지
    }
    if (l.id.startsWith('water')) {
      if (l.type === 'fill') {
        return { ...l, paint: { ...l.paint, 'fill-color': '#0284c7', 'fill-opacity': 0.85 } }; // 선명한 한강/수계
      }
      if (l.type === 'line') {
        return { ...l, paint: { ...l.paint, 'line-color': '#38bdf8', 'line-width': 2.0 } };
      }
    }
    if (l.id.includes('park') || l.id === 'landcover') {
      return { ...l, paint: { ...l.paint, 'fill-color': '#0d281e', 'fill-opacity': 0.6 } }; // 은은한 녹지
    }
    if (l.id.includes('highway') && l.type === 'line') {
      return {
        ...l,
        paint: {
          ...l.paint,
          'line-color': '#f59e0b', // 선명한 골드 앰버 고속도로
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 4, 1.2, 8, 2.5, 12, 4.5, 16, 8],
        },
      };
    }
    if (l.id.includes('major') && l.type === 'line') {
      return {
        ...l,
        paint: {
          ...l.paint,
          'line-color': '#38bdf8', // 네온 사이안 주요 간선도로
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 6, 0.8, 10, 2.0, 14, 4.0],
        },
      };
    }
    if (l.id.includes('minor') && l.type === 'line') {
      return {
        ...l,
        paint: {
          ...l.paint,
          'line-color': '#64748b', // 선명한 슬레이트 도심 도로
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 10, 0.6, 14, 2.0],
        },
      };
    }
    if (l.id === 'boundaries' || l.id.startsWith('boundaries_')) {
      return {
        ...l,
        paint: {
          ...l.paint,
          'line-color': '#06b6d4', // 네온 청록 행정 경계선
          'line-width': 1.8,
          'line-opacity': 0.8,
        },
      };
    }
    return l;
  });

  return {
    version: 8 as const,
    glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
    sources: {
      protomaps: {
        type: 'vector' as const,
        url: `pmtiles://${getOrigin()}/data/korea.pmtiles`,
        attribution: '© OpenStreetMap contributors, © Protomaps Offline',
      },
    },
    layers: enhancedLayers,
  };
};

// [오프라인 PMTiles 2] Protomaps PMTiles 대한민국 단일 파일(73MB) 풀벡터 라이트 맵
export const createPmtilesLightStyle = () => {
  const rawLayers = (layers as any)('protomaps', 'light', 'ko');

  const enhancedLayers = rawLayers.map((l: any) => {
    if (l.id === 'background') {
      return { ...l, paint: { ...l.paint, 'background-color': '#bae6fd' } }; // 시원한 연하늘 바다
    }
    if (l.id === 'earth') {
      return { ...l, paint: { ...l.paint, 'fill-color': '#f8fafc' } }; // 깔끔한 화이트/크림 육지
    }
    if (l.id.startsWith('water')) {
      if (l.type === 'fill') {
        return { ...l, paint: { ...l.paint, 'fill-color': '#0284c7', 'fill-opacity': 0.9 } }; // 청명한 블루 수계
      }
      if (l.type === 'line') {
        return { ...l, paint: { ...l.paint, 'line-color': '#0369a1', 'line-width': 2.0 } };
      }
    }
    if (l.id.includes('park') || l.id === 'landcover') {
      return { ...l, paint: { ...l.paint, 'fill-color': '#dcfce7', 'fill-opacity': 0.7 } }; // 파스텔 에메랄드 녹지
    }
    if (l.id.includes('highway') && l.type === 'line') {
      return {
        ...l,
        paint: {
          ...l.paint,
          'line-color': '#ea580c', // 선명한 오렌지 고속도로
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 4, 1.2, 8, 2.5, 12, 4.5, 16, 8],
        },
      };
    }
    if (l.id.includes('major') && l.type === 'line') {
      return {
        ...l,
        paint: {
          ...l.paint,
          'line-color': '#0284c7', // 딥 사이안 간선도로
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 6, 0.8, 10, 2.0, 14, 4.0],
        },
      };
    }
    if (l.id === 'boundaries' || l.id.startsWith('boundaries_')) {
      return {
        ...l,
        paint: {
          ...l.paint,
          'line-color': '#0284c7',
          'line-width': 1.8,
          'line-opacity': 0.85,
        },
      };
    }
    return l;
  });

  return {
    version: 8 as const,
    glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
    sources: {
      protomaps: {
        type: 'vector' as const,
        url: `pmtiles://${getOrigin()}/data/korea.pmtiles`,
        attribution: '© OpenStreetMap contributors, © Protomaps Offline',
      },
    },
    layers: enhancedLayers,
  };
};

// [오프라인 1] 100% 완전 오프라인 내장 대한민국 3D 다크 벡터 맵 (NMS 관제 특화)
export const createOfflineVectorDarkStyle = () => ({
  version: 8 as const,
  name: 'Offline Korea Vector Dark',
  sources: {
    'korea-provinces': {
      type: 'geojson' as const,
      data: `${getOrigin()}/data/korea_provinces.json`,
    },
  },
  layers: [
    // 바다 배경
    {
      id: 'background',
      type: 'background' as const,
      paint: {
        'background-color': '#080d1a',
      },
    },
    // 대한민국 육지 폴리곤 (다크 슬레이트)
    {
      id: 'provinces-fill',
      type: 'fill' as const,
      source: 'korea-provinces',
      paint: {
        'fill-color': '#131e36',
        'fill-opacity': 0.95,
      },
    },
    // 17개 광역시도 경계선 (네온 청록색 글로우 라인)
    {
      id: 'provinces-line',
      type: 'line' as const,
      source: 'korea-provinces',
      paint: {
        'line-color': '#06b6d4',
        'line-width': 1.8,
        'line-opacity': 0.8,
      },
    },
  ],
});

// [오프라인 2] 100% 완전 오프라인 내장 대한민국 3D 라이트/컬러 벡터 맵
export const createOfflineVectorLightStyle = () => ({
  version: 8 as const,
  name: 'Offline Korea Vector Light',
  sources: {
    'korea-provinces': {
      type: 'geojson' as const,
      data: `${getOrigin()}/data/korea_provinces.json`,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background' as const,
      paint: {
        'background-color': '#cbd5e1', // 밝은 바다
      },
    },
    {
      id: 'provinces-fill',
      type: 'fill' as const,
      source: 'korea-provinces',
      paint: {
        'fill-color': '#f8fafc', // 깔끔한 화이트/크림 육지
        'fill-opacity': 0.95,
      },
    },
    {
      id: 'provinces-line',
      type: 'line' as const,
      source: 'korea-provinces',
      paint: {
        'line-color': '#0284c7',
        'line-width': 1.8,
        'line-opacity': 0.85,
      },
    },
  ],
});

// [오프라인 3] 100% 완전 오프라인 내장 대한민국 3D 사이버펑크 네온 맵
export const createOfflineVectorCyberStyle = () => ({
  version: 8 as const,
  name: 'Offline Korea Vector Cyberpunk',
  sources: {
    'korea-provinces': {
      type: 'geojson' as const,
      data: `${getOrigin()}/data/korea_provinces.json`,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background' as const,
      paint: {
        'background-color': '#05050d', // 깊은 우주 암흑 바다
      },
    },
    {
      id: 'provinces-fill',
      type: 'fill' as const,
      source: 'korea-provinces',
      paint: {
        'fill-color': '#110e24', // 다크 퍼플 육지
        'fill-opacity': 0.95,
      },
    },
    {
      id: 'provinces-line',
      type: 'line' as const,
      source: 'korea-provinces',
      paint: {
        'line-color': '#a855f7', // 네온 바이올렛 라인
        'line-width': 2.0,
        'line-opacity': 0.9,
      },
    },
  ],
});

// [오프라인 4] 100% 로컬 내장 실제 고화질 상세 스트리트 맵 (줌 5~13 수록)
export const createOfflineStreetTileStyle = () => ({
  version: 8 as const,
  name: 'Offline Local Detailed Street Map',
  sources: {
    'offline-street-source': {
      type: 'raster' as const,
      tiles: [`${getOrigin()}/tiles/street/{z}/{x}/{y}.jpg`],
      tileSize: 256,
      attribution: '© ESRI World Street Map Offline',
      maxzoom: 13,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background' as const,
      paint: {
        'background-color': '#f8fafc',
      },
    },
    {
      id: 'offline-street-layer',
      type: 'raster' as const,
      source: 'offline-street-source',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
});

// [오프라인 5] 100% 로컬 내장 실제 고화질 상세 지형 맵 (줌 5~13 수록)
export const createOfflineTopoTileStyle = () => ({
  version: 8 as const,
  name: 'Offline Local Detailed Topo Map',
  sources: {
    'offline-topo-source': {
      type: 'raster' as const,
      tiles: [`${getOrigin()}/tiles/topo/{z}/{x}/{y}.jpg`],
      tileSize: 256,
      attribution: '© ESRI World Topo Map Offline',
      maxzoom: 13,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background' as const,
      paint: {
        'background-color': '#e2e8f0',
      },
    },
    {
      id: 'offline-topo-layer',
      type: 'raster' as const,
      source: 'offline-topo-source',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
});

// [온라인 1] OpenStreetMap 표준 무료 지도
export const OSM_STANDARD_STYLE = {
  version: 8 as const,
  name: 'OpenStreetMap Standard Free',
  sources: {
    'osm-tiles': {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster' as const,
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// [온라인 2] CartoDB Voyager 온라인 컬러 지도
export const CARTO_VOYAGER_STYLE = {
  version: 8 as const,
  name: 'CartoDB Voyager Free',
  sources: {
    'carto-voyager': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap, © CARTO',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'carto-voyager-layer',
      type: 'raster' as const,
      source: 'carto-voyager',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// [온라인 3] CartoDB Dark Matter 온라인 다크 맵
export const CARTO_DARK_MAP_STYLE = {
  version: 8 as const,
  name: 'Carto Dark Matter Free',
  sources: {
    'carto-dark-source': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap, © CARTO',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'carto-dark-raster-layer',
      type: 'raster' as const,
      source: 'carto-dark-source',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// [온라인 4] ESRI 무료 위성 사진 지도
export const SATELLITE_FREE_STYLE = {
  version: 8 as const,
  name: 'Free Satellite Imagery',
  sources: {
    'esri-satellite': {
      type: 'raster' as const,
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Tiles © Esri',
      maxzoom: 18,
    },
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster' as const,
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 18,
    },
  ],
};

export const FREE_MAP_OPTIONS: MapStyleOption[] = [
  {
    id: 'OFFLINE_PMTILES_DARK',
    name: '💾 [오프라인 PMTiles] 대한민국 풀벡터 다크 맵 ⭐',
    badge: 'OFFLINE',
    description: 'Protomaps PMTiles 단일 파일(73MB) 기반 100% 완전 오프라인 도로/지형/수계 벡터 맵',
    style: createPmtilesDarkStyle(),
  },
  {
    id: 'OFFLINE_PMTILES_LIGHT',
    name: '💾 [오프라인 PMTiles] 대한민국 풀벡터 라이트 맵',
    badge: 'OFFLINE',
    description: 'Protomaps PMTiles 단일 파일(73MB) 기반 100% 완전 오프라인 고화질 컬러 벡터 맵',
    style: createPmtilesLightStyle(),
  },
  {
    id: 'OFFLINE_TILE_STREET',
    name: '💾 [오프라인] 로컬 상세 스트리트 맵',
    badge: 'OFFLINE',
    description: '100% 로컬 내장(public/tiles/street) 상세 도로/도시 타일 (줌 5~13 수록)',
    style: createOfflineStreetTileStyle(),
  },
  {
    id: 'OFFLINE_TILE_TOPO',
    name: '💾 [오프라인] 로컬 상세 지형 맵 (Topo)',
    badge: 'OFFLINE',
    description: '100% 로컬 내장(public/tiles/topo) 국토 지형/등고선 타일 (줌 5~13 수록)',
    style: createOfflineTopoTileStyle(),
  },
  {
    id: 'OFFLINE_VECTOR_DARK',
    name: '💾 [오프라인] 대한민국 3D 다크 벡터 맵',
    badge: 'OFFLINE',
    description: '100% 완전 오프라인 폐쇄망 구동 (대한민국 17개 광역시도 정밀 벡터 경계)',
    style: createOfflineVectorDarkStyle(),
  },
  {
    id: 'OFFLINE_VECTOR_LIGHT',
    name: '💾 [오프라인] 대한민국 3D 라이트 벡터 맵',
    badge: 'OFFLINE',
    description: '100% 완전 오프라인 폐쇄망 구동 (주간 고화질 컬러 벡터 경계)',
    style: createOfflineVectorLightStyle(),
  },
  {
    id: 'OFFLINE_VECTOR_CYBER',
    name: '💾 [오프라인] 대한민국 사이버 네온 맵',
    badge: 'OFFLINE',
    description: '100% 완전 오프라인 폐쇄망 구동 (사이버펑크 네온 보라빛 테마)',
    style: createOfflineVectorCyberStyle(),
  },
  {
    id: 'OSM_STANDARD',
    name: '🌐 [온라인] OpenStreetMap 표준',
    badge: 'ONLINE',
    description: '실시간 OSM CDN 타일 연동 표준 무료 지도 (도로망 및 한글 지명)',
    style: OSM_STANDARD_STYLE,
  },
  {
    id: 'CARTO_VOYAGER',
    name: '🌐 [온라인] Carto Voyager 컬러',
    badge: 'ONLINE',
    description: '실시간 CartoDB 고해상도 컬러 도로/지형 지도',
    style: CARTO_VOYAGER_STYLE,
  },
  {
    id: 'CARTO_DARK',
    name: '🌐 [온라인] Carto Dark 다크 맵',
    badge: 'ONLINE',
    description: '실시간 CartoDB 야간 다크 관제 센터 지도',
    style: CARTO_DARK_MAP_STYLE,
  },
  {
    id: 'SATELLITE_FREE',
    name: '🛰️ [온라인] 무료 위성 사진 (Satellite)',
    badge: 'ONLINE',
    description: '실제 항공/위성 사진 지형 맵',
    style: SATELLITE_FREE_STYLE,
  },
];
