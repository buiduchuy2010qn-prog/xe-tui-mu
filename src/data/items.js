export const ITEM_RARITIES = {
  COMMON: { id: 'Common', name: 'Thường', color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.15)', border: '#94a3b8', rarityClass: 'rarity-common' },
  RARE: { id: 'Rare', name: 'Hiếm', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#0284c7', rarityClass: 'rarity-rare' },
  EPIC: { id: 'Epic', name: 'Sử Thi', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: '#9333ea', rarityClass: 'rarity-epic' },
  LEGENDARY: { id: 'Legendary', name: 'Huyền Thoại', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)', border: '#d97706', rarityClass: 'rarity-legendary' }
};

export const INITIAL_ITEMS = [
  // --- THƯỜNG (COMMON) ---
  {
    id: 'c1',
    name: 'Lõi Giấy Vệ Sinh',
    desc: 'Báu vật còn sót lại sau những giờ phút trải nghiệm cực kỳ sinh tồn.',
    rarity: 'Common',
    img: '/assets/toilet_paper_core_1785865805394.jpg',
    icon: '🧻',
    value: 5
  },
  {
    id: 'c2',
    name: 'Dép Đứt Quai',
    desc: 'Huyền thoại chống lại trộm chó, hiện chỉ còn tính năng trang trí.',
    rarity: 'Common',
    icon: '🩴',
    value: 5
  },
  {
    id: 'c3',
    name: 'Viên Đá Ngoài Đường',
    desc: 'Một viên đá bình thường nằm ở lề đường, có tuổi đời 3 triệu năm.',
    rarity: 'Common',
    icon: '🪨',
    value: 5
  },
  {
    id: 'c4',
    name: 'Cục Gôm Gần Hết',
    desc: 'Tẩy được đúng 3 ký tự nữa là biến mất vào hư không.',
    rarity: 'Common',
    icon: '✏️',
    value: 5
  },
  {
    id: 'c5',
    name: 'Nắp Chai Bí Ẩn',
    desc: 'Không ai biết chiếc nắp này từng đậy cho loại nước giải khát nào.',
    rarity: 'Common',
    icon: '🍾',
    value: 5
  },
  {
    id: 'c6',
    name: 'Túi Nilon Bị Thủng',
    desc: 'Đựng gì rơi nấy, tính năng cực kỳ vô tri.',
    rarity: 'Common',
    img: '/assets/shopping_bag_1785865829267.jpg',
    icon: '🛍️',
    value: 5
  },
  {
    id: 'c7',
    name: 'Chiếc Tất Mất Một Bên',
    desc: 'Bị chiếc máy giặt huyền bí nuốt chửng mất người anh em.',
    rarity: 'Common',
    icon: '🧦',
    value: 5
  },
  {
    id: 'c8',
    name: 'Cây Bút Hết Mực',
    desc: 'Vẫn còn ngòi nhưng quẹt cỡ nào cũng chỉ ra vết hằn trên giấy.',
    rarity: 'Common',
    icon: '🖊️',
    value: 5
  },
  {
    id: 'c9',
    name: 'Miếng Bìa Carton',
    desc: 'Vũ khí quạt mát mùa hè khi cúp điện.',
    rarity: 'Common',
    icon: '📦',
    value: 5
  },
  {
    id: 'c10',
    name: 'Sợi Dây Thun Cũ',
    desc: 'Kéo nhẹ là dứt, độ bền tiệm cận số 0.',
    rarity: 'Common',
    icon: '🎗️',
    value: 5
  },

  // --- HIẾM (RARE) ---
  {
    id: 'r1',
    name: 'Tờ 500k Đồ Chơi',
    desc: 'Nhìn từ xa tưởng giàu, nhìn gần thấy nét in hơi mờ.',
    rarity: 'Rare',
    icon: '💸',
    value: 20
  },
  {
    id: 'r2',
    name: 'Móc Khóa Rỉ Sét',
    desc: 'Chứa đựng ký ức tuổi thơ và vô số vi khuẩn cổ đại.',
    rarity: 'Rare',
    icon: '🔑',
    value: 20
  },
  {
    id: 'r3',
    name: 'Remote TV Mất Nắp Pin',
    desc: 'Mỗi lần bấm phải lấy băng dính quấn 3 vòng.',
    rarity: 'Rare',
    icon: '📻',
    value: 25
  },
  {
    id: 'r4',
    name: 'Cục Sạc Lúc Nhận Lúc Không',
    desc: 'Phải uốn dây đúng một góc 47.5 độ thì điện mới vào.',
    rarity: 'Rare',
    icon: '🔌',
    value: 25
  },
  {
    id: 'r5',
    name: 'USB Không Rõ Nội Dung',
    desc: 'Chứa 4GB dữ liệu bí ẩn hoặc 100 con virus.',
    rarity: 'Rare',
    icon: '💾',
    value: 30
  },
  {
    id: 'r6',
    name: 'Đồng Hồ Báo Thức Chậm 7 Phút',
    desc: 'Lý do chính khiến bạn luôn đi học / đi làm trễ.',
    rarity: 'Rare',
    icon: '⏰',
    value: 30
  },
  {
    id: 'r7',
    name: 'Kính Râm Mất 1 Tròng',
    desc: 'Phong cách thời trang ngầu một nửa.',
    rarity: 'Rare',
    icon: '🕶️',
    value: 35
  },
  {
    id: 'r8',
    name: 'Bàn Phím Mất Phím Enter',
    desc: 'Muốn xuống dòng phải dùng chuột copy lệnh.',
    rarity: 'Rare',
    icon: '⌨️',
    value: 35
  },

  // --- SỬ THI (EPIC) ---
  {
    id: 'e1',
    name: 'Hóa Đơn Nợ Khổng Lồ',
    desc: 'Danh sách nợ trà sữa, tiền trọ và tiền cơm bụi qua nhiều thế kỷ.',
    rarity: 'Epic',
    img: '/assets/receipt_debt_1785865838346.jpg',
    icon: '📜',
    value: 80
  },
  {
    id: 'e2',
    name: 'Cục Gạch Giới Hạn',
    desc: 'Được đúc bằng bê tông mác 500, đập vỡ mọi định kiến.',
    rarity: 'Epic',
    icon: '🧱',
    value: 90
  },
  {
    id: 'e3',
    name: 'Dép Tổ Ong Phát Sáng',
    desc: 'Tích tụ năng lượng mặt trời để tỏa sáng trong đêm tối.',
    rarity: 'Epic',
    icon: '👟',
    value: 100
  },
  {
    id: 'e4',
    name: 'Lõi Giấy Dát Vàng Giả',
    desc: 'Lõi giấy được phủ lớp nhũ kim tuyến óng ánh vô cùng xa xỉ.',
    rarity: 'Epic',
    icon: '✨',
    value: 100
  },
  {
    id: 'e5',
    name: 'Remote Điều Khiển Vũ Trụ',
    desc: 'Có nút tua nhanh thứ 2 đến thứ 7 nhưng bấm hoài không ăn.',
    rarity: 'Epic',
    icon: '🌌',
    value: 120
  },
  {
    id: 'e6',
    name: 'Cây Chổi Huyền Thoại',
    desc: 'Vũ khí gõ đầu thần thánh của các bà mẹ.',
    rarity: 'Epic',
    icon: '🧹',
    value: 120
  },
  {
    id: 'e7',
    name: 'Viên Đá Năng Lượng Đồn Đoán',
    desc: 'Được quảng cáo chữa được 108 bệnh nhưng thực chất là đá vôi.',
    rarity: 'Epic',
    icon: '🔮',
    value: 150
  },

  // --- HUYỀN THOẠI (LEGENDARY) ---
  {
    id: 'l1',
    name: 'Tờ 500K Có Thật Hay Không',
    desc: 'Vật phẩm siêu nhiên khiến bất kỳ ai nhìn thấy cũng phải giật mình kiểm tra ví.',
    rarity: 'Legendary',
    icon: '💎',
    value: 300
  },
  {
    id: 'l2',
    name: 'Dép Tổ Ong Tối Thượng',
    desc: 'Chịu được áp suất đáy biển Mariana và nhiệt độ bề mặt Mặt Trời.',
    rarity: 'Legendary',
    icon: '🌟',
    value: 350
  },
  {
    id: 'l3',
    name: 'Lõi Giấy Vệ Sinh Hoàng Gia',
    desc: 'Được chế tác thủ công bởi các nghệ nhân hoàng gia vô tri.',
    rarity: 'Legendary',
    icon: '👑',
    value: 400
  },
  {
    id: 'l4',
    name: 'Cục Gạch Khai Thiên Lập Địa',
    desc: 'Viên gạch đầu tiên được đặt nền móng cho vũ trụ vô tri.',
    rarity: 'Legendary',
    icon: '☄️',
    value: 500
  },
  {
    id: 'l5',
    name: 'Túi Rác Đen Bất Tử',
    desc: 'Túi rác tối thượng chứa đựng toàn bộ bí mật của vũ trụ.',
    rarity: 'Legendary',
    img: '/assets/garbage_bag_1785865795905.jpg',
    icon: '🗑️',
    value: 500
  }
];
