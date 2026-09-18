import React, { useState } from 'react';
import {
  Compass,
  Radio,
  Box,
  Tag,
  Mountain,
  Milestone,
  Waves,
  Building,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Navigation,
  Globe2,
} from 'lucide-react';
import { FREE_MAP_OPTIONS } from '../data/mapStyles';
import type { MapStyleType } from '../data/mapStyles';
import type { LayerVisibilityConfig } from '../types/topology';
import { soundFx } from '../utils/audio';

export interface RightMapOverlayProps {
  currentMapStyle: MapStyleType;
  onChangeMapStyle: (style: MapStyleType) => void;
  layerConfig: LayerVisibilityConfig;
  onChangeLayerConfig: (config: LayerVisibilityConfig) => void;
  currentZoom: number;
  onJumpRegion?: (target: { lat: number; lng: number; zoom: number; pitch: number }) => void;
}

export const RightMapOverlay: React.FC<RightMapOverlayProps> = ({
  currentMapStyle,
  onChangeMapStyle,
  layerConfig,
  onChangeLayerConfig,
  currentZoom,
  onJumpRegion,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'MAP_LAYERS' | 'PRESETS'>('MAP_LAYERS');

  const toggleLayer = (key: keyof LayerVisibilityConfig) => {
    soundFx.playClick();
    onChangeLayerConfig({
      ...layerConfig,
      [key]: !layerConfig[key],
    });
  };

  // 6대 권역 카메라 퀵 점프 프리셋
  const regionPresets = [
    { name: '전국 전도', lat: 36.3, lng: 127.5, zoom: 6.8, pitch: 48 },
    { name: '수도권', lat: 37.53, lng: 126.98, zoom: 10.6, pitch: 58 },
    { name: '영남권 (부산/대구)', lat: 35.55, lng: 128.8, zoom: 10.2, pitch: 55 },
    { name: '충청/세종/대전', lat: 36.45, lng: 127.25, zoom: 10.8, pitch: 58 },
    { name: '호남권 (광주/전남)', lat: 35.15, lng: 126.85, zoom: 10.2, pitch: 52 },
    { name: '강원/제주', lat: 34.8, lng: 127.8, zoom: 8.5, pitch: 48 },
  ];

  // 퀵 토글 칩 정의
  const quickToggles = [
    {
      key: 'showProvinceBorders' as const,
      label: '행정경계',
      icon: <Building size={13} />,
      isActive: layerConfig.showProvinceBorders,
      onToggle: () => {
        soundFx.playClick();
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
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 84,
        right: 14,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
        pointerEvents: 'auto',
      }}
    >
      {/* 1. 카카오/네이버 지도 스타일 퀵 토글 툴바 */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 6px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}
      >
        {quickToggles.map(t => {
          const activeBg = t.isTopology ? 'rgba(6, 182, 212, 0.25)' : 'rgba(56, 189, 248, 0.25)';
          const activeBorder = t.isTopology ? '#06b6d4' : '#38bdf8';
          const activeColor = t.isTopology ? '#22d3ee' : '#38bdf8';

          return (
            <button
              key={t.key}
              onClick={t.onToggle}
              title={`${t.label} ${t.isActive ? '가시화 켜짐' : '가시화 꺼짐'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 9px',
                borderRadius: 6,
                border: t.isActive ? `1px solid ${activeBorder}` : '1px solid rgba(255, 255, 255, 0.08)',
                background: t.isActive ? activeBg : 'rgba(255, 255, 255, 0.03)',
                color: t.isActive ? activeColor : '#94a3b8',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}

        <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.1)', margin: '0 2px' }} />

        {/* 상세 레이어 및 권역 프리셋 패널 토글 버튼 */}
        <button
          onClick={() => {
            soundFx.playClick();
            setIsDetailOpen(!isDetailOpen);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            borderRadius: 6,
            border: isDetailOpen ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
            background: isDetailOpen ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: isDetailOpen ? '#38bdf8' : '#cbd5e1',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={13} />
          <span>권역/스타일</span>
          {isDetailOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* 2. 드롭다운 상세 제어 팝오버 (권역 프리셋 및 지도 테마 상세) */}
      {isDetailOpen && (
        <div
          className="glass-panel"
          style={{
            width: 320,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
          }}
        >
          {/* 상단 탭 */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 6 }}>
            <button
              className={`noc-tab-btn ${activeTab === 'PRESETS' ? 'active' : ''}`}
              onClick={() => {
                soundFx.playClick();
                setActiveTab('PRESETS');
              }}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Navigation size={13} />
              <span>권역 퀵 점프</span>
            </button>
            <button
              className={`noc-tab-btn ${activeTab === 'MAP_LAYERS' ? 'active' : ''}`}
              onClick={() => {
                soundFx.playClick();
                setActiveTab('MAP_LAYERS');
              }}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Globe2 size={13} />
              <span>지도 테마</span>
            </button>
          </div>

          {/* 권역 퀵 점프 프리셋 탭 */}
          {activeTab === 'PRESETS' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {regionPresets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    soundFx.playFocus();
                    if (onJumpRegion) {
                      onJumpRegion({
                        lat: preset.lat,
                        lng: preset.lng,
                        zoom: preset.zoom,
                        pitch: preset.pitch,
                      });
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#f1f5f9',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#38bdf8')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                >
                  <span>{preset.name}</span>
                  <span className="font-mono" style={{ fontSize: 10, color: '#38bdf8' }}>z{preset.zoom}</span>
                </button>
              ))}
            </div>
          )}

          {/* 지도 테마 선택 탭 */}
          {activeTab === 'MAP_LAYERS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
              {FREE_MAP_OPTIONS.map(opt => {
                const isCurrent = currentMapStyle === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      soundFx.playClick();
                      onChangeMapStyle(opt.id);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: isCurrent ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: isCurrent ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc' }}>
                        {opt.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{opt.description}</div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: opt.badge === 'OFFLINE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                        color: opt.badge === 'OFFLINE' ? '#34d399' : '#38bdf8',
                      }}
                    >
                      {opt.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
            <span>현재 줌: z{currentZoom.toFixed(1)}</span>
            <span>MapLibre GL + Deck.gl 9.4</span>
          </div>
        </div>
      )}
    </div>
  );
};
