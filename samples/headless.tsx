import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  TopologyMap,
  NodeDetailDrawer,
  generateInitialTopology,
  DEFAULT_LABEL_CONFIG,
  DEFAULT_LAYER_CONFIG,
  type NetworkNode,
  type RegionSummaryNode,
} from '../src/index';
import { Layers, Server, MapPin, Compass, BookOpen } from 'lucide-react';
import '../src/index.css';
import '../src/App.css';

const HeadlessMapSample: React.FC = () => {
  const [data] = useState(() => generateInitialTopology());
  const [selectedNode, setSelectedNode] = useState<NetworkNode | RegionSummaryNode | null>(null);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number; zoom?: number; pitch?: number } | null>(null);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#0b0f19' }}>
      {/* 1. 커스텀 왼쪽 슬림 네비게이션 사이드바 */}
      <aside
        style={{
          width: 280,
          height: '100%',
          background: 'rgba(15, 23, 42, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
          padding: '20px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #38bdf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>Custom Mini NOC</h1>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>독립 TopologyMap 활용 예시</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>주요 거점 퀵 점프</span>
          {[
            { name: '서울 광화문 코어', lat: 37.5714, lng: 126.9784, zoom: 15 },
            { name: '판교 IDC 클러스터', lat: 37.4000, lng: 127.1068, zoom: 15 },
            { name: '대전 대덕연구단지', lat: 36.3741, lng: 127.3603, zoom: 15 },
            { name: '부산 해운대 통신센터', lat: 35.1631, lng: 129.1636, zoom: 15 },
          ].map(spot => (
            <button
              key={spot.name}
              onClick={() => {
                setFlyToTarget({ lat: spot.lat, lng: spot.lng, zoom: spot.zoom, pitch: 55 });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <MapPin size={14} color="#38bdf8" />
              <span>{spot.name}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px',
              borderRadius: 8,
              background: is3DMode ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Layers size={14} />
            {is3DMode ? '3D 틸트 모드 활성 (48°)' : '2D 평면 모드 (0°)'}
          </button>

          <a
            href="/guide.html"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              fontSize: 12,
              textDecoration: 'none',
            }}
          >
            <BookOpen size={14} />
            가이드 문서로 이동
          </a>
        </div>
      </aside>

      {/* 2. 중앙 단독 TopologyMap 영역 */}
      <main style={{ flex: 1, position: 'relative', height: '100%', overflow: 'hidden' }}>
        <TopologyMap
          allNodes={data.nodes}
          allEdges={data.edges}
          selectedNode={selectedNode}
          onSelectNode={(n) => setSelectedNode(n)}
          flyToTarget={flyToTarget}
          onFlyToComplete={() => setFlyToTarget(null)}
          is3DMode={is3DMode}
          filterSeverity="ALL"
          currentMapStyle="OFFLINE_PMTILES_DARK"
          labelConfig={DEFAULT_LABEL_CONFIG}
          layerConfig={DEFAULT_LAYER_CONFIG}
        />

        {/* 3. 장비 클릭 시 우측 슬라이드 서랍 연동 */}
        <NodeDetailDrawer
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onZoomToNode={(lat, lng, zoom) => {
            setFlyToTarget({ lat, lng, zoom, pitch: 60 });
          }}
          onSelectSubNode={(sub) => setSelectedNode(sub)}
          allEdges={data.edges}
        />
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeadlessMapSample />
  </React.StrictMode>
);
