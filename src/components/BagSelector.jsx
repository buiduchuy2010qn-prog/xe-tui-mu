import React from 'react';
import { BAGS } from '../data/bags';

export const BagSelector = ({
  selectedBagId,
  onSelectBag,
  onRipBag,
  isOpening,
  coins,
  playerLevel,
  pityMap
}) => {
  return (
    <section className="bag-browser">
      <div className="bag-browser-heading">
        <div>
          <h2>Chọn chiếc túi định mệnh</h2>
          <p>Mỗi loại túi có giá, bảo hiểm và tỷ lệ riêng. Chạm vào túi rồi tự tay kéo rách mép bao bì để hé lộ vật phẩm.</p>
        </div>
      </div>

      <div className="bag-grid">
        {BAGS.map((bag) => {
          const isSelected = selectedBagId === bag.id;
          const isUnlocked = playerLevel >= bag.minLevel;
          const bagPity = pityMap[bag.id] || { rare: 0, epic: 0 };
          const accent = bag.borderColor || '#f59e0b';

          return (
            <article
              key={bag.id}
              className={`bag-card ${isSelected ? 'bag-card-selected' : ''} ${!isUnlocked ? 'bag-card-locked' : ''}`}
              style={{
                '--bag-accent': accent,
                '--bag-glow': `${accent}26`
              }}
              onClick={() => {
                if (!isOpening && isUnlocked) onSelectBag(bag.id);
              }}
            >
              <div className="bag-card-topline">
                <span className="bag-badge">{bag.badge}</span>
                {!isUnlocked ? (
                  <span className="bag-level-label">Cần Lv.{bag.minLevel}</span>
                ) : isSelected ? (
                  <span className="bag-selected-label">ĐANG CHỌN</span>
                ) : null}
              </div>

              <div className="bag-artwork">
                {!isUnlocked ? (
                  <span aria-label="Chưa mở khóa">🔒</span>
                ) : bag.img ? (
                  <img src={bag.img} alt={bag.name} loading="lazy" />
                ) : (
                  <span aria-hidden="true">{bag.icon}</span>
                )}
              </div>

              <div className="bag-card-copy">
                <h3>{bag.name}</h3>
                <p>{bag.desc}</p>
                <span className="bag-rate-line">{bag.ratesDesc}</span>
              </div>

              {isUnlocked && (
                <div className="bag-card-pity">
                  <span>Hiếm {bagPity.rare}/{bag.pityRareMax}</span>
                  <span>Sử thi {bagPity.epic}/{bag.pityEpicMax}</span>
                </div>
              )}

              {isUnlocked && (
                <div className="bag-card-actions">
                  <button
                    type="button"
                    className="bag-rip-primary"
                    disabled={isOpening || coins < bag.cost}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectBag(bag.id);
                      onRipBag(bag, 1);
                    }}
                  >
                    Xé 1 túi · {bag.cost} xu
                  </button>

                  <div className="bag-card-actions-row">
                    <button
                      type="button"
                      className="bag-rip-secondary"
                      disabled={isOpening || coins < bag.cost * 5}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectBag(bag.id);
                        onRipBag(bag, 5);
                      }}
                    >
                      Xé 5×
                    </button>
                    <button
                      type="button"
                      className="bag-rip-secondary"
                      disabled={isOpening || coins < bag.cost * 10}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectBag(bag.id);
                        onRipBag(bag, 10);
                      }}
                    >
                      Xé 10×
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
