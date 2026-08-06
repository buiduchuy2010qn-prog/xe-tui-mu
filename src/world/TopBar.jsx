import React from 'react';
import { Icon } from './Icon';
import { formatNumber } from './gameLogic';

export function TopBar({ state, onPanel, onToggleSound }) {
  const unlocked = Object.values(state.items).filter((item) => item.unlocked).length;
  const total = Object.keys(state.items).length;

  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => onPanel(null)}>
        <span className="brand-mark"><Icon name="bag" /></span>
        <span><strong>Xé Túi Mù</strong><small>WORLD PACK LAB</small></span>
      </button>

      <div className="topbar-stats">
        <button type="button" className="stat-chip coin-chip" onClick={() => onPanel('earn')}>
          <Icon name="coin" size={18} /><span>{formatNumber(state.coins)}</span><small>xu</small>
        </button>
        <div className="stat-chip"><span className="level-dot">{state.level}</span><span>Lv.{state.level}</span></div>
        <div className="stat-chip desktop-only"><Icon name="grid" size={18} /><span>{unlocked}/{total}</span></div>
      </div>

      <nav className="topbar-actions" aria-label="Điều hướng">
        <button className="earn-nav" type="button" onClick={() => onPanel('earn')} aria-label="Kiếm xu"><Icon name="bolt" /><span>Kiếm xu</span></button>
        <button type="button" onClick={() => onPanel('inventory')} aria-label="Kho đồ"><Icon name="grid" /></button>
        <button type="button" onClick={() => onPanel('missions')} aria-label="Nhiệm vụ"><Icon name="task" /></button>
        <button type="button" onClick={onToggleSound} aria-label="Bật hoặc tắt âm thanh"><Icon name={state.settings.sound ? 'sound' : 'mute'} /></button>
        <button type="button" onClick={() => onPanel('settings')} aria-label="Cài đặt"><Icon name="settings" /></button>
      </nav>
    </header>
  );
}
