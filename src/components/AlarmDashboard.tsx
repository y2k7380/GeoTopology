import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Network,
  Activity,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Radio,
  Clock,
  ArrowUpRight,
  BarChart3,
  Search,
  X,
  Server,
  RotateCcw,
} from 'lucide-react';
import type { NetworkNode, NetworkEdge, AlarmSeverity, DeviceCategory, RegionSummaryNode } from '../types/topology';
import { soundFx } from '../utils/audio';

export interface AlarmDashboardProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  filterSeverity: AlarmSeverity | 'ALL';
  onSelectFilter: (severity: AlarmSeverity | 'ALL') => void;
  onFocusNode?: (node: NetworkNode) => void;
  selectedCategory?: DeviceCategory;
  onSelectCategory?: (category: DeviceCategory) => void;
  selectedNode?: NetworkNode | RegionSummaryNode | null;
  externalActiveTab?: 'STATS' | 'EVENTS' | 'REGIONS' | 'DEVICES';
  onTabChange?: (tab: 'STATS' | 'EVENTS' | 'REGIONS' | 'DEVICES') => void;
}

export const AlarmDashboard: React.FC<AlarmDashboardProps> = ({
  nodes,
  edges,
  filterSeverity,
  onSelectFilter,
  onFocusNode,
  selectedCategory = 'ALL',
  onSelectCategory,
  selectedNode,
  externalActiveTab,
  onTabChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [internalActiveTab, setInternalActiveTab] = useState<'STATS' | 'EVENTS' | 'REGIONS' | 'DEVICES'>('DEVICES');
  const [internalCategory, setInternalCategory] = useState<DeviceCategory>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [deviceSortBy, setDeviceSortBy] = useState<'STATUS' | 'NAME' | 'TRAFFIC' | 'CPU'>('STATUS');
  const [deviceSeverityFilter, setDeviceSeverityFilter] = useState<AlarmSeverity | 'ALL'>('ALL');

  const activeTab = externalActiveTab || internalActiveTab;
  const handleTabClick = (tab: 'STATS' | 'EVENTS' | 'REGIONS' | 'DEVICES') => {
    soundFx.playClick();
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  const currentCategory = onSelectCategory ? selectedCategory : internalCategory;
  const handleCategoryChange = (cat: DeviceCategory) => {
    soundFx.playClick();
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  // 장비 카테고리 필터링 적용된 노드 목록
  const filteredNodesByCategory = useMemo(() => {
    if (currentCategory === 'ALL') return nodes;
    return nodes.filter(n => n.category === currentCategory);
  }, [nodes, currentCategory]);

  const criticalNodes = filteredNodesByCategory.filter(n => n.status === 'CRITICAL');
  const majorNodes = filteredNodesByCategory.filter(n => n.status === 'MAJOR');
  const minorNodes = filteredNodesByCategory.filter(n => n.status === 'MINOR');
  const normalNodes = filteredNodesByCategory.filter(n => n.status === 'NORMAL');

  // 회선 분류
  const dwdmEdges = edges.filter(e => e.linkType === 'DWDM_OPTICAL_LAMBDA');
  const switchEdges = edges.filter(e => e.linkType === 'METRO_RING_40G' || e.linkType === 'DIST_10G');
  const downEdges = edges.filter(e => e.status === 'DOWN');
  const warningEdges = edges.filter(e => e.status === 'WARNING');
  const normalEdges = edges.filter(e => e.status === 'UP');

  // 총 트래픽 및 대역폭 계산
  const totalTrafficGbps = useMemo(() => {
    const sum = filteredNodesByCategory.reduce((acc, n) => acc + (n.metrics?.trafficGbps || 0), 0);
    return Math.round(sum * 10) / 10;
  }, [filteredNodesByCategory]);

  // 실시간 활성 이벤트 타임라인 리스트
  const activeEvents = useMemo(() => {
    const events: {
      node: NetworkNode;
      alarmId: string;
      severity: AlarmSeverity;
      code: string;
      title: string;
      time: string;
      stationName: string;
      postalCode: string;
      category: DeviceCategory;
    }[] = [];

    filteredNodesByCategory.forEach(node => {
      node.alarms.forEach(alm => {
        events.push({
          node,
          alarmId: alm.id,
          severity: alm.severity,
          code: alm.code,
          title: alm.title,
          time: alm.timestamp,
          stationName: node.stationName,
          postalCode: node.postalCode,
          category: node.category,
        });
      });
    });

    const severityWeight: Record<AlarmSeverity, number> = {
      CRITICAL: 4,
      MAJOR: 3,
      MINOR: 2,
      NORMAL: 1,
    };
    return events.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
  }, [filteredNodesByCategory]);

  // 실시간 검색어 및 세부 필터가 적용된 전국 장비 인벤토리 목록
  const filteredAndSortedDevices = useMemo(() => {
    let result = filteredNodesByCategory;

    // 1. 심각도 필터 적용
    if (deviceSeverityFilter !== 'ALL') {
      result = result.filter(n => n.status === deviceSeverityFilter);
    }

    // 2. 검색어 필터링 (장비명, 국사명, 우편번호, IP, 모델, 제조사, 역할 등 종합 검색)
    if (searchKeyword.trim()) {
      const q = searchKeyword.trim().toLowerCase();
      result = result.filter(n => {
        return (
          n.name.toLowerCase().includes(q) ||
          n.stationName.toLowerCase().includes(q) ||
          n.postalCode.includes(q) ||
          n.ipAddress.includes(q) ||
          n.model.toLowerCase().includes(q) ||
          n.vendor.toLowerCase().includes(q) ||
          n.province.toLowerCase().includes(q) ||
          n.cityDistrict.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q) ||
          n.rackLocation.toLowerCase().includes(q)
        );
      });
    }

    // 3. 정렬 (상태순, 이름순, 트래픽순, CPU순)
    const severityWeight: Record<AlarmSeverity, number> = {
      CRITICAL: 4,
      MAJOR: 3,
      MINOR: 2,
      NORMAL: 1,
    };

    return [...result].sort((a, b) => {
      if (deviceSortBy === 'STATUS') {
        const diff = severityWeight[b.status] - severityWeight[a.status];
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name, 'ko');
      }
      if (deviceSortBy === 'NAME') {
        return a.name.localeCompare(b.name, 'ko');
      }
      if (deviceSortBy === 'TRAFFIC') {
        return (b.metrics?.trafficGbps || 0) - (a.metrics?.trafficGbps || 0);
      }
      if (deviceSortBy === 'CPU') {
        return (b.metrics?.cpuPercent || 0) - (a.metrics?.cpuPercent || 0);
      }
      return 0;
    });
  }, [filteredNodesByCategory, deviceSeverityFilter, searchKeyword, deviceSortBy]);

  // 권역별 정상/장애 통계
  const regionStats = useMemo(() => {
    const groups: Record<string, { total: number; alarmed: number }> = {
      '수도권 (서울/경기/인천)': { total: 0, alarmed: 0 },
      '영남권 (부산/대구/울산/경남/경북)': { total: 0, alarmed: 0 },
      '충청/대전/세종': { total: 0, alarmed: 0 },
      '호남권 (광주/전남/전북)': { total: 0, alarmed: 0 },
      '강원/제주': { total: 0, alarmed: 0 },
    };

    filteredNodesByCategory.forEach(n => {
      let regionKey = '수도권 (서울/경기/인천)';
      if (['부산광역시', '대구광역시', '울산광역시', '경상남도', '경상북도'].includes(n.province)) {
        regionKey = '영남권 (부산/대구/울산/경남/경북)';
      } else if (['대전광역시', '세종특별자치시', '충청남도', '충청북도'].includes(n.province)) {
        regionKey = '충청/대전/세종';
      } else if (['광주광역시', '전라남도', '전라북도'].includes(n.province)) {
        regionKey = '호남권 (광주/전남/전북)';
      } else if (['강원특별자치도', '제주특별자치도'].includes(n.province)) {
        regionKey = '강원/제주';
      }

      if (groups[regionKey]) {
        groups[regionKey].total += 1;
        if (n.status !== 'NORMAL') {
          groups[regionKey].alarmed += 1;
        }
      }
    });

    return Object.entries(groups).map(([name, data]) => ({
      name,
      total: data.total,
      alarmed: data.alarmed,
      percent: data.total > 0 ? Math.round(((data.total - data.alarmed) / data.total) * 100) : 100,
    }));
  }, [filteredNodesByCategory]);

  const filterCards = [
    {
      id: 'ALL' as const,
      label: '전체 장비',
      count: filteredNodesByCategory.length,
      icon: Network,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.15)',
    },
    {
      id: 'CRITICAL' as const,
      label: 'CRITICAL',
      count: criticalNodes.length,
      icon: AlertOctagon,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      pulse: criticalNodes.length > 0,
    },
    {
      id: 'MAJOR' as const,
      label: 'MAJOR',
      count: majorNodes.length,
      icon: AlertTriangle,
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.15)',
    },
    {
      id: 'MINOR' as const,
      label: 'MINOR',
      count: minorNodes.length,
      icon: AlertCircle,
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.15)',
    },
    {
      id: 'NORMAL' as const,
      label: '정상 가동',
      count: normalNodes.length,
      icon: CheckCircle,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
    },
  ];

  if (isCollapsed) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 84,
          left: 14,
          zIndex: 40,
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={() => {
            soundFx.playClick();
            setIsCollapsed(false);
          }}
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            color: '#38bdf8',
            cursor: 'pointer',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <Activity size={16} />
          <span style={{ fontSize: 12, fontWeight: 700 }}>관제 현황 펼치기</span>
          {criticalNodes.length > 0 && (
            <span
              className="pulse-critical"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                display: 'inline-block',
              }}
            />
          )}
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 84,
        left: 14,
        bottom: 24,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        width: activeTab === 'DEVICES' ? 380 : 310,
        transition: 'width 0.2s ease',
        pointerEvents: 'auto',
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
      }}
    >
      {/* 패널 헤더 */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={16} color="#38bdf8" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
            NOC 통합 관제 센터
          </span>
        </div>
        <button
          onClick={() => {
            soundFx.playClick();
            setIsCollapsed(true);
          }}
          title="대시보드 접기"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* 장비군 (전송/스위치/라우터) 퀵 필터 칩 */}
      <div
        style={{
          padding: '6px 10px',
          background: 'rgba(10, 16, 29, 0.5)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {[
          { id: 'ALL' as const, label: '전체' },
          { id: 'TRANSMISSION' as const, label: '전송망', color: '#c084fc' },
          { id: 'SWITCH' as const, label: '스위치', color: '#34d399' },
          { id: 'ROUTER' as const, label: '라우터', color: '#38bdf8' },
        ].map(cat => {
          const isSel = currentCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              style={{
                padding: '4px 2px',
                borderRadius: 4,
                border: isSel ? `1px solid ${cat.color || '#38bdf8'}` : '1px solid rgba(255, 255, 255, 0.08)',
                background: isSel ? `${cat.color || '#38bdf8'}25` : 'rgba(255, 255, 255, 0.03)',
                color: isSel ? (cat.color || '#38bdf8') : '#94a3b8',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 탭 네비게이션 (장비 목록 & 검색, 현황 통계, 실시간 이벤트, 권역) */}
      <div
        style={{
          display: 'flex',
          padding: '6px 10px',
          gap: 4,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(10, 16, 29, 0.3)',
        }}
      >
        <button
          className={`noc-tab-btn ${activeTab === 'DEVICES' ? 'active' : ''}`}
          onClick={() => handleTabClick('DEVICES')}
          style={{ flex: 1.15, justifyContent: 'center' }}
        >
          <Server size={13} />
          <span>장비 목록</span>
        </button>
        <button
          className={`noc-tab-btn ${activeTab === 'STATS' ? 'active' : ''}`}
          onClick={() => handleTabClick('STATS')}
          style={{ flex: 0.95, justifyContent: 'center' }}
        >
          <ListFilter size={13} />
          <span>통계</span>
        </button>
        <button
          className={`noc-tab-btn ${activeTab === 'EVENTS' ? 'active' : ''}`}
          onClick={() => handleTabClick('EVENTS')}
          style={{ flex: 1, justifyContent: 'center', position: 'relative' }}
        >
          <Clock size={13} />
          <span>이벤트 ({activeEvents.length})</span>
          {criticalNodes.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ef4444',
              }}
            />
          )}
        </button>
        <button
          className={`noc-tab-btn ${activeTab === 'REGIONS' ? 'active' : ''}`}
          onClick={() => handleTabClick('REGIONS')}
          style={{ flex: 0.9, justifyContent: 'center' }}
        >
          <BarChart3 size={13} />
          <span>권역</span>
        </button>
      </div>

      {/* 탭 컨텐츠 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {/* 0. 장비 인벤토리 목록 & 실시간 검색 탭 */}
        {activeTab === 'DEVICES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* 1. 실시간 통합 검색 입력창 */}
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                color="#38bdf8"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="장비명, 국사명, IP, 모델, 우편번호 검색..."
                style={{
                  width: '100%',
                  padding: '8px 30px 8px 32px',
                  borderRadius: 6,
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#f8fafc',
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  title="검색어 초기화"
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* 2. 상태(Severity) 퀵 필터 칩 & 정렬 드롭다운 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(['ALL', 'CRITICAL', 'MAJOR', 'MINOR', 'NORMAL'] as const).map(sev => {
                  const isSel = deviceSeverityFilter === sev;
                  const label = sev === 'ALL' ? '전체' : sev === 'CRITICAL' ? 'CRIT' : sev === 'MAJOR' ? 'WARN' : sev === 'MINOR' ? 'INFO' : '정상';
                  const color = sev === 'CRITICAL' ? '#ef4444' : sev === 'MAJOR' ? '#f97316' : sev === 'MINOR' ? '#eab308' : sev === 'NORMAL' ? '#10b981' : '#38bdf8';
                  return (
                    <button
                      key={sev}
                      onClick={() => {
                        soundFx.playClick();
                        setDeviceSeverityFilter(sev);
                      }}
                      style={{
                        padding: '3px 7px',
                        borderRadius: 4,
                        border: isSel ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                        background: isSel ? `${color}25` : 'rgba(255,255,255,0.03)',
                        color: isSel ? color : '#94a3b8',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* 정렬 셀렉터 */}
              <select
                value={deviceSortBy}
                onChange={e => setDeviceSortBy(e.target.value as any)}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#cbd5e1',
                  borderRadius: 4,
                  padding: '2px 4px',
                  fontSize: 10,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="STATUS">상태순</option>
                <option value="NAME">이름순</option>
                <option value="TRAFFIC">트래픽순</option>
                <option value="CPU">CPU부하순</option>
              </select>
            </div>

            {/* 3. 검색 결과 건수 표시줄 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', padding: '2px 2px' }}>
              <span>
                검색 일치: <strong style={{ color: '#38bdf8' }}>{filteredAndSortedDevices.length}</strong>대
                <span style={{ color: '#64748b' }}> / 전체 {filteredNodesByCategory.length}대</span>
              </span>
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f97316',
                    fontSize: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: 0,
                  }}
                >
                  <RotateCcw size={10} />
                  <span>초기화</span>
                </button>
              )}
            </div>

            {/* 4. 장비 리스트 아이템들 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 'calc(100vh - 310px)', overflowY: 'auto' }}>
              {filteredAndSortedDevices.length === 0 ? (
                <div style={{ padding: '36px 12px', textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                  <Search size={24} style={{ margin: '0 auto 8px', color: '#475569' }} />
                  <div>검색어와 일치하는 장비가 없습니다.</div>
                  <div style={{ fontSize: 11, marginTop: 4, color: '#64748b' }}>다른 키워드로 검색해보세요.</div>
                </div>
              ) : (
                filteredAndSortedDevices.map(node => {
                  const isSelected = selectedNode && ('id' in selectedNode) && selectedNode.id === node.id;
                  const sevColor = node.status === 'CRITICAL' ? '#ef4444' : node.status === 'MAJOR' ? '#f97316' : node.status === 'MINOR' ? '#eab308' : '#10b981';
                  const catColor = node.category === 'TRANSMISSION' ? '#c084fc' : node.category === 'SWITCH' ? '#34d399' : '#38bdf8';
                  const catLabel = node.category === 'TRANSMISSION' ? '전송' : node.category === 'SWITCH' ? '스위치' : node.category === 'ROUTER' ? '라우터' : '산악';

                  return (
                    <div
                      key={node.id}
                      onClick={() => {
                        soundFx.playFocus();
                        if (onFocusNode) onFocusNode(node);
                      }}
                      className="glass-card"
                      style={{
                        padding: '8px 10px',
                        cursor: 'pointer',
                        borderLeft: `3px solid ${sevColor}`,
                        border: isSelected ? '1px solid #38bdf8' : undefined,
                        background: isSelected ? 'rgba(56, 189, 248, 0.12)' : undefined,
                        boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.3)' : undefined,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* 상단: 상태, 역할 배지, 장비명 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: sevColor,
                              padding: '1px 5px',
                              borderRadius: 3,
                              background: `${sevColor}20`,
                            }}
                          >
                            {node.status}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              color: catColor,
                              padding: '1px 4px',
                              borderRadius: 2,
                              background: `${catColor}20`,
                            }}
                          >
                            {catLabel}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>
                            {node.name}
                          </span>
                        </div>
                        <ArrowUpRight size={13} color={isSelected ? '#38bdf8' : '#64748b'} />
                      </div>

                      {/* 중단: 국사 위치, 모델/벤더, IP */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
                        <span>
                          [{node.postalCode}] {node.stationName}
                        </span>
                        <span className="font-mono" style={{ color: '#38bdf8' }}>
                          {node.ipAddress}
                        </span>
                      </div>

                      <div style={{ fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{node.model} ({node.vendor})</span>
                        <span>{node.rackLocation}</span>
                      </div>

                      {/* 하단 메트릭스 칩 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, marginTop: 2, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 4 }}>
                        <span style={{ color: '#10b981' }}>{node.metrics.trafficGbps}G</span>
                        <span style={{ color: '#64748b' }}>•</span>
                        <span style={{ color: node.metrics.cpuPercent > 80 ? '#ef4444' : '#38bdf8' }}>CPU {node.metrics.cpuPercent}%</span>
                        <span style={{ color: '#64748b' }}>•</span>
                        <span style={{ color: '#94a3b8' }}>{node.metrics.tempCelsius}°C</span>

                        {node.transmissionDetails && (
                          <>
                            <span style={{ color: '#64748b' }}>•</span>
                            <span style={{ color: '#c084fc' }}>λ {node.transmissionDetails.wavelengthNm}nm</span>
                          </>
                        )}
                        {node.switchDetails && (
                          <>
                            <span style={{ color: '#64748b' }}>•</span>
                            <span style={{ color: '#34d399' }}>
                              {node.switchDetails.switchingCapacityGbps >= 1000 ? `${(node.switchDetails.switchingCapacityGbps / 1000).toFixed(1)}T` : `${node.switchDetails.switchingCapacityGbps}G`}
                            </span>
                          </>
                        )}
                      </div>

                      {/* 활성 경보가 있을 때 경보 타이틀 표시 */}
                      {node.alarms.length > 0 && (
                        <div
                          style={{
                            fontSize: 10,
                            color: '#f87171',
                            background: 'rgba(239, 68, 68, 0.12)',
                            padding: '2px 6px',
                            borderRadius: 3,
                            marginTop: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <AlertCircle size={11} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {node.alarms[0].title}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 1. 현황 종합 통계 탭 */}
        {activeTab === 'STATS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* 심각도별 필터 버튼 카드들 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filterCards.map(card => {
                const isSelected = filterSeverity === card.id;
                const Icon = card.icon;

                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      soundFx.playClick();
                      onSelectFilter(card.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: isSelected ? card.bg : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? `1px solid ${card.color}` : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 0 12px ${card.bg}` : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={16} color={card.color} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>
                        {card.label}
                      </span>
                    </div>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: card.count > 0 ? card.color : '#64748b',
                        padding: '1px 7px',
                        borderRadius: 4,
                        background: card.count > 0 && card.id !== 'NORMAL' ? card.bg : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      {card.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 백본 및 전송망 회선 상태 서머리 카드 */}
            <div
              className="glass-card"
              style={{
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Radio size={13} />
                  <span>네트워크 회선망 ({edges.length}구간)</span>
                </div>
                <span className="font-mono" style={{ fontSize: 11, color: '#94a3b8' }}>
                  {totalTrafficGbps} Gbps
                </span>
              </div>

              {/* 전송망 / 스위치망 세부 회선 카운트 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1', padding: '2px 4px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
                <span style={{ color: '#c084fc' }}>● DWDM 광전송 ({dwdmEdges.length}구간)</span>
                <span style={{ color: '#34d399' }}>● 스위치 링 ({switchEdges.length}구간)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, textAlign: 'center' }}>
                <div style={{ padding: '6px', borderRadius: 4, background: downEdges.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>단선(DOWN)</div>
                  <div className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: downEdges.length > 0 ? '#ef4444' : '#64748b' }}>
                    {downEdges.length}
                  </div>
                </div>
                <div style={{ padding: '6px', borderRadius: 4, background: warningEdges.length > 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.03)' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>혼잡(CONG)</div>
                  <div className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: warningEdges.length > 0 ? '#f97316' : '#64748b' }}>
                    {warningEdges.length}
                  </div>
                </div>
                <div style={{ padding: '6px', borderRadius: 4, background: 'rgba(255, 255, 255, 0.03)' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>정상(UP)</div>
                  <div className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                    {normalEdges.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 실시간 이벤트 피드 탭 */}
        {activeTab === 'EVENTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeEvents.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                현재 선택된 조건에 발생한 경보가 없습니다.<br />(모든 장비 정상 운영 중)
              </div>
            ) : (
              activeEvents.map(evt => {
                const color = evt.severity === 'CRITICAL' ? '#ef4444' : evt.severity === 'MAJOR' ? '#f97316' : '#eab308';
                const catLabel = evt.category === 'TRANSMISSION' ? '전송망' : evt.category === 'SWITCH' ? '스위치' : '라우터';
                const catColor = evt.category === 'TRANSMISSION' ? '#c084fc' : evt.category === 'SWITCH' ? '#34d399' : '#38bdf8';

                return (
                  <div
                    key={evt.alarmId}
                    onClick={() => {
                      soundFx.playFocus();
                      if (onFocusNode) onFocusNode(evt.node);
                    }}
                    className="glass-card"
                    style={{
                      padding: '8px 10px',
                      cursor: 'pointer',
                      borderLeft: `3px solid ${color}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color,
                            padding: '1px 5px',
                            borderRadius: 3,
                            background: `${color}20`,
                          }}
                        >
                          {evt.severity}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            color: catColor,
                            padding: '1px 4px',
                            borderRadius: 2,
                            background: `${catColor}20`,
                          }}
                        >
                          {catLabel}
                        </span>
                      </div>
                      <span className="font-mono" style={{ fontSize: 10, color: '#64748b' }}>
                        {evt.time.slice(11)}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {evt.title}
                      </span>
                      <ArrowUpRight size={12} color="#64748b" />
                    </div>

                    <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>[{evt.postalCode}]</span>
                      <span>{evt.stationName}</span>
                      <span>•</span>
                      <span>{evt.node.name}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 3. 권역별 통계 탭 */}
        {activeTab === 'REGIONS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {regionStats.map(r => (
              <div
                key={r.name}
                className="glass-card"
                style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#f1f5f9' }}>{r.name}</span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: r.alarmed > 0 ? '#f97316' : '#10b981',
                    }}
                  >
                    {r.percent}%
                  </span>
                </div>

                <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${r.percent}%`,
                      height: '100%',
                      background: r.alarmed > 0 ? '#f97316' : '#10b981',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
                  <span>장비 {r.total}대</span>
                  <span>{r.alarmed > 0 ? `장애 ${r.alarmed}건` : '전부 정상'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 시스템 상태 안내 바 */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 16, 29, 0.6)',
          fontSize: 10,
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>실시간 전송/스위치 연동 중</span>
        <span style={{ color: '#10b981' }}>● 정상 연동</span>
      </div>
    </div>
  );
};
