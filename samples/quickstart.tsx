import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GeoTopologyViewer } from '../src/index';
import { Code2, BookOpen, ExternalLink, Check, Copy } from 'lucide-react';
import '../src/index.css';
import '../src/App.css';

const QuickStartSample: React.FC = () => {
  const [showCode, setShowCode] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const sampleCode = `import React from 'react';
import { GeoTopologyViewer } from 'geotopology';
import 'geotopology/dist/style.css';

export function NetworkMonitor() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GeoTopologyViewer
        onNodeSelect={(node) => console.log('선택 노드:', node)}
      />
    </div>
  );
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 핵심 뷰어 컴포넌트 마운트 */}
      <GeoTopologyViewer
        onNodeSelect={(node) => {
          console.log('[QuickStart] 선택된 노드:', node);
        }}
      />

      {/* 상단 샘플 배너 & 코드 인스펙터 토글 */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: 30,
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>
          <span>🚀 샘플 1: 1분 퀵 스타트 (기본 마운트)</span>
        </div>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />
        <button
          onClick={() => setShowCode(!showCode)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: showCode ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 16,
            padding: '4px 10px',
            color: '#e2e8f0',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          <Code2 size={14} color="#38bdf8" />
          {showCode ? '코드 닫기' : '적용 코드 보기'}
        </button>
        <a
          href="/guide.html"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: '#94a3b8',
            fontSize: 12,
            textDecoration: 'none',
          }}
        >
          <BookOpen size={14} />
          가이드 문서
        </a>
      </div>

      {/* 플로팅 소스 코드 미리보기 */}
      {showCode && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 420,
            zIndex: 40,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 12,
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(30, 41, 59, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>
              <Code2 size={15} color="#38bdf8" />
              <span>React 컴포넌트 소스 (3줄 완성)</span>
            </div>
            <button
              onClick={copyCode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: 4,
                padding: '3px 8px',
                color: '#38bdf8',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? '복사됨!' : '코드 복사'}
            </button>
          </div>
          <pre
            style={{
              padding: 14,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#38bdf8',
              lineHeight: 1.6,
              overflowX: 'auto',
              maxHeight: 220,
            }}
          >
            {sampleCode}
          </pre>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QuickStartSample />
  </React.StrictMode>
);
