# 🌐 GeoTopology 3D (대한민국 네트워크 3D 통합 관제 라이브러리)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Deck.gl](https://img.shields.io/badge/Deck.gl-v9-green?style=flat-square)](https://deck.gl/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-v6-blue?style=flat-square)](https://maplibre.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**GeoTopology 3D**는 대한민국 전역(17개 광역시도, 250개 시군구, 80개 주요 통신국사, 714대 네트워크/전송장비 및 983개 광케이블 회선)을 GPU 하드웨어 가속 기반 3D WebGL로 시각화하고 관제하는 **React 엔터프라이즈 토폴로지 뷰어 라이브러리**입니다.

> 📚 **상세 개발자 가이드**: 더 자세한 연동 방법 및 API 명세는 [docs/GUIDE.md](./docs/GUIDE.md)를 참고하세요.

---

## ✨ 핵심 기능

- 🚀 **1줄 마운트**: 복잡한 Deck.gl Layer나 MapLibre 인스턴스 초기화 없이 `<GeoTopologyViewer />` 하나로 즉시 연동.
- 💾 **100% 완전 오프라인 폐쇄망 지원**: Protomaps PMTiles(73MB) 기반 단일 벡터 파일로 외부 인터넷이 없는 공공/국방/금융 폐쇄망에서도 100% 작동.
- 🏢 **계층형 공간 요약 (LOD Clustering)**:
  - **광역 뷰 (Zoom 5~8)**: 17개 시·도 광역 요약 카드 & 실시간 장애 카운터 뱃지
  - **중간 뷰 (Zoom 8~11)**: 시·군·구 집선 센터 요약 및 간선망 가시화
  - **상세 뷰 (Zoom 12+)**: 통신국사 내부 실제 랙/섀시, 3D 실린더 타워, 714대 장비 상세 스펙
- ⚡ **실시간 장애 전파 시뮬레이터**: CRITICAL, MAJOR 장애 발생 시 3D 파동(Pulse) 링 및 음향 FX 피드백.
- 🔍 **통합 검색 & 필터링**: 우편번호(5자리), 도로명 주소, 국사명, 장비 호스트명, IP, 모델명 실시간 검색 및 카메라 3D 자동 줌인.
- 🛠️ **유연한 커스텀 데이터 주입**: SNMP/REST API로부터 수신한 `NetworkNode[]`, `NetworkEdge[]`를 그대로 Props로 바인딩 가능.

---

## 📦 설치 (Installation)

```bash
npm install geotopology
# 또는
yarn add geotopology
# 또는
pnpm add geotopology
```

---

## 🚀 빠른 시작 (Quick Start)

```tsx
import React from 'react';
import { GeoTopologyViewer } from 'geotopology';
import 'geotopology/dist/style.css'; // 글래스모피즘 사이버 다크 테마

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GeoTopologyViewer
        onNodeSelect={(node) => {
          console.log('선택된 노드:', node);
        }}
      />
    </div>
  );
}
```

---

## 🔧 주요 컴포넌트 Props

### `<GeoTopologyViewer />`

| Prop | Type | Default | 설명 |
| :--- | :--- | :--- | :--- |
| `nodes` | `NetworkNode[]` | *전국 714대 기본 데이터* | 사용자 정의 관제 노드 배열 |
| `edges` | `NetworkEdge[]` | *전국 983개 기본 회선* | 사용자 정의 케이블 링크 배열 |
| `initialMapStyle`| `MapStyleType` | `'OFFLINE_PMTILES_DARK'` | 초기 지도 스타일 |
| `initial3DMode` | `boolean` | `true` | 초기 3D 뷰 및 피치 각도 활성화 여부 |
| `showNav` | `boolean` | `true` | 상단 검색 및 시뮬레이션 툴바 표시 여부 |
| `showDashboard` | `boolean` | `true` | 좌측 알람/통계/장비 검색 대시보드 표시 여부 |
| `showLegend` | `boolean` | `true` | 좌측 하단 3D 범례 패널 표시 여부 |
| `showRightOverlay`| `boolean` | `true` | 우측 지도 테마/레이어 스위처 표시 여부 |
| `onNodeSelect` | `(node) => void`| `undefined` | 노드 클릭 시 이벤트 핸들러 |

---

## 🧩 개별 모듈 추출 사용 (고급 커스텀)

대시보드 레이아웃을 자체 디자인으로 재구성하려는 경우, 세부 컴포넌트를 독립적으로 가져와 조립할 수 있습니다.

```tsx
import {
  TopologyMap,        // 3D 지도 렌더러
  AlarmDashboard,     // 알람/통계/장비리스트 패널
  NodeDetailDrawer,   // 장비 랙/섀시/성능 서랍
  HeaderNav,          // 상단 검색 & 툴바
  RightMapOverlay,    // 우측 레이어 옵션
  generateInitialTopology, // 기본 샘플 데이터 생성기
  soundFx,            // 관제 사운드 효과음
} from 'geotopology';
```

---

## 📡 데이터 형식 예시

### 노드 (`NetworkNode`)
```typescript
{
  id: 'KR_03186_CR_01',
  name: 'Gwanghwamun-Core-01',
  type: 'CORE_ROUTER',
  category: 'ROUTER',
  lat: 37.5714,
  lng: 126.9784,
  altitude: 60,
  status: 'NORMAL', // 'CRITICAL' | 'MAJOR' | 'MINOR' | 'NORMAL'
  postalCode: '03186',
  province: '서울특별시',
  cityDistrict: '종로구',
  address: '서울특별시 종로구 세종대로 178',
  stationName: '광화문국사',
  rackLocation: 'Rack-01-Slot02',
  ipAddress: '10.10.1.1',
  vendor: 'Cisco',
  model: '8818 Terabit Core',
  metrics: {
    cpuPercent: 32,
    memoryPercent: 54,
    tempCelsius: 28,
    trafficGbps: 45.2,
    portCount: 64,
    activePorts: 58,
  },
  alarms: [],
}
```

---

## 📄 라이선스

MIT License © 2026 GeoTopology Team
