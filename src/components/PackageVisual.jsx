import React from 'react';

export function PackageVisual({ bag, compact = false, className = '' }) {
  const style = {
    '--package-main': bag.color || '#111827',
    '--package-accent': bag.borderColor || '#fbbf24',
    '--package-secondary': bag.secondaryColor || bag.borderColor || '#38bdf8'
  };

  return (
    <div
      className={`package-visual package-${bag.form || 'pouch'} ${compact ? 'package-compact' : ''} ${className}`}
      style={style}
      aria-label={bag.name}
    >
      <div className="package-handle" />
      <div className="package-lid" />
      <div className="package-pattern" />
      <div className="package-ridge package-ridge-top" />
      <div className="package-ridge package-ridge-bottom" />
      <span className="package-origin">{bag.origin || 'MYSTERY LAB'}</span>
      <span className="package-symbol">{bag.icon || '◆'}</span>
      <strong>{bag.shortName || bag.name}</strong>
      <small>MYSTERY COLLECTION</small>
      <div className="package-seal"><i /><span>{bag.sealLabel || 'TEAR HERE'}</span><i /></div>
      <div className="package-shine" />
    </div>
  );
}
