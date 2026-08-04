import React, { useState } from 'react';

const STEPS = [
  {
    title: '👋 CHÀO MỪNG ĐẾN VỚI XÉ TÚI MÙ VÔ TRI!',
    desc: 'Trải nghiệm cảm giác hồi hộp, vui nhộn và vô tri khi tự tay xé mở từng túi mù bí ẩn!',
    icon: '🛍️'
  },
  {
    title: '🛍️ BƯỚC 1: CHỌN VÀ XÉ TÚI MÙ',
    desc: 'Có nhiều loại túi như Túi Rác (10xu), Túi Nilon (50xu), Túi Đại Gia (150xu) & Túi Sự Kiện Tết! Bạn có thể chọn xé 1x, 5x hoặc 10x cùng lúc!',
    icon: '✂️'
  },
  {
    title: '🎒 BƯỚC 2: THU THẬP & BÁN ĐỒ TRÙNG',
    desc: 'Sưu tầm 30+ vật phẩm hài hước từ Lõi giấy vệ sinh đến Dép tổ ong tối thượng. Đồ trùng có thể phân giải thành Mảnh Vô Tri!',
    icon: '📦'
  },
  {
    title: '🏆 BƯỚC 3: NHIỆM VỤ, BỘ SƯ TẬP & SHOP',
    desc: 'Hoàn thành các Bộ sưu tập chủ đề để nhận danh hiệu sang chảnh, vào Cửa hàng mua khung Profile & hiệu ứng pháo giấy cực chất!',
    icon: '🌟'
  }
];

export const TutorialOverlay = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 2000, padding: '1rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        padding: '2.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem',
        maxWidth: '460px', width: '100%', borderRadius: '28px',
        border: '2px solid rgba(251,191,36,0.5)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        background: 'linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.95) 100%)'
      }}>
        
        <div style={{ fontSize: '70px', filter: 'drop-shadow(0 4px 10px rgba(251,191,36,0.4))' }}>
          {step.icon}
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Hướng dẫn tân thủ ({currentStep + 1}/{STEPS.length})
          </span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '6px 0 10px 0', color: '#fff' }}>
            {step.title}
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {step.desc}
          </p>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {STEPS.map((_, idx) => (
            <div 
              key={idx} 
              style={{
                width: idx === currentStep ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === currentStep ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease'
              }} 
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', width: '100%', marginTop: '0.5rem' }}>
          <button 
            className="btn-cute" 
            style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.9rem', flex: 1 }}
            onClick={onComplete}
          >
            Bỏ qua ⏩
          </button>

          <button 
            className="btn-cute" 
            style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#000', fontSize: '0.9rem', fontWeight: 800, flex: 1.5 }}
            onClick={() => {
              if (currentStep < STEPS.length - 1) {
                setCurrentStep(prev => prev + 1);
              } else {
                onComplete();
              }
            }}
          >
            {currentStep < STEPS.length - 1 ? 'Tiếp Theo ▶' : 'Bắt Đầu Chơi! 🎉'}
          </button>
        </div>

      </div>
    </div>
  );
};
