import React, { useState } from 'react';
import {
  Map,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  SlidersHorizontal,
  Compass,
  Radio,
  Box,
  Tag,
  Mountain,
  Milestone,
  Waves,
  Building,
} from 'lucide-react';
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
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'MAP_LAYERS' | 'TOPOLOGY'>('MAP_LAYERS');

  const toggleLayer = (key: keyof LayerVisibilityConfig) => {
    onChangeLayerConfig({
      ...layerConfig,
      [key]: !layerConfig[key],
    });
  };

  const toggleLodMode = () => {
    onChangeLayerConfig({
      ...layerConfig,
      lodMode: layerConfig.lodMode === 'SMART_AUTO' ? 'ALWAYS_FULL' : 'SMART_AUTO',
    });
  };

  // 네이버 지도 스타일 원클릭 퀵 토글 칩 정의
  const quickToggles = [
    {
      key: 'showProvinceBorders' as const,
      label: '행정경계',
      icon: <Building size={13} />,
      isActive: layerConfig.showProvinceBorders,
      onToggle: () => {
        // 시도 경계와 시군구 경계를 함께 토글하거나 시도 경계 토글
        const nextVal = !layerConfig.showProvinceBorders;
        onChangeLayerConfig({
          ...layerConfig,
          showProvinceBorders: nextVal,
          showMuniBorders: nextVal,
        });
      },
    },
    {
      key: 'showHighways' as const,
      label: '도로망',
      icon: <Milestone size={13} />,
      isActive: layerConfig.showHighways,
      onToggle: () => toggleLayer('showHighways'),
    },
    {
      key: 'showWaterways' as const,
      label: '하천/수계',
      icon: <Waves size={13} />,
      isActive: layerConfig.showWaterways,
      onToggle: () => toggleLayer('showWaterways'),
    },
    {
      key: 'showCityLabels' as const,
      label: '도시지명',
      icon: <Compass size={13} />,
      isActive: layerConfig.showCityLabels,
      onToggle: () => toggleLayer('showCityLabels'),
    },
    {
      key: 'showMountainPeaks' as const,
      label: '명산/고도',
      icon: <Mountain size={13} />,
      isActive: layerConfig.showMountainPeaks,
      onToggle: () => toggleLayer('showMountainPeaks'),
    },
    {
      key: 'showBackboneEdges' as const,
      label: '3D 회선',
      icon: <Radio size={13} />,
      isActive: layerConfig.showBackboneEdges,
      onToggle: () => toggleLayer('showBackboneEdges'),
      isTopology: true,
    },
    {
      key: 'showEquipmentBoxes' as const,
      label: '장비 섀시',
      icon: <Box size={13} />,
      isActive: layerConfig.showEquipmentBoxes,
      onToggle: () => toggleLayer('showEquipmentBoxes'),
      isTopology: true,
    },
    {
      key: 'showDeviceLabels' as const,
      label: '장비 라벨',
      icon: <Tag size={13} />,
      isActive: layerConfig.showDeviceLabels,
      onToggle: () => toggleLayer('showDeviceLabels'),
      isTopology: true,
    },
    {
      key: 'lodMode' as const,
      label: layerConfig.lodMode === 'SMART_AUTO' ? '스마트 LOD' : '전체 표시',
      icon: <Sparkles size={13} />,
      isActive: layerConfig.lodMode === 'SMART_AUTO',
      onToggle: toggleLodMode,
      isSpecial: true,
    },
  ];

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
        gap: 8,
        pointerEvents: 'auto',
      }}
    >
      {/* 🧭 네이버 지도 스타일 지도 위 직관적인 퀵 토글 버튼 툴바 (Naver Map Style Quick Toolbar) */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 7px',
          borderRadius: 10,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
          flexWrap: 'wrap',
          maxWidth: 'calc(100vw - 32px)',
          justifyContent: 'flex-end',
        }}
      >
        {quickToggles.map(item => {
          const active = item.isActive;
          let activeBg = 'rgba(6, 182, 212, 0.25)';
          let activeBorder = '1px solid #06b6d4';
          let activeColor = '#38bdf8';

          if (item.isTopology) {
            activeBg = 'rgba(168, 85, 247, 0.25)';
            activeBorder = '1px solid #a855f7';
            activeColor = '#c084fc';
          } else if (item.isSpecial) {
            activeBg = 'rgba(16, 185, 129, 0.25)';
            activeBorder = '1px solid #10b981';
            activeColor = '#34d399';
          }

          return (
            <button
              key={item.label}
              onClick={item.onToggle}
              title={`${item.label} ${active ? '숨기기' : '표시하기'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                borderRadius: 7,
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                background: active ? activeBg : 'rgba(255, 255, 255, 0.04)',
                border: active ? activeBorder : '1px solid rgba(255, 255, 255, 0.08)',
                color: active ? activeColor : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                userSelect: 'none',
                boxShadow: active ? '0 0 10px rgba(6, 182, 212, 0.25)' : 'none',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: active ? (item.isTopology ? '#a855f7' : item.isSpecial ? '#10b981' : '#06b6d4') : '#475569',
                  boxShadow: active ? '0 0 6px currentColor' : 'none',
                  display: 'inline-block',
                }}
              />
            </button>
          );
        })}

        <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

        {/* ⚙️ 세부 레이어 & 지도 테마 서랍 버튼 */}
        <button
          onClick={() => setIsDetailOpen(!isDetailOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            borderRadius: 7,
            fontSize: 11,
            fontWeight: 700,
            background: isDetailOpen ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.08)',
            border: isDetailOpen ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
            color: isDetailOpen ? '#7dd3fc' : '#e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="지도 테마 전환 및 세부 레이어 옵션 패널 열기"
        >
          <SlidersHorizontal size={13} />
          <span>테마/세부</span>
          {isDetailOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* 2. 상세 테마/레이어 오버레이 패널 (필요 시 슬라이드 다운) */}
      {isDetailOpen && (
        <div
          className="glass-panel"
          style={{
            width: 320,
            maxHeight: 'calc(100vh - 140px)',
            overflowY: 'auto',
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
              배경 지도 및 테마
            </button>
            <button
              onClick={() => setActiveTab('TOPOLOGY')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                background: activeTab === 'TOPOLOGY' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                color: activeTab === 'TOPOLOGY' ? '#c084fc' : '#94a3b8',
                border: activeTab === 'TOPOLOGY' ? '1px solid rgba(168, 85, 247, 0.4)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Shield size={13} />
              관제 토폴로지 설정
            </button>
          </div>

          {/* TAB 1: 배경 지도 테마 및 세부 레이어 */}
          {activeTab === 'MAP_LAYERS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* 지도 테마 선택 셀렉터 */}
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

              {/* 세부 구성요소 체크박스 */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
                  📐 지도 구성요소 개별 토글
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
              <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', marginBottom: 4 }}>
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
                        style={{ accentColor: '#a855f7', width: 15, height: 15, cursor: 'pointer' }}
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
