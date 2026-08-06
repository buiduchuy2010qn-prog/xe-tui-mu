import React, { useState } from 'react';
import './TutorialOverlay.css';

const STEPS = [
  {
    overline: 'BẮT ĐẦU',
    title: 'Tự tay xé từng chiếc túi mù',
    desc: 'Chọn túi, giữ mép sáng và kéo sang phải. Túi sẽ rách, bung thành hai mảnh rồi mới hé lộ vật phẩm bên trong.',
    icon: '✦'
  },
  {
    overline: 'SĂN VẬT PHẨM',
    title: 'Mỗi túi có một tỷ lệ riêng',
    desc: 'Túi giá cao có cơ hội ra vật phẩm hiếm hơn. Bộ đếm bảo hiểm giúp bạn không phải xui mãi.',
    icon: '◆'
  },
  {
    overline: 'BỘ SƯU TẬP',
    title: 'Giữ đồ đẹp, tái chế đồ trùng',
    desc: 'Kho đồ lưu mọi vật phẩm đã mở. Các bản trùng có thể đổi thành Mảnh Vô Tri để tiếp tục săn túi.',
    icon: '▣'
  },
  {
    overline: 'TIẾN TRÌNH',
    title: 'Lên cấp, làm nhiệm vụ và mở khóa',
    desc: 'Mỗi lần xé đều nhận EXP. Hoàn thành nhiệm vụ, thành tích và bộ sưu tập để nhận thêm xu.',
    icon: '▲'
  }
];

export const TutorialOverlay = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Hướng dẫn tân thủ">
      <div className="tutorial-card">
        <div className="tutorial-visual">
          <span>{step.icon}</span>
          <div className="tutorial-orbit tutorial-orbit-one" />
          <div className="tutorial-orbit tutorial-orbit-two" />
        </div>

        <div className="tutorial-copy">
          <span className="tutorial-overline">{step.overline} · {currentStep + 1}/{STEPS.length}</span>
          <h2>{step.title}</h2>
          <p>{step.desc}</p>
        </div>

        <div className="tutorial-dots" aria-hidden="true">
          {STEPS.map((_, index) => (
            <span key={index} className={index === currentStep ? 'active' : ''} />
          ))}
        </div>

        <div className="tutorial-actions">
          <button type="button" className="tutorial-skip" onClick={onComplete}>Bỏ qua</button>
          <button
            type="button"
            className="tutorial-next"
            onClick={() => {
              if (isLast) onComplete();
              else setCurrentStep((value) => value + 1);
            }}
          >
            {isLast ? 'Bắt đầu chơi' : 'Tiếp theo'}
          </button>
        </div>
      </div>
    </div>
  );
};
