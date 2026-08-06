export const BAG_CATEGORIES = ['Tất cả', 'Túi mềm', 'Foil', 'Hộp & Capsule', 'Châu Á', 'Cao cấp'];

export const BAGS = [
  {
    id: 'starter_pouch', name: 'Túi Khởi Đầu', shortName: 'STARTER', origin: 'GLOBAL', category: 'Túi mềm', form: 'pouch',
    cost: 10, minLevel: 1, expGain: 10, material: 'thin-plastic', icon: '✦', sealLabel: 'KÉO NGANG',
    desc: 'Túi mù mềm cơ bản, dễ xé và phù hợp để bắt đầu bộ sưu tập.',
    rates: { Common: 0.82, Rare: 0.15, Epic: 0.03, Legendary: 0 }, pityRareMax: 10, pityEpicMax: 28,
    color: '#172033', secondaryColor: '#22d3ee', borderColor: '#67e8f9', badge: 'Mỏng · Dễ xé'
  },
  {
    id: 'black_mystery', name: 'Túi Đen Bí Ẩn', shortName: 'BLACK BAG', origin: 'URBAN', category: 'Túi mềm', form: 'pouch',
    cost: 18, minLevel: 1, expGain: 14, material: 'plastic', icon: '◆', sealLabel: 'RIP HERE',
    desc: 'Túi nhựa đen nhàu, âm thanh kéo căng rõ và tỷ lệ Hiếm nhỉnh hơn.',
    rates: { Common: 0.72, Rare: 0.22, Epic: 0.055, Legendary: 0.005 }, pityRareMax: 9, pityEpicMax: 25,
    color: '#07090e', secondaryColor: '#64748b', borderColor: '#a8b3c2', badge: 'Nhựa đen'
  },
  {
    id: 'japan_foil', name: 'Gói Foil Tokyo', shortName: 'TOKYO FOIL', origin: 'JAPAN STYLE', category: 'Foil', form: 'foil',
    cost: 35, minLevel: 2, expGain: 25, material: 'foil', icon: '桜', sealLabel: 'OPEN',
    desc: 'Gói foil sắc nét với đường hàn răng cưa và tiếng rách giòn.',
    rates: { Common: 0.58, Rare: 0.3, Epic: 0.105, Legendary: 0.015 }, pityRareMax: 8, pityEpicMax: 21,
    color: '#241539', secondaryColor: '#fb7185', borderColor: '#f9a8d4', badge: 'Foil răng cưa'
  },
  {
    id: 'korea_pastel', name: 'Gói Pastel Seoul', shortName: 'SEOUL POP', origin: 'KOREA STYLE', category: 'Châu Á', form: 'foil',
    cost: 45, minLevel: 3, expGain: 34, material: 'foil', icon: '♡', sealLabel: 'PULL',
    desc: 'Thiết kế pastel bóng nhẹ, ưu tiên vật phẩm Hiếm và Sử thi.',
    rates: { Common: 0.48, Rare: 0.34, Epic: 0.155, Legendary: 0.025 }, pityRareMax: 7, pityEpicMax: 18,
    color: '#25345a', secondaryColor: '#c084fc', borderColor: '#f0abfc', badge: 'Pastel foil'
  },
  {
    id: 'vietnam_lixi', name: 'Bao Lì Xì Bí Mật', shortName: 'LÌ XÌ', origin: 'VIỆT NAM', category: 'Châu Á', form: 'envelope',
    cost: 55, minLevel: 3, expGain: 40, material: 'paper', icon: '福', sealLabel: 'XÉ MÉP',
    desc: 'Bao giấy đỏ nguyên bản lấy cảm hứng từ phong bao may mắn.',
    rates: { Common: 0.42, Rare: 0.36, Epic: 0.17, Legendary: 0.05 }, pityRareMax: 7, pityEpicMax: 17,
    color: '#8f1018', secondaryColor: '#fbbf24', borderColor: '#fde68a', badge: 'Giấy lì xì'
  },
  {
    id: 'china_lucky', name: 'Túi Phúc Á Đông', shortName: 'LUCKY FU', origin: 'EAST ASIA', category: 'Châu Á', form: 'envelope',
    cost: 65, minLevel: 4, expGain: 48, material: 'paper', icon: '福', sealLabel: 'LUCKY TEAR',
    desc: 'Phong bao dày với hoa văn đồng xu, thiên về vật phẩm Sử thi.',
    rates: { Common: 0.36, Rare: 0.36, Epic: 0.22, Legendary: 0.06 }, pityRareMax: 6, pityEpicMax: 15,
    color: '#71151b', secondaryColor: '#f59e0b', borderColor: '#fcd34d', badge: 'Bao may mắn'
  },
  {
    id: 'thai_charm', name: 'Túi Bùa Sắc Màu', shortName: 'CHARM BAG', origin: 'SOUTHEAST ASIA', category: 'Châu Á', form: 'drawstring',
    cost: 75, minLevel: 4, expGain: 56, material: 'plastic', icon: '✺', sealLabel: 'PULL CORD',
    desc: 'Túi dây rút rực rỡ, có cảm giác mở khác với gói niêm phong.',
    rates: { Common: 0.32, Rare: 0.37, Epic: 0.24, Legendary: 0.07 }, pityRareMax: 6, pityEpicMax: 14,
    color: '#4c1d95', secondaryColor: '#2dd4bf', borderColor: '#5eead4', badge: 'Dây rút'
  },
  {
    id: 'candy_twist', name: 'Gói Kẹo Xoắn', shortName: 'CANDY TWIST', origin: 'EURO POP', category: 'Túi mềm', form: 'twist',
    cost: 28, minLevel: 2, expGain: 22, material: 'thin-plastic', icon: '★', sealLabel: 'TWIST & TEAR',
    desc: 'Gói hai đầu xoắn vui mắt, tốc độ mở nhanh và nhiều vật phẩm Thường.',
    rates: { Common: 0.64, Rare: 0.27, Epic: 0.085, Legendary: 0.005 }, pityRareMax: 8, pityEpicMax: 23,
    color: '#9f1239', secondaryColor: '#38bdf8', borderColor: '#fda4af', badge: 'Hai đầu xoắn'
  },
  {
    id: 'kraft_mystery', name: 'Túi Giấy Kraft', shortName: 'KRAFT', origin: 'NORDIC STYLE', category: 'Túi mềm', form: 'paperbag',
    cost: 40, minLevel: 2, expGain: 30, material: 'paper', icon: '△', sealLabel: 'TEAR STRIP',
    desc: 'Túi giấy nhám tối giản, tiếng xé trầm và có dải kéo riêng.',
    rates: { Common: 0.52, Rare: 0.33, Epic: 0.135, Legendary: 0.015 }, pityRareMax: 8, pityEpicMax: 20,
    color: '#795735', secondaryColor: '#d6b786', borderColor: '#e7d3ad', badge: 'Giấy kraft'
  },
  {
    id: 'zip_secret', name: 'Túi Zip Trong Suốt', shortName: 'ZIP SECRET', origin: 'MODERN LAB', category: 'Túi mềm', form: 'zip',
    cost: 58, minLevel: 3, expGain: 42, material: 'plastic', icon: '◇', sealLabel: 'SLIDE & RIP',
    desc: 'Túi zip bán trong suốt, ánh sáng vật phẩm hắt ra trước khi mở.',
    rates: { Common: 0.44, Rare: 0.36, Epic: 0.17, Legendary: 0.03 }, pityRareMax: 7, pityEpicMax: 17,
    color: '#123048', secondaryColor: '#22d3ee', borderColor: '#7dd3fc', badge: 'Zip vinyl'
  },
  {
    id: 'holo_foil', name: 'Gói Hologram', shortName: 'HOLO PACK', origin: 'FUTURE', category: 'Foil', form: 'foil',
    cost: 95, minLevel: 5, expGain: 72, material: 'foil', icon: '✧', sealLabel: 'HOLO RIP',
    desc: 'Màng hologram phản quang với tỷ lệ Epic cao và hiệu ứng mở mạnh.',
    rates: { Common: 0.24, Rare: 0.38, Epic: 0.29, Legendary: 0.09 }, pityRareMax: 5, pityEpicMax: 12,
    color: '#312e81', secondaryColor: '#22d3ee', borderColor: '#e879f9', badge: 'Hologram foil'
  },
  {
    id: 'comic_pack', name: 'Gói Truyện Tranh', shortName: 'COMIC PACK', origin: 'AMERICAN STYLE', category: 'Foil', form: 'foil',
    cost: 70, minLevel: 4, expGain: 52, material: 'foil', icon: '!', sealLabel: 'RIP!',
    desc: 'Gói foil đồ họa comic nguyên bản với màu mạnh và tiếng rách giòn.',
    rates: { Common: 0.35, Rare: 0.39, Epic: 0.21, Legendary: 0.05 }, pityRareMax: 6, pityEpicMax: 15,
    color: '#172554', secondaryColor: '#f43f5e', borderColor: '#fde047', badge: 'Comic foil'
  },
  {
    id: 'space_vacuum', name: 'Gói Chân Không Vũ Trụ', shortName: 'SPACE VAC', origin: 'ORBIT LAB', category: 'Foil', form: 'vacuum',
    cost: 130, minLevel: 6, expGain: 96, material: 'foil', icon: '◉', sealLabel: 'DEPRESSURIZE',
    desc: 'Gói hút chân không căng cứng, bung mạnh khi đường niêm phong đứt.',
    rates: { Common: 0.16, Rare: 0.34, Epic: 0.36, Legendary: 0.14 }, pityRareMax: 5, pityEpicMax: 10,
    color: '#061329', secondaryColor: '#7c3aed', borderColor: '#60a5fa', badge: 'Chân không'
  },
  {
    id: 'capsule_classic', name: 'Capsule Trứng Mù', shortName: 'CAPSULE', origin: 'VENDING STYLE', category: 'Hộp & Capsule', form: 'capsule',
    cost: 42, minLevel: 2, expGain: 32, material: 'plastic', icon: '●', sealLabel: 'BREAK SEAL',
    desc: 'Capsule tròn lấy cảm hứng từ máy bán đồ chơi tự động.',
    rates: { Common: 0.5, Rare: 0.34, Epic: 0.14, Legendary: 0.02 }, pityRareMax: 8, pityEpicMax: 19,
    color: '#0f766e', secondaryColor: '#fbbf24', borderColor: '#5eead4', badge: 'Capsule nhựa'
  },
  {
    id: 'cube_box', name: 'Hộp Mù Lập Phương', shortName: 'MYSTERY CUBE', origin: 'DESIGN STUDIO', category: 'Hộp & Capsule', form: 'box',
    cost: 85, minLevel: 4, expGain: 64, material: 'paper', icon: '□', sealLabel: 'PULL TAB',
    desc: 'Hộp giấy lập phương với dải kéo quanh thân và nắp bật.',
    rates: { Common: 0.3, Rare: 0.39, Epic: 0.25, Legendary: 0.06 }, pityRareMax: 6, pityEpicMax: 14,
    color: '#1e293b', secondaryColor: '#f97316', borderColor: '#fdba74', badge: 'Hộp giấy'
  },
  {
    id: 'mystery_tube', name: 'Ống Mù Sưu Tập', shortName: 'MYSTERY TUBE', origin: 'ART SERIES', category: 'Hộp & Capsule', form: 'tube',
    cost: 110, minLevel: 5, expGain: 82, material: 'paper', icon: '○', sealLabel: 'PEEL BAND',
    desc: 'Ống giấy có nắp và dải bóc vòng, phù hợp vật phẩm dài hoặc đặc biệt.',
    rates: { Common: 0.22, Rare: 0.38, Epic: 0.31, Legendary: 0.09 }, pityRareMax: 5, pityEpicMax: 12,
    color: '#3f3f46', secondaryColor: '#a3e635', borderColor: '#d9f99d', badge: 'Ống giấy'
  },
  {
    id: 'double_capsule', name: 'Capsule Hai Lớp', shortName: 'DUAL CAPSULE', origin: 'ARCADE LAB', category: 'Hộp & Capsule', form: 'capsule',
    cost: 145, minLevel: 7, expGain: 108, material: 'plastic', icon: '◐', sealLabel: 'UNLOCK',
    desc: 'Capsule hai lớp có khóa giữa, mở chậm nhưng tỷ lệ Legendary tốt.',
    rates: { Common: 0.12, Rare: 0.33, Epic: 0.38, Legendary: 0.17 }, pityRareMax: 4, pityEpicMax: 9,
    color: '#172554', secondaryColor: '#ec4899', borderColor: '#93c5fd', badge: 'Capsule hai lớp'
  },
  {
    id: 'velvet_luxury', name: 'Túi Nhung Hoàng Gia', shortName: 'ROYAL VELVET', origin: 'LUXURY', category: 'Cao cấp', form: 'drawstring',
    cost: 180, minLevel: 8, expGain: 135, material: 'plastic', icon: '♛', sealLabel: 'UNTIE',
    desc: 'Túi dây rút phong cách cao cấp với tỷ lệ vật phẩm Sử thi vượt trội.',
    rates: { Common: 0.08, Rare: 0.27, Epic: 0.43, Legendary: 0.22 }, pityRareMax: 4, pityEpicMax: 8,
    color: '#3b0764', secondaryColor: '#fbbf24', borderColor: '#e9d5ff', badge: 'Nhung cao cấp'
  },
  {
    id: 'treasure_crate', name: 'Thùng Kho Báu Mù', shortName: 'SECRET CRATE', origin: 'ADVENTURE', category: 'Cao cấp', form: 'crate',
    cost: 230, minLevel: 10, expGain: 175, material: 'paper', icon: '✚', sealLabel: 'BREAK BAND',
    desc: 'Thùng hộp niêm phong bằng đai giấy, thiên mạnh về Epic và Legendary.',
    rates: { Common: 0.04, Rare: 0.21, Epic: 0.46, Legendary: 0.29 }, pityRareMax: 3, pityEpicMax: 7,
    color: '#4a2b16', secondaryColor: '#d97706', borderColor: '#fcd34d', badge: 'Thùng kho báu'
  },
  {
    id: 'world_crown', name: 'Hộp Vương Miện Thế Giới', shortName: 'WORLD CROWN', origin: 'WORLD EXCLUSIVE', category: 'Cao cấp', form: 'box',
    cost: 320, minLevel: 12, expGain: 240, material: 'foil', icon: '♕', sealLabel: 'ROYAL SEAL',
    desc: 'Mẫu cuối cấp, phối hộp cứng và màng foil với tỷ lệ Legendary cao nhất.',
    rates: { Common: 0.02, Rare: 0.13, Epic: 0.43, Legendary: 0.42 }, pityRareMax: 3, pityEpicMax: 6,
    color: '#101827', secondaryColor: '#f59e0b', borderColor: '#fff1a8', badge: 'World Exclusive'
  }
];
