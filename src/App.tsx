import React from 'react';
import { GeoTopologyViewer } from './components/GeoTopologyViewer';

/**
 * GeoTopology 메인 데모 어플리케이션
 * 라이브러리의 핵심 컴포넌트인 <GeoTopologyViewer />를 단 한 줄로 마운트하여 동작을 검증합니다.
 */
export const App: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <GeoTopologyViewer
        onNodeSelect={(node) => {
          if (node) {
            console.log('[GeoTopology] Node selected:', node);
          }
        }}
      />
    </div>
  );
};

export default App;
