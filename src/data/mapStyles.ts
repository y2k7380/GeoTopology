// 다양한 100% 무료 지도 타일 스타일 정의 (API Key 불필요)

export type MapStyleType = 'OSM_STANDARD' | 'CARTO_VOYAGER' | 'CARTO_DARK' | 'SATELLITE_FREE';

export interface MapStyleOption {
  id: MapStyleType;
  name: string;
  description: string;
  style: any;
}

// 1. OpenStreetMap (OSM) 표준 무료 지도 (한글 지명, 도로망, 행정구역 선명)
export const OSM_STANDARD_STYLE = {
  version: 8 as const,
  name: 'OpenStreetMap Standard Free',
  sources: {
    'osm-tiles': {
      type: 'raster' as const,
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

// 2. CartoDB Voyager (고화질 컬러 도로/지형 무료 지도)
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

// 3. CartoDB Dark Matter (다크 테마 무료 지도)
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
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
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

// 4. ESRI 무료 위성 사진 지도
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
    id: 'OSM_STANDARD',
    name: 'OpenStreetMap (표준 무료 지도)',
    description: '도로망, 건물, 한글 지명이 선명한 오픈스트리트맵 표준',
    style: OSM_STANDARD_STYLE,
  },
  {
    id: 'CARTO_VOYAGER',
    name: 'Carto Voyager (컬러 지도)',
    description: '고해상도 지형 및 도로 시각화 컬러 맵',
    style: CARTO_VOYAGER_STYLE,
  },
  {
    id: 'CARTO_DARK',
    name: 'Carto Dark (다크 관제 맵)',
    description: '야간/관제 센터에 최적화된 다크 테마',
    style: CARTO_DARK_MAP_STYLE,
  },
  {
    id: 'SATELLITE_FREE',
    name: '무료 위성 사진 (Satellite)',
    description: '실제 위성 항공 지형 사진',
    style: SATELLITE_FREE_STYLE,
  },
];
