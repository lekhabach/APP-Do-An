import sharp from 'sharp';

const svg = './assets/logo.svg';

await sharp(svg).resize(512, 512).png().toFile('./assets/icon-512.png');
console.log('✓ icon-512.png');

await sharp(svg).resize(192, 192).png().toFile('./assets/icon-192.png');
console.log('✓ icon-192.png');

console.log('Xong! 2 icon đã được tạo trong thư mục assets/');
