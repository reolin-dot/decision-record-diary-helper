const fs = require('fs');
const path = require('path');

// 简单的 SVG to PNG 转换说明
// 由于小程序 tabBar 需要 PNG 图片，这里提供转换方法

const icons = [
  'tab-garden-outline',
  'tab-garden-filled',
  'tab-coach-outline',
  'tab-coach-filled',
  'tab-profile-outline',
  'tab-profile-filled'
];

console.log('=== 图标转换指南 ===\n');
console.log('以下 SVG 图标已创建在 miniprogram/images/ 目录：');
icons.forEach(icon => {
  console.log(`  - ${icon}.svg`);
});

console.log('\n请将 SVG 转换为 PNG 格式（建议尺寸 81x81px @3x）：');
console.log('');
console.log('方法 1：使用在线工具');
console.log('  - https://cloudconvert.com/svg-to-png');
console.log('  - https://convertio.co/svg-png/');
console.log('');
console.log('方法 2：使用设计工具');
console.log('  - Figma: 导入 SVG → Export as PNG (3x)');
console.log('  - Sketch: 导入 SVG → Export as PNG (@3x)');
console.log('  - Adobe Illustrator: 打开 SVG → 导出 PNG');
console.log('');
console.log('方法 3：使用命令行工具');
console.log('  - 安装 Inkscape: 然后运行：');
console.log('    inkscape --export-type=png --export-filename=output.png input.svg');
console.log('');
console.log('推荐尺寸：');
console.log('  - @1x: 27x27px');
console.log('  - @2x: 54x54px');
console.log('  - @3x: 81x81px (推荐，最清晰)');
console.log('');
console.log('转换后，将 PNG 文件放到 miniprogram/images/ 目录，');
console.log('并更新 app.json 中的 iconPath 和 selectedIconPath。');
