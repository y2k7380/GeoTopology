# 🌐 GeoTopology 3D - 개발자 가이드 및 라이브러리 사용 설명서

> **대한민국 기간망 3D 통합 관제 및 NMS/NOC 토폴로지 뷰어 라이브러리**  
> MapLibre GL + Deck.gl 기반의 초고성능 WebGL 렌더링, 100% 폐쇄망 오프라인 PMTiles 지원, 그리고 단 3줄로 기존 리액트(React) 프로젝트에 붙일 수 있는 완전형 독립 컴포넌트를 제공합니다.

---

## 📌 목차
1. [라이브러리 개요](#1-라이브러리-개요)
2. [설치 및 요구 사항](#2-설치-및-요구-사항)
3. [1분 퀵 스타트 (Quick Start)](#3-1분-퀵-스타트-quick-start)
4. [`GeoTopologyViewer` 컴포넌트 API](#4-geotopologyviewer-컴포넌트-api)
5. [데이터 연동 가이드 (SNMP / REST API / WebSocket)](#5-데이터-연동-가이드-snmp--rest-api--websocket)
6. [개별 서브 컴포넌트 활용 (커스텀 대시보드 구축)](#6-개별-서브-컴포넌트-활용-커스텀-대시보드-구축)
7. [오프라인 폐쇄망 (Air-Gapped) 환경 설정](#7-오프라인-폐쇄망-air-gapped-환경-설정)
8. [Next.js (SSR) 통합 가이드](#8-nextjs-ssr-통합-가이드)
9. [TypeScript 타입 정의 참조](#9-typescript-타입-정의-참조)

---

## 1. 라이브러리 개요

`geotopology`는 통신사, 전력망, 공공망, 클라우드 데이터센터의 광역 네트워크 토폴로지를 3D 입체 맵 기반으로 실시간 관제할 수 있는 엔터프라이즈급 UI 컴포넌트 라이브러리입니다.

- **원클릭 마운트**: 복잡한 Deck.gl, MapLibre WebGL 레이어 설정 없이 `<GeoTopologyViewer />` 단 하나로 즉시 구동.
- **계층형 공간 요약 (LOD Clustering)**: 대한민국 17개 시·도 광역 요약 → 250개 시·군·구 집선 요약 → 80개 주요 통신국사/POP → 국사 내부 714대 상세 장비 및 섀시 뷰로 부드러운 자동 전환.
- **완전 오프라인 구동**: 외부 인터넷(CDN)이 차단된 국가 폐쇄망에서도 Protomaps PMTiles(73MB) 기반 풀벡터 다크 맵 100% 작동.
- **실시간 장애 시뮬레이션 및 알람 텔레메트리**: CRITICAL / MAJOR / MINOR 등급별 3D 파동(Pulse) 링 및 사운드 FX 내장.

---

## 2. 설치 및 요구 사항

### 요구 사항
- **React**: `^18.0.0` 또는 `^19.0.0`
- **Node.js**: `>=18.0.0`
- **Modern Browser**: WebGL2를 지원하는 모든 최신 브라우저 (Chrome, Edge, Safari, Firefox)

### 패키지 설치
```bash
# npm 사용 시
npm install geotopology

# yarn 사용 시
yarn add geotopology

# pnpm 사용 시
pnpm add geotopology
```

---

## 3. 1분 퀵 스타트 (Quick Start)

가장 간단한 사용법은 번들된 기본 전국 714대 네트워크 장비 및 983개 회선망 데이터셋을 그대로 사용하는 것입니다.

### 1) 스타일시트 및 컴포넌트 임포트
```tsx
import React from 'react';
import { GeoTopologyViewer } from 'geotopology';
import 'geotopology/dist/style.css'; // 라이브러리 전용 다크 글래스모피즘 테마 스타일

export function NetworkMonitoringPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <GeoTopologyViewer
        onNodeSelect={(node) => {
          console.log('선택된 장비/국사:', node);
        }}
      />
    </div>
  );
}
```

---

## 4. `GeoTopologyViewer` 컴포넌트 API

`<GeoTopologyViewer />`는 모든 상위 상태 관리, 카메라 이동 제어, 서랍 애니메이션, 알람 필터링을 캡슐화한 턴키(Turnkey) 컴포넌트입니다.

### Props 명세

| Prop 이름 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `nodes` | `NetworkNode[]` | `기본 전국 714대 장비` | 사용자 정의 관제 대상 노드 배열 |
| `edges` | `NetworkEdge[]` | `기본 전국 983개 회선` | 사용자 정의 백본/전송 회선 배열 |
| `initialMapStyle` | `MapStyleType` | `'OFFLINE_PMTILES_DARK'` | 초기 지도 스타일 (`OFFLINE_PMTILES_DARK`, `OSM_STANDARD`, `CARTO_DARK` 등) |
| `initial3DMode` | `boolean` | `true` | 초기 3D 피치(48도) 및 3D 장비 타워 활성화 여부 |
| `showNav` | `boolean` | `true` | 상단 국사/우편번호/장비 검색 및 시뮬레이션 툴바 표시 여부 |
| `showDashboard` | `boolean` | `true` | 좌측 통계/알람/권역/장비 검색 통합 대시보드 표시 여부 |
| `showLegend` | `boolean` | `true` | 좌측 하단 3D 범례(장비 종류, 케이블 색상) 패널 표시 여부 |
| `showRightOverlay`| `boolean` | `true` | 우측 상단 지도 테마 및 백본/국경선 레이어 스위처 표시 여부 |
| `onNodeSelect` | `(node: NetworkNode \| RegionSummaryNode \| null) => void` | `undefined` | 3D 맵 또는 리스트에서 노드/요약카드 클릭 시 호출되는 콜백 |
| `className` | `string` | `''` | 최상위 컨테이너 클래스명 |
| `style` | `React.CSSProperties` | `{}` | 최상위 컨테이너 인라인 스타일 |

---

## 5. 데이터 연동 가이드 (SNMP / REST API / WebSocket)

회사의 실제 관제 시스템(NMS / EMS / SMS) 백엔드에서 실시간 데이터를 받아 `<GeoTopologyViewer />`에 주입하는 방법입니다.

### 1) REST API 폴링 예제 (React Query 또는 useEffect)
```tsx
import React, { useState, useEffect } from 'react';
import { GeoTopologyViewer, type NetworkNode, type NetworkEdge } from 'geotopology';
import 'geotopology/dist/style.css';

export function LiveOpsViewer() {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchTopology() {
      try {
        const [nodesRes, edgesRes] = await Promise.all([
          fetch('/api/v1/topology/nodes').then(r => r.json()),
          fetch('/api/v1/topology/edges').then(r => r.json()),
        ]);
        setNodes(nodesRes);
        setEdges(edgesRes);
      } finally {
        setLoading(false);
      }
    }

    fetchTopology();
    const timer = setInterval(fetchTopology, 10000); // 10초마다 텔레메트리 갱신
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div>네트워크 토폴로지 로딩 중...</div>;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GeoTopologyViewer
        nodes={nodes}
        edges={edges}
        onNodeSelect={(node) => {
          if (node && 'metrics' in node) {
            console.log(`[장비 선택] ${node.name} (IP: ${node.ipAddress})`);
          }
        }}
      />
    </div>
  );
}
```

### 2) 웹소켓(WebSocket) 실시간 알람 반영
```tsx
useEffect(() => {
  const ws = new WebSocket('wss://your-nms.company.com/ws/alarms');
  
  ws.onmessage = (event) => {
    const newAlarm = JSON.parse(event.data);
    setNodes(prev => prev.map(node => {
      if (node.id === newAlarm.nodeId) {
        return {
          ...node,
          status: newAlarm.severity, // 'CRITICAL' | 'MAJOR' | 'MINOR' | 'NORMAL'
          alarms: [newAlarm, ...node.alarms],
        };
      }
      return node;
    }));
  };

  return () => ws.close();
}, []);
```

---

## 6. 개별 서브 컴포넌트 활용 (커스텀 대시보드 구축)

기본 일체형 UI 대신 독자적인 NOC 화면을 구성하고 싶다면 라이브러리에서 익스포트하는 원자적 컴포넌트를 자유롭게 조합할 수 있습니다.

### 사용 가능한 서브 모듈
- `<TopologyMap />`: 3D WebGL 지도 본체 (Deck.gl + MapLibre)
- `<AlarmDashboard />`: 장애 현황 통계, 실시간 이벤트 피드, 장비 검색 통합 리스트 패널
- `<NodeDetailDrawer />`: 장비 클릭 시 우측에서 슬라이드되는 랙 섀시, 인터페이스 상태, CPU/온도 차트 서랍
- `<HeaderNav />`: 우편번호/장비 통합 검색창, 전도 보기, 2D/3D 토글 헤더 바
- `<RightMapOverlay />`: 지도 테마 변경 및 레이어(도로, 산악, 시군구 경계) 온/오프 오버레이

```tsx
import React, { useState } from 'react';
import {
  TopologyMap,
  NodeDetailDrawer,
  generateInitialTopology,
  type NetworkNode,
  type MapStyleType
} from 'geotopology';
import 'geotopology/dist/style.css';

export function CustomDashboard() {
  const [data] = useState(() => generateInitialTopology());
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* 3D 지도만 단독 렌더링 */}
      <TopologyMap
        allNodes={data.nodes}
        allEdges={data.edges}
        selectedNode={selectedNode}
        onSelectNode={(node) => setSelectedNode(node as NetworkNode)}
        flyToTarget={null}
        onFlyToComplete={() => {}}
        is3DMode={true}
        filterSeverity="ALL"
        currentMapStyle="OFFLINE_PMTILES_DARK"
        labelConfig={{ showLabels: true, labelZoomThreshold: 10, fontSize: 11 }}
        layerConfig={{
          showProvinceBorders: true,
          showMuniBorders: true,
          showHighways: false,
          showWaterways: true,
          showCityLabels: true,
          showMountainPeaks: false,
          showBackboneEdges: true,
          showEquipmentBoxes: true,
          showSummaryNodes: true,
          showDeviceLabels: true,
          showAlarmPulses: true,
          lodMode: 'SMART_AUTO',
        }}
      />

      {/* 커스텀 상세 서랍 연동 */}
      <NodeDetailDrawer
        selectedNode={selectedNode}
        onClose={() => setSelectedNode(null)}
        onZoomToNode={(lat, lng, zoom) => console.log('Zoom to', lat, lng, zoom)}
        onSelectSubNode={(subNode) => setSelectedNode(subNode)}
        allEdges={data.edges}
      />
    </div>
  );
}
```

---

## 7. 오프라인 폐쇄망 (Air-Gapped) 환경 설정

공공기관, 군, 금융사 등 외부 인터넷이 100% 차단된 환경에서는 `OFFLINE_PMTILES_DARK` 스타일을 사용하십시오.

1. `public/korea.pmtiles` (73MB) 파일을 웹 서버의 정적 자원 디렉토리에 배치합니다.
2. 라이브러리는 자동으로 `window.location.origin + '/korea.pmtiles'`를 읽어 들여 완전 로컬 벡터 타일로 지도를 렌더링합니다.
3. 타일 CDN이나 Mapbox/Google Maps API 키가 전혀 필요하지 않으며 비용이 영구 무료(0원)입니다.

---

## 8. Next.js (SSR) 통합 가이드

MapLibre GL과 WebGL은 브라우저 환경의 `window` 및 `navigator` 객체를 참조하므로, Next.js(App Router 또는 Pages Router)에서는 Dynamic Import를 사용하여 클라이언트 사이드에서만 렌더링하도록 설정합니다.

### Next.js (App Router: `app/monitoring/page.tsx`)
```tsx
'use client';

import dynamic from 'next/dynamic';
import 'geotopology/dist/style.css';

// SSR 비활성화 클라이언트 로딩
const GeoTopologyViewer = dynamic(
  () => import('geotopology').then((mod) => mod.GeoTopologyViewer),
  { ssr: false, loading: () => <div className="p-8 text-white">3D WebGL 엔진 기동 중...</div> }
);

export default function Page() {
  return (
    <div className="w-screen h-screen">
      <GeoTopologyViewer />
    </div>
  );
}
```

---

## 9. TypeScript 타입 정의 참조

### `NetworkNode` (노드 데이터 스펙)
```typescript
export interface NetworkNode {
  id: string;                         // 고유 식별자 (e.g., 'NODE_KR_03186_01')
  name: string;                       // 장비명 (e.g., 'Gwanghwamun-CR-01')
  type: DeviceType;                   // 'OPTICAL_DWDM' | 'PACKET_POTN' | 'CORE_L3_SWITCH' | 'CORE_ROUTER' ...
  category: DeviceCategory;           // 'TRANSMISSION' | 'SWITCH' | 'ROUTER' | 'WIRELESS'
  lat: number;                        // 위도 (e.g., 37.5714)
  lng: number;                        // 경도 (e.g., 126.9784)
  altitude: number;                   // 3D 높이 (m, 기본 20~100m)
  status: AlarmSeverity;              // 'CRITICAL' | 'MAJOR' | 'MINOR' | 'NORMAL'
  postalCode: string;                 // 5자리 우편번호 (e.g., '03186')
  province: string;                   // 시·도 (e.g., '서울특별시')
  cityDistrict: string;               // 시·군·구 (e.g., '종로구')
  address: string;                    // 도로명 주소 (e.g., '서울특별시 종로구 세종대로 178')
  stationName: string;                // 소속 통신국사 (e.g., '광화문국사')
  rackLocation: string;               // 랙 위치 (e.g., 'Rack-02-Slot04')
  ipAddress: string;                  // IP 주소 (e.g., '10.10.1.1')
  vendor: string;                     // 제조사 (e.g., 'Cisco', 'Nokia', 'Ciena', 'HFR')
  model: string;                      // 모델명 (e.g., '8818 Terabit Core')
  metrics: {
    cpuPercent: number;               // CPU 사용률 (%)
    memoryPercent: number;            // 메모리 사용률 (%)
    tempCelsius: number;              // 장비 온도 (°C)
    trafficGbps: number;              // 실시간 전송량 (Gbps)
    portCount: number;                // 총 포트 수
    activePorts: number;              // 링크 활성 포트 수
  };
  alarms: AlarmItem[];                // 발생 중인 알람 목록
  transmissionDetails?: TransmissionDetails; // 전송장비 광파장/광출력 스펙
  switchDetails?: SwitchDetails;             // 스위치 VLAN/MAC 테이블 스펙
}
```

### `NetworkEdge` (회선 링크 스펙)
```typescript
export interface NetworkEdge {
  id: string;                         // 고유 식별자 (e.g., 'EDGE_03186_06234_1')
  source: string;                     // 출발지 Node ID
  target: string;                     // 도착지 Node ID
  sourceCoordinates: [number, number];// [경도, 위도]
  targetCoordinates: [number, number];// [경도, 위도]
  linkType: LinkType;                 // 'DWDM_OPTICAL_LAMBDA' | 'BACKBONE_100G' | 'METRO_RING_40G' ...
  status: 'UP' | 'WARNING' | 'DOWN';
  bandwidthGbps: number;              // 회선 대역폭 (e.g., 100, 400)
  trafficUtilPercent: number;         // 회선 사용률 (%)
  latencyMs: number;                  // 레이턴시 (ms)
  packetLossPercent: number;          // 패킷 로스율 (%)
  alarms: AlarmItem[];
}
```

---

## 💡 문의 및 기술 지원
- 이슈 리포트 및 기능 제안: GitHub Repository Issues
- 라이센스: MIT License
