import React, { useState } from 'react';
import { Layers, Map, Sparkles, Check, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { FREE_MAP_OPTIONS } from '../data/mapStyles';
import type { MapStyleType } from '../data/mapStyles';
import type { LayerVisibilityConfig } from '../types/topology';

interface RightMapOverlayProps {
  currentMapStyle: MapStyleType;
  onChangeMapStyle: (style: MapStyleType) => void;
  layerConfig: LayerVisibilityConfig;
  onChangeLayerConfig: (config: LayerVisibilityConfig) => void;
  currentZoom: number;
}

export const RightMapOverlay: React.FC<RightMapOverlayProps> = ({
  currentMapStyle,
  onChangeMapStyle,
  layerConfig,
  onChangeLayerConfig,
  currentZoom,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'MAP_LAYERS' | 'TOPOLOGY'>('MAP_LAYERS');

  const toggleLayer = (key: keyof LayerVisibilityConfig) => {
    onChangeLayerConfig({
      ...layerConfig,
      [key]: !layerConfig[key],
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 76,
        right: 16,
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'auto',
      }}
    >
      {/* 1. 우측 플로팅 레이어 컨트롤 버튼 (카카오/네이버 지도 스타일) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          background: isOpen ? 'rgba(6, 182, 212, 0.25)' : 'rgba(15, 23, 42, 0.85)',
          border: isOpen ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 8,
          color: isOpen ? '#38bdf8' : '#f1f5f9',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease',
        }}
        title="지도 및 관제 레이어 표시 설정"
      >
        <Layers size={16} color={isOpen ? '#38bdf8' : '#38bdf8'} />
        <span>레이어 옵션</span>
        <span
          style={{
            fontSize: 10,
            padding: '1px 6px',
            borderRadius: 4,
            background: 'rgba(6, 182, 212, 0.3)',
            color: '#67e8f9',
          }}
        >
          {layerConfig.lodMode === 'SMART_AUTO' ? '스마트 LOD' : '전체'}
        </span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* 2. 펼쳐졌을 때 나타나는 오른쪽 반투명 오버레이 패널 */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            width: 320,
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            marginTop: 8,
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
            borderRadius: 12,
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          {/* 패널 헤더: 탭 전환 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 8,
              padding: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              onClick={() => setActiveTab('MAP_LAYERS')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                background: activeTab === 'MAP_LAYERS' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                color: activeTab === 'MAP_LAYERS' ? '#38bdf8' : '#94a3b8',
                border: activeTab === 'MAP_LAYERS' ? '1px solid rgba(6, 182, 212, 0.4)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Map size={13} />
              배경 지도 레이어
            </button>
            <button
              onClick={() => setActiveTab('TOPOLOGY')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                background: activeTab === 'TOPOLOGY' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                color: activeTab === 'TOPOLOGY' ? '#38bdf8' : '#94a3b8',
                border: activeTab === 'TOPOLOGY' ? '1px solid rgba(6, 182, 212, 0.4)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Shield size={13} />
              관제 토폴로지 레이어
            </button>
          </div>

          {/* 🎯 전도 조잡함 방지 스마트 디테일 제어 (LOD) 토글 */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: layerConfig.lodMode === 'SMART_AUTO'
                ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(14, 165, 233, 0.05) 100%)'
                : 'rgba(255, 255, 255, 0.03)',
              border: layerConfig.lodMode === 'SMART_AUTO'
                ? '1px solid rgba(6, 182, 212, 0.35)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="#38bdf8" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>전도 뷰 스마트 정돈 (LOD)</span>
              </div>
              <button
                onClick={() =>
                  onChangeLayerConfig({
                    ...layerConfig,
                    lodMode: layerConfig.lodMode === 'SMART_AUTO' ? 'ALWAYS_FULL' : 'SMART_AUTO',
                  })
                }
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: layerConfig.lodMode === 'SMART_AUTO' ? '#0284c7' : '#334155',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {layerConfig.lodMode === 'SMART_AUTO' ? '권장 활성 ON' : '항상 전체 OFF'}
              </button>
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>
              {layerConfig.lodMode === 'SMART_AUTO'
                ? '✨ 줌아웃(전도) 시 주요 광역 거점·명산만 간결하게 표출하여 조잡함을 없애고, 줌인할수록 세부 시군구와 장비가 순차적으로 나타납니다.'
                : '⚠️ 줌 레벨과 무관하게 모든 시군구 경계, 268개 지명, 30개 산이 항상 최대로 출력됩니다.'}
            </div>
          </div>

          {/* TAB 1: 배경 지도 레이어 설정 */}
          {activeTab === 'MAP_LAYERS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* 지도 스타일 선택 셀렉터 */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
                  🗺️ 지도 테마 선택 (현재: 줌 {currentZoom.toFixed(1)})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {FREE_MAP_OPTIONS.map(opt => {
                    const isSelected = opt.id === currentMapStyle;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onChangeMapStyle(opt.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.06)',
                          color: isSelected ? '#38bdf8' : '#cbd5e1',
                          fontSize: 11,
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, padding: '1px 4px', borderRadius: 3, background: opt.badge === 'OFFLINE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)', color: opt.badge === 'OFFLINE' ? '#34d399' : '#38bdf8' }}>
                            {opt.badge}
                          </span>
                          <span>{opt.name.replace(/^[💾🌐🛰️]\s*(\[.*?\])?\s*/, '')}</span>
                        </div>
                        {isSelected && <Check size={14} color="#06b6d4" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 배경 레이어 요소별 체크박스 */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
                  📐 지도 구성 요소 표시 토글
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                  {[
                    { key: 'showProvinceBorders' as const, label: '17개 광역시도 경계선', desc: '네온 청록 외곽 경계선' },
                    { key: 'showMuniBorders' as const, label: '250개 시·군·구 내부 경계선', desc: '지역 세부 행정 경계' },
                    { key: 'showHighways' as const, label: '전국 고속도로망 및 대동맥', desc: '경부/서해안/중부 등 고속도로' },
                    { key: 'showWaterways' as const, label: '주요 하천 및 수계', desc: '한강, 낙동강, 금강, 영산강' },
                    { key: 'showCityLabels' as const, label: '도시 및 지역 지명 라벨', desc: '전국 거점 도시 및 시군구명' },
                    { key: 'showMountainPeaks' as const, label: '30대 명산 및 해발고도 표고점', desc: '▲ 설악산(1708m), 지리산 등' },
                  ].map(item => {
                    const checked = layerConfig[item.key];
                    return (
                      <label
                        key={item.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 8px',
                          borderRadius: 5,
                          background: checked ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span style={{ color: checked ? '#f1f5f9' : '#64748b', fontWeight: checked ? 600 : 400 }}>
                            {item.label}
                          </span>
                          <span style={{ fontSize: 9, color: '#64748b' }}>{item.desc}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLayer(item.key)}
                          style={{ accentColor: '#06b6d4', width: 15, height: 15, cursor: 'pointer' }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 관제 토폴로지 레이어 설정 */}
          {activeTab === 'TOPOLOGY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>
                📡 3D 토폴로지 관제 객체 토글
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                {[
                  { key: 'showBackboneEdges' as const, label: '3D 백본/메트로 회선 (Arc)', desc: '100G/40G 포물선 아크 회선' },
                  { key: 'showEquipmentBoxes' as const, label: '국사/장비 섀시 (3D Box)', desc: '4각 랙 장비 형태 및 고도' },
                  { key: 'showSummaryNodes' as const, label: '광역/국사 요약 카드 (Summary)', desc: '시도 및 국사 단위 클러스터 카드' },
                  { key: 'showDeviceLabels' as const, label: '장비 텍스트 라벨 (Text)', desc: '장비명, IP, 메트릭 텍스트' },
                  { key: 'showAlarmPulses' as const, label: '장애 경보 펄스 링 (Pulse)', desc: 'Critical/Major 위치 강조 링' },
                ].map(item => {
                  const checked = layerConfig[item.key];
                  return (
                    <label
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '5px 8px',
                        borderRadius: 5,
                        background: checked ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ color: checked ? '#f1f5f9' : '#64748b', fontWeight: checked ? 600 : 400 }}>
                          {item.label}
                        </span>
                        <span style={{ fontSize: 9, color: '#64748b' }}>{item.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLayer(item.key)}
                        style={{ accentColor: '#06b6d4', width: 15, height: 15, cursor: 'pointer' }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 하단 리셋 버튼 */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() =>
                onChangeLayerConfig({
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
                  lodMode: 'SMART_AUTO',
                })
              }
              style={{
                fontSize: 10,
                color: '#94a3b8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              기본값으로 복원
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
