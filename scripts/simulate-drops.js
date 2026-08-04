import { BAGS } from '../src/data/bags.js';

console.log('====================================================');
console.log('🧪 BẮT ĐẦU MÔ PHỎNG TỶ LỆ RỚT ĐỒ (10,000 LẦN MỞ)');
console.log('====================================================\n');

BAGS.forEach((bag) => {
  const simCount = 10000;
  const counts = { Common: 0, Rare: 0, Epic: 0, Legendary: 0 };
  let pityRare = 0;
  let pityEpic = 0;

  for (let i = 0; i < simCount; i++) {
    let rates = { ...bag.rates };

    if (pityRare >= bag.pityRareMax) rates.Rare += 0.20;
    if (pityEpic >= bag.pityEpicMax) rates.Epic += 0.15;

    const roll = Math.random();
    let chosenRarity = 'Common';
    let cumulative = 0;

    if (roll < (cumulative += rates.Legendary)) chosenRarity = 'Legendary';
    else if (roll < (cumulative += rates.Epic)) chosenRarity = 'Epic';
    else if (roll < (cumulative += rates.Rare)) chosenRarity = 'Rare';
    else chosenRarity = 'Common';

    counts[chosenRarity]++;

    if (['Rare', 'Epic', 'Legendary'].includes(chosenRarity)) pityRare = 0;
    else pityRare++;

    if (['Epic', 'Legendary'].includes(chosenRarity)) pityEpic = 0;
    else pityEpic++;
  }

  console.log(`🛍️ [TÚI: ${bag.name.toUpperCase()}]`);
  console.log(`   - Common:    ${counts.Common} (${((counts.Common / simCount) * 100).toFixed(2)}%)`);
  console.log(`   - Rare:      ${counts.Rare} (${((counts.Rare / simCount) * 100).toFixed(2)}%)`);
  console.log(`   - Epic:      ${counts.Epic} (${((counts.Epic / simCount) * 100).toFixed(2)}%)`);
  console.log(`   - Legendary: ${counts.Legendary} (${((counts.Legendary / simCount) * 100).toFixed(2)}%)`);
  console.log('----------------------------------------------------');
});

console.log('\n✅ KẾT QUẢ MÔ PHỎNG HOÀN HẢO!');
