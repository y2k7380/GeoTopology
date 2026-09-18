import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  GeoTopologyViewer,
  generateInitialTopology,
  type NetworkNode,
  type NetworkEdge,
} from '../src/index';
import { Activity, Plus, AlertOctagon, RotateCcw, BookOpen, Radio } from 'lucide-react';
import '../src/index.css';
import '../src/App.css';

const CustomDataSample: React.FC = () => {
  // 개발자 고유의 커스텀 상태 관리
  const [nodes, setNodes] = useState<NetworkNode[]>(() => {
    // 서울/경기/인천/대전 주요 6대 거점만 선별한 컴팩트 커스텀 셋
    const base = generateInitialTopology();
    return base.nodes.filter(n => ['03186', '06234', '13494', '21556', '34141', '48058'].includes(n.postalCode));
  });

  const [edges, setEdges] = useState<NetworkEdge[]>(() => {
    const base = generateInitialTopology();
    return base.edges.filter(e => {
      const allowed = ['03186', '06234', '13494', '21556', '34141', '48058'];
      return allowed.some(a => e.source.includes(a)) && allowed.some(a => e.target.includes(a));
    });
  });

  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [pulseCount, setPulseCount] = useState<number>(0);

  // 1. SNMP 실시간 텔레메트리 주기적 폴링 시뮬레이션
  useEffect(() => {
    if (!isPolling) return;
    const timer = setInterval(() => {
      setPulseCount(p => p + 1);
      setNodes(prev =>
        prev.map(node => ({
          ...node,
          metrics: {
            ...node.metrics,
            cpuPercent: Math.min(100, Math.max(15, node.metrics.cpuPercent + Math.floor((Math.random() - 0.48) * 8))),
            trafficGbps: Math.max(5, +(node.metrics.trafficGbps + (Math.random() - 0.48) * 4).toFixed(1)),
          },
        }))
      );
    }, 2500);

    return () => clearInterval(timer);
  }, [isPolling]);

  // 2. 동적 장비 추가 (SNMP Discovery 시뮬레이션)
  const handleAddNewDevice = () => {
    const newNode: NetworkNode = {
      id: `CUSTOM_DEV_${Date.now()}`,
      name: `Jeju-Smart-Core-${Math.floor(Math.random() * 90 + 10)}`,
      type: 'CORE_L3_SWITCH',
      category: 'SWITCH',
      lat: 33.4996 + (Math.random() - 0.5) * 0.05,
      lng: 126.5312 + (Math.random() - 0.5) * 0.05,
      altitude: 70,
      status: 'NORMAL',
      postalCode: '63000',
      province: '제주특별자치도',
      cityDistrict: '제주시',
      address: '제주특별자치도 제주시 첨단로 242 (제주글로벌스마트센터)',
      stationName: '제주스마트국사',
      rackLocation: 'Rack-08-Slot01',
      ipAddress: `172.16.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
      vendor: 'HFR',
      model: 'Smart-Switch-100G',
      metrics: {
        cpuPercent: 28,
        memoryPercent: 44,
        tempCelsius: 24,
        trafficGbps: 58.2,
        portCount: 48,
        activePorts: 42,
      },
      alarms: [],
    };

    setNodes(prev => [...prev, newNode]);

    // 제주 신규 노드와 서울 광화문 간 100G 백본 링크 연결
    const newEdge: NetworkEdge = {
      id: `EDGE_CUSTOM_${Date.now()}`,
      source: newNode.id,
      target: nodes[0]?.id || 'NODE_KR_03186_01',
      sourceCoordinates: [newNode.lng, newNode.lat],
      targetCoordinates: [nodes[0]?.lng || 126.9784, nodes[0]?.lat || 37.5714],
      linkType: 'BACKBONE_100G',
      status: 'UP',
      bandwidthGbps: 100,
      trafficUtilPercent: 42,
      latencyMs: 14.5,
      packetLossPercent: 0,
      alarms: [],
    };

    setEdges(prev => [...prev, newEdge]);
  };

  // 3. 특정 장비 CRITICAL 장애 주입
  const handleInjectFault = () => {
    setNodes(prev =>
      prev.map((node, idx) => {
        if (idx === 0) {
          return {
            ...node,
            status: 'CRITICAL',
            metrics: { ...node.metrics, cpuPercent: 99, trafficGbps: 118.0 },
            alarms: [
              {
                id: `ALM_FAULT_${Date.now()}`,
                severity: 'CRITICAL',
                code: 'SNMP_BGP_SESSION_DOWN',
                title: 'BGP Peering Session Reset',
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
                description: '인접 AS 번호와의 세션 타임아웃으로 인한 경로 재계산 부하 급증',
              },
            ],
          };
        }
        return node;
      })
    );
  };

  // 4. 장애 초기화
  const handleResetFault = () => {
    setNodes(prev =>
      prev.map(node => ({
        ...node,
        status: 'NORMAL',
        metrics: { ...node.metrics, cpuPercent: 30 },
        alarms: [],
      }))
    );
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 동적으로 주입되는 nodes & edges 상태를 뷰어에 전달 */}
      <GeoTopologyViewer
        nodes={nodes}
        edges={edges}
        showDashboard={true}
        onNodeSelect={(node) => {
          console.log('[CustomData] 선택 노드:', node);
        }}
      />

      {/* 실시간 커스텀 데이터 조작 툴바 */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 18px',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.5)',
          borderRadius: 30,
          boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>
          <Activity size={16} />
          <span>📡 샘플 2: 실시간 REST/SNMP 폴링 ({nodes.length}대 장비)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: 'rgba(56, 189, 248, 0.15)', fontSize: 11, color: '#38bdf8' }}>
          <Radio size={12} className="animate-pulse" />
          <span>Telemetry Polling #{pulseCount}</span>
        </div>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />

        <button
          onClick={handleAddNewDevice}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(56, 189, 248, 0.2)',
            border: '1px solid #38bdf8',
            borderRadius: 6,
            padding: '4px 10px',
            color: '#f8fafc',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          제주 국사 신규 장비 추가
        </button>

        <button
          onClick={handleInjectFault}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: 6,
            padding: '4px 10px',
            color: '#fca5a5',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <AlertOctagon size={14} />
          BGP 장애 주입
        </button>

        <button
          onClick={handleResetFault}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid #10b981',
            borderRadius: 6,
            padding: '4px 10px',
            color: '#86efac',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} />
          복구
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
            marginLeft: 4,
          }}
        >
          <BookOpen size={14} />
          가이드
        </a>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CustomDataSample />
  </React.StrictMode>
);
