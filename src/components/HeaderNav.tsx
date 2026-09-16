import React, { useState, useMemo } from 'react';
import { Search, Eye, ShieldAlert, CheckCircle2, RotateCcw, Building2, MapPin, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import { KOREA_POSTAL_DIRECTORY } from '../data/koreaPostalData';
import { FREE_MAP_OPTIONS } from '../data/mapStyles';
import type { MapStyleType } from '../data/mapStyles';
import type { PostalAddressItem, LabelConfig } from '../types/topology';

interface HeaderNavProps {
  onSelectSearchTarget: (target: { lat: number; lng: number; zoom?: number; pitch?: number }) => void;
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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);

  // 우편번호 및 주소 실시간 검색 필터링
  const filteredPostalItems = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.trim().toLowerCase();

    return KOREA_POSTAL_DIRECTORY.filter(item => {
      return (
        item.postalCode.includes(term) ||
        item.fullAddress.toLowerCase().includes(term) ||
        item.province.toLowerCase().includes(term) ||
        item.cityDistrict.toLowerCase().includes(term)
      );
    }).slice(0, 7); // 상위 7개 표시
  }, [searchTerm]);

  const handleSelect = (item: PostalAddressItem) => {
    onSelectSearchTarget({
      lat: item.lat,
      lng: item.lng,
      zoom: 14.5,
      pitch: 58,
    });
    setSearchTerm(`[${item.postalCode}] ${item.fullAddress}`);
    setIsDropdownOpen(false);
  };

  return (
    <header
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        pointerEvents: 'auto',
      }}
    >
      {/* 로고 및 시스템 타이틀 */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 20px',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(6, 182, 212, 0.5)',
          }}
        >
          <Building2 size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5, color: '#f8fafc' }}>
            GeoTopology <span style={{ color: '#38bdf8' }}>3D</span>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: 0.5 }}>
            대한민국 우편번호 기반 네트워크 관제 시스템
          </div>
        </div>
      </div>

      {/* 중앙 대한민국 우편번호 / 주소록 통합 검색창 */}
      <div style={{ position: 'relative', width: 440 }}>
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 14px',
            gap: 10,
          }}
        >
          <Search size={18} color="#38bdf8" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="우편번호(5자리) 또는 도로명/국사명 검색 (예: 06234, 판교, 강남)"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: 13,
              width: '100%',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* 검색 결과 드롭다운 */}
        {isDropdownOpen && filteredPostalItems.length > 0 && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 6,
              maxHeight: 340,
              overflowY: 'auto',
              padding: '6px',
            }}
          >
            {filteredPostalItems.map(item => (
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
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <MapPin size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
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
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {item.fullAddress}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 우측 컨트롤 도구들 */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
        }}
      >
        {/* 무료 지도 선택 셀렉터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapIcon size={16} color="#38bdf8" />
          <select
            value={currentMapStyle}
            onChange={e => onChangeMapStyle(e.target.value as MapStyleType)}
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
                🗺️ {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* 라벨 규칙 설정 드롭다운 버튼 */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsLabelMenuOpen(!isLabelMenuOpen)}
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
            라벨 표시 규칙
          </button>

          {/* 라벨 설정 팝오버 창 */}
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

              {/* 항목별 체크박스 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12 }}>
                {[
                  { key: 'showName' as const, label: '장비 이름 (기본)' },
                  { key: 'showRegion' as const, label: '소속 국사 및 지역명 (서머리 기본)' },
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
                        onChange={() =>
                          onChangeLabelConfig({
                            ...labelConfig,
                            [item.key]: !checked,
                          })
                        }
                        style={{ accentColor: '#06b6d4', cursor: 'pointer' }}
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>

              {/* 동일 위치 국사 밀집 장비 표시 규칙 */}
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
                      onChange={() => onChangeLabelConfig({ ...labelConfig, coLocationMode: 'SMART_STATION_GROUP' })}
                      style={{ accentColor: '#06b6d4', marginTop: 2 }}
                    />
                    <div>
                      <strong style={{ color: '#38bdf8' }}>스마트 국사 그룹화 (권장)</strong>
                      <div style={{ fontSize: 10, color: '#64748b' }}>국사 통합 배지 + 컴팩트 장비 라벨로 텍스트 겹침 방지</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer', color: labelConfig.coLocationMode === 'INDIVIDUAL_ALL' ? '#f1f5f9' : '#94a3b8' }}>
                    <input
                      type="radio"
                      name="coLocation"
                      checked={labelConfig.coLocationMode === 'INDIVIDUAL_ALL'}
                      onChange={() => onChangeLabelConfig({ ...labelConfig, coLocationMode: 'INDIVIDUAL_ALL' })}
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
          onClick={onToggle3DMode}
          title="3D 입체 뷰 / 2D 평면 뷰 전환"
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
          {is3DMode ? '3D 틸트 모드' : '2D 평면 모드'}
        </button>

        {/* 전도 보기 (카메라 리셋) */}
        <button
          onClick={onResetView}
          title="대한민국 전도 보기로 리셋"
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
          전도 보기
        </button>

        <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* 장애 시뮬레이터 토글 */}
        {!hasActiveSimulation ? (
          <button
            onClick={onTriggerSimulatedAlarm}
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
            }}
          >
            <ShieldAlert size={15} />
            장애 발생 시뮬레이션
          </button>
        ) : (
          <button
            onClick={onClearSimulatedAlarms}
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
            }}
          >
            <CheckCircle2 size={15} />
            장애 정상화 복구
          </button>
        )}
      </div>
    </header>
  );
};
