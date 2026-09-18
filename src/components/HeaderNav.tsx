import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Eye,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Building2,
  MapPin,
  Map as MapIcon,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Keyboard,
  Clock,
  Activity,
  History,
  CornerDownLeft,
  Server,
  BookOpen,
} from 'lucide-react';
import { KOREA_POSTAL_DIRECTORY } from '../data/koreaPostalData';
import { FREE_MAP_OPTIONS } from '../data/mapStyles';
import type { MapStyleType } from '../data/mapStyles';
import type { PostalAddressItem, LabelConfig, NetworkNode, NetworkEdge } from '../types/topology';
import { soundFx } from '../utils/audio';

export interface HeaderNavProps {
  onSelectSearchTarget: (target: { lat: number; lng: number; zoom?: number; pitch?: number }, node?: NetworkNode) => void;
  is3DMode: boolean;
  onToggle3DMode: () => void;
  onResetView: () => void;
  onTriggerSimulatedAlarm: () => void;
  onClearSimulatedAlarms: () => void;
  hasActiveSimulation: boolean;
  currentMapStyle: MapStyleType;
  onChangeMapStyle: (style: MapStyleType) => void;
  labelConfig: LabelConfig;
  onChangeLabelConfig: (config: LabelConfig) => void;
  nodes?: NetworkNode[];
  edges?: NetworkEdge[];
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onSelectSearchTarget,
  is3DMode,
  onToggle3DMode,
  onResetView,
  onTriggerSimulatedAlarm,
  onClearSimulatedAlarms,
  hasActiveSimulation,
  currentMapStyle,
  onChangeMapStyle,
  labelConfig,
  onChangeLabelConfig,
  nodes = [],
  edges = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundFx.getMuted());
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [timeMode, setTimeMode] = useState<'KST' | 'UTC'>('KST');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('geotopo_recent_searches');
      return saved ? JSON.parse(saved) : ['06234 강남', '03186 광화문', '판교 데이터센터'];
    } catch {
      return ['06234 강남', '03186 광화문', '판교 데이터센터'];
    }
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // 실시간 관제 시계 (1초 단위 갱신)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      if (timeMode === 'KST') {
        const kstString = now.toLocaleTimeString('ko-KR', {
          timeZone: 'Asia/Seoul',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setCurrentTime(`KST ${kstString}`);
      } else {
        const utcString = now.toISOString().slice(11, 19);
        setCurrentTime(`UTC ${utcString}`);
      }
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [timeMode]);

  // 전역 단축키 핸들러 (/ 로 검색 포커스 등)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 인풋 필드 입력 중일 때는 전역 단축키 억제
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          setIsDropdownOpen(false);
          searchInputRef.current?.blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        soundFx.playClick();
        searchInputRef.current?.focus();
        setIsDropdownOpen(true);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        soundFx.playClick();
        onResetView();
      } else if (e.key === '3') {
        e.preventDefault();
        soundFx.playClick();
        onToggle3DMode();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const nextMute = soundFx.toggleMute();
        setIsMuted(nextMute);
      } else if (e.key === '?') {
        e.preventDefault();
        soundFx.playClick();
        setIsShortcutsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResetView, onToggle3DMode]);

  // 네트워크 종합 건전성 (Health Score) 실시간 산출
  const healthScore = useMemo(() => {
    if (nodes.length === 0) return 100;
    const critical = nodes.filter(n => n.status === 'CRITICAL').length;
    const major = nodes.filter(n => n.status === 'MAJOR').length;
    const minor = nodes.filter(n => n.status === 'MINOR').length;
    const downEdges = edges.filter(e => e.status === 'DOWN').length;

    const penalty = critical * 18 + major * 8 + minor * 3 + downEdges * 12;
    const score = Math.max(0, Math.min(100, 100 - penalty));
    return Number(score.toFixed(1));
  }, [nodes, edges]);

  // 우편번호 및 주소 실시간 검색 필터링
  const filteredPostalItems = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.trim().toLowerCase();

    return KOREA_POSTAL_DIRECTORY.filter(item => {
      return (
        item.postalCode.includes(term) ||
        item.fullAddress.toLowerCase().includes(term) ||
        item.province.toLowerCase().includes(term) ||
        item.cityDistrict.toLowerCase().includes(term) ||
        item.dongOrRoad.toLowerCase().includes(term)
      );
    }).slice(0, 8); // 상위 8개 표시
  }, [searchTerm]);

  // 실시간 장비명/모델/IP 검색 필터링
  const filteredDeviceItems = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!nodes) return [];

    return nodes.filter(n => {
      return (
        n.name.toLowerCase().includes(term) ||
        n.stationName.toLowerCase().includes(term) ||
        n.postalCode.includes(term) ||
        n.ipAddress.includes(term) ||
        n.model.toLowerCase().includes(term) ||
        n.vendor.toLowerCase().includes(term)
      );
    }).slice(0, 6);
  }, [searchTerm, nodes]);

  const handleSelectDevice = (dev: NetworkNode) => {
    soundFx.playFocus();
    onSelectSearchTarget({
      lat: dev.lat,
      lng: dev.lng,
      zoom: 16.5,
      pitch: is3DMode ? 60 : 0,
    }, dev);
    const label = `[${dev.postalCode}] ${dev.name}`;
    setSearchTerm(label);
    saveRecentSearch(`${dev.name} (${dev.model})`);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
  };

  const saveRecentSearch = (text: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== text);
      const updated = [text, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('geotopo_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSelect = (item: PostalAddressItem) => {
    soundFx.playFocus();
    onSelectSearchTarget({
      lat: item.lat,
      lng: item.lng,
      zoom: 15.2,
      pitch: is3DMode ? 60 : 0,
    });
    const label = `[${item.postalCode}] ${item.fullAddress}`;
    setSearchTerm(label);
    saveRecentSearch(`${item.postalCode} ${item.dongOrRoad}`);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
  };

  // 키보드로 드롭다운 항목 탐색 (위/아래 방향키 및 Enter)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredPostalItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredPostalItems.length) {
        handleSelect(filteredPostalItems[selectedIndex]);
      } else if (filteredPostalItems.length > 0) {
        handleSelect(filteredPostalItems[0]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <>
      <header
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          pointerEvents: 'auto',
        }}
      >
        {/* 1. 로고 및 시스템 타이틀 + 실시간 NOC 상태 */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '8px 16px',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.5)',
              flexShrink: 0,
            }}
          >
            <Building2 size={20} color="#fff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5, color: '#f8fafc' }}>
                GeoTopology <span style={{ color: '#38bdf8' }}>3D</span>
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                NOC LIVE
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
              <span>대한민국 5자리 우편번호 기반 네트워크 관제</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <span style={{ color: '#06b6d4', fontWeight: 600 }}>100% OFFLINE</span>
            </div>
          </div>

          {/* 종합 건전성 미니 게이지 */}
          <div
            style={{
              marginLeft: 8,
              paddingLeft: 12,
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#94a3b8' }}>
              <Activity size={12} color={healthScore > 90 ? '#10b981' : healthScore > 70 ? '#f97316' : '#ef4444'} />
              <span>건전성</span>
              <strong
                className="font-mono"
                style={{
                  fontSize: 12,
                  color: healthScore > 90 ? '#34d399' : healthScore > 70 ? '#fb923c' : '#f87171',
                }}
              >
                {healthScore}%
              </strong>
            </div>
            <div style={{ width: 64, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${healthScore}%`,
                  height: '100%',
                  background: healthScore > 90 ? '#10b981' : healthScore > 70 ? '#f97316' : '#ef4444',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* 2. 중앙 대한민국 우편번호 / 주소록 옴니서치 창 */}
        <div style={{ position: 'relative', width: 460 }}>
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 14px',
              gap: 10,
              boxShadow: isDropdownOpen ? '0 0 20px rgba(56, 189, 248, 0.3)' : undefined,
              borderColor: isDropdownOpen ? '#38bdf8' : undefined,
            }}
          >
            <Search size={18} color="#38bdf8" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleInputKeyDown}
              placeholder="우편번호(5자리) 또는 도로명/국사명 검색 (/ 키로 포커스)"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: 13,
                width: '100%',
              }}
            />

            {searchTerm ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedIndex(-1);
                  searchInputRef.current?.focus();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: '2px 4px',
                }}
              >
                ✕
              </button>
            ) : (
              <div
                style={{
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                /
              </div>
            )}
          </div>

          {/* 검색 결과 및 최근 검색어 드롭다운 */}
          {isDropdownOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 6,
                maxHeight: 380,
                overflowY: 'auto',
                padding: '6px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.75)',
              }}
            >
              {(filteredDeviceItems.length > 0 || filteredPostalItems.length > 0) ? (
                <>
                  {/* 1. 통신 장비 검색 결과 */}
                  {filteredDeviceItems.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ padding: '6px 10px', fontSize: 11, color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Server size={12} />
                        <span>통신 장비 검색 결과 ({filteredDeviceItems.length}대)</span>
                      </div>
                      {filteredDeviceItems.map(dev => {
                        const sevColor = dev.status === 'CRITICAL' ? '#ef4444' : dev.status === 'MAJOR' ? '#f97316' : dev.status === 'MINOR' ? '#eab308' : '#10b981';
                        return (
                          <div
                            key={dev.id}
                            onClick={() => handleSelectDevice(dev)}
                            style={{
                              padding: '7px 10px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              background: 'rgba(255, 255, 255, 0.03)',
                              borderLeft: `3px solid ${sevColor}`,
                              marginBottom: 4,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: sevColor, padding: '1px 4px', borderRadius: 3, background: `${sevColor}20` }}>
                                {dev.status}
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>
                                {dev.name}
                              </span>
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                [{dev.postalCode}] {dev.stationName}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="font-mono" style={{ fontSize: 10, color: '#38bdf8' }}>
                                {dev.ipAddress}
                              </span>
                              <CornerDownLeft size={12} color="#64748b" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. 통신국사/우편번호 검색 결과 */}
                  {filteredPostalItems.length > 0 && (
                    <div>
                      <div style={{ padding: '6px 10px', fontSize: 11, color: '#64748b', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                        <span>통신 국사 거점 ({filteredPostalItems.length}개소)</span>
                        <span style={{ fontSize: 10, color: '#475569' }}>↑↓ 이동, Enter 선택</span>
                      </div>
                      {filteredPostalItems.map((item, index) => {
                        const isSelected = selectedIndex === index;
                        return (
                          <div
                            key={item.postalCode + item.fullAddress}
                            onClick={() => handleSelect(item)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                              border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                              transition: 'background 0.12s ease',
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <MapPin size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span
                                  className="font-mono"
                                  style={{
                                    padding: '1px 6px',
                                    background: 'rgba(56, 189, 248, 0.2)',
                                    color: '#38bdf8',
                                    borderRadius: 4,
                                    fontSize: 11,
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {item.postalCode}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
                                  {item.dongOrRoad}
                                </span>
                                <span style={{ fontSize: 11, color: '#64748b' }}>
                                  {item.province} {item.cityDistrict}
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {item.fullAddress}
                              </div>
                            </div>
                            <CornerDownLeft size={14} color="#64748b" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : !searchTerm.trim() ? (
                /* 최근 검색어 추천 */
                <div style={{ padding: '6px 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', padding: '4px 6px', marginBottom: 4 }}>
                    <History size={12} />
                    <span>최근 관제 검색지</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {recentSearches.map(term => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchTerm(term);
                          soundFx.playClick();
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#cbd5e1',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                  일치하는 우편번호 또는 주소가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. 우측 컨트롤 도구들 & 실시간 시계 */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 14px',
          }}
        >
          {/* 실시간 디지털 관제 시계 (클릭 시 KST/UTC 전환) */}
          <button
            onClick={() => {
              setTimeMode(prev => (prev === 'KST' ? 'UTC' : 'KST'));
              soundFx.playClick();
            }}
            title="실시간 관제 시계 (클릭 시 KST / UTC 전환)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              padding: '5px 9px',
              color: '#38bdf8',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <Clock size={14} />
            <span className="font-mono" style={{ fontWeight: 600 }}>{currentTime}</span>
          </button>

          {/* 지도 스타일 셀렉터 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapIcon size={15} color="#38bdf8" />
            <select
              value={currentMapStyle}
              onChange={e => {
                onChangeMapStyle(e.target.value as MapStyleType);
                soundFx.playClick();
              }}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {FREE_MAP_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                  {opt.badge === 'OFFLINE' ? '⚡ ' : '🌐 '} {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* 라벨 규칙 설정 드롭다운 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setIsLabelMenuOpen(!isLabelMenuOpen);
                soundFx.playClick();
              }}
              title="노드 라벨 표시 항목 및 국사 밀집 장비 규칙 설정"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                background: isLabelMenuOpen ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: isLabelMenuOpen ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                color: isLabelMenuOpen ? '#38bdf8' : '#cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <SlidersHorizontal size={14} />
              라벨 규칙
            </button>

            {isLabelMenuOpen && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  width: 290,
                  padding: '14px 16px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>🏷️ 노드 라벨 표시 항목</span>
                  <button
                    onClick={() => setIsLabelMenuOpen(false)}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12 }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12 }}>
                  {[
                    { key: 'showName' as const, label: '장비 이름 (기본)' },
                    { key: 'showRegion' as const, label: '소속 국사 및 지역명' },
                    { key: 'showIp' as const, label: 'IP 주소' },
                    { key: 'showAlarm' as const, label: '경보 상태 / 건수 배지' },
                    { key: 'showPostalCode' as const, label: '5자리 우편번호' },
                    { key: 'showMetrics' as const, label: '실시간 트래픽 / CPU' },
                  ].map(item => {
                    const checked = labelConfig[item.key];
                    return (
                      <label
                        key={item.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: checked ? '#f1f5f9' : '#94a3b8',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            soundFx.playClick();
                            onChangeLabelConfig({
                              ...labelConfig,
                              [item.key]: !checked,
                            });
                          }}
                          style={{ accentColor: '#06b6d4', cursor: 'pointer' }}
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
                    🏢 동일 국사 다중 장비 밀집 규칙
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer', color: labelConfig.coLocationMode === 'SMART_STATION_GROUP' ? '#f1f5f9' : '#94a3b8' }}>
                      <input
                        type="radio"
                        name="coLocation"
                        checked={labelConfig.coLocationMode === 'SMART_STATION_GROUP'}
                        onChange={() => {
                          soundFx.playClick();
                          onChangeLabelConfig({ ...labelConfig, coLocationMode: 'SMART_STATION_GROUP' });
                        }}
                        style={{ accentColor: '#06b6d4', marginTop: 2 }}
                      />
                      <div>
                        <strong style={{ color: '#38bdf8' }}>스마트 국사 그룹화 (권장)</strong>
                        <div style={{ fontSize: 10, color: '#64748b' }}>국사 통합 배지 + 컴팩트 장비 라벨로 겹침 방지</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer', color: labelConfig.coLocationMode === 'INDIVIDUAL_ALL' ? '#f1f5f9' : '#94a3b8' }}>
                      <input
                        type="radio"
                        name="coLocation"
                        checked={labelConfig.coLocationMode === 'INDIVIDUAL_ALL'}
                        onChange={() => {
                          soundFx.playClick();
                          onChangeLabelConfig({ ...labelConfig, coLocationMode: 'INDIVIDUAL_ALL' });
                        }}
                        style={{ accentColor: '#06b6d4', marginTop: 2 }}
                      />
                      <div>
                        <strong>모든 장비 개별 전체 라벨</strong>
                        <div style={{ fontSize: 10, color: '#64748b' }}>모든 개별 장비에 선택한 항목 전체 출력</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)' }} />

          {/* 3D 모드 토글 */}
          <button
            onClick={() => {
              soundFx.playClick();
              onToggle3DMode();
            }}
            title="3D 입체 뷰 / 2D 평면 뷰 전환 (단축키 3)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              background: is3DMode ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: is3DMode ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
              color: is3DMode ? '#38bdf8' : '#94a3b8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Eye size={15} />
            {is3DMode ? '3D 틸트' : '2D 평면'}
          </button>

          {/* 전도 보기 (카메라 리셋) */}
          <button
            onClick={() => {
              soundFx.playFocus();
              onResetView();
            }}
            title="대한민국 전도 보기로 리셋 (단축키 F)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
            전도
          </button>

          {/* 오디오 사운드 Mute/Unmute 스위치 */}
          <button
            onClick={() => {
              const nextMute = soundFx.toggleMute();
              setIsMuted(nextMute);
            }}
            title={isMuted ? '관제 사운드 켜기 (단축키 M)' : '관제 사운드 음소거 (단축키 M)'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 6,
              background: !isMuted ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: !isMuted ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: !isMuted ? '#38bdf8' : '#64748b',
              cursor: 'pointer',
            }}
          >
            {!isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* 단축키 가이드 모달 토글 */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsShortcutsOpen(true);
            }}
            title="단축키 가이드 (? 키)"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <Keyboard size={16} />
          </button>

          <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)' }} />

          {/* 개발자 가이드 및 인터랙티브 샘플 포털 링크 */}
          <a
            href="/guide.html"
            target="_blank"
            rel="noreferrer"
            title="개발자 가이드 및 라이브 샘플 포털 열기"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            <BookOpen size={15} />
            가이드 & 샘플
          </a>

          {/* 장애 시뮬레이터 토글 */}
          {!hasActiveSimulation ? (
            <button
              onClick={() => {
                soundFx.playAlarm();
                onTriggerSimulatedAlarm();
              }}
              title="테스트용 임의의 백본 단선 및 장비 장애 주입"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#fca5a5',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.25)',
              }}
            >
              <ShieldAlert size={15} />
              장애 시뮬레이션
            </button>
          ) : (
            <button
              onClick={() => {
                soundFx.playSuccess();
                onClearSimulatedAlarms();
              }}
              title="모든 시뮬레이션 장애 복구"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                color: '#86efac',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)',
              }}
            >
              <CheckCircle2 size={15} />
              장애 정상화 복구
            </button>
          )}
        </div>
      </header>

      {/* 단축키 가이드 모달 */}
      {isShortcutsOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsShortcutsOpen(false)}
        >
          <div
            className="glass-panel"
            onClick={e => e.stopPropagation()}
            style={{
              width: 400,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Keyboard size={18} color="#38bdf8" />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>관제 시스템 단축키 안내</span>
              </div>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {[
                { key: '/', desc: '우편번호/국사 옴니서치 즉시 포커스' },
                { key: 'F', desc: '대한민국 전도 보기로 카메라 리셋' },
                { key: '3', desc: '3D 틸트 모드 / 2D 평면 모드 전환' },
                { key: 'M', desc: '관제 사운드 효과음 음소거 토글' },
                { key: 'ESC', desc: '검색 드롭다운 및 상세 서랍 닫기' },
                { key: '?', desc: '이 단축키 도움말 창 열기/닫기' },
              ].map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#cbd5e1' }}>{s.desc}</span>
                  <kbd
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: 4,
                      padding: '2px 8px',
                      color: '#38bdf8',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, textAlign: 'right' }}>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid #38bdf8',
                  color: '#f8fafc',
                  padding: '6px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
