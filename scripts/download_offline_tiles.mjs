import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// WGS84 좌표를 타일 x, y로 변환
function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

// 대한민국 바운딩 박스 (BBox)
const KOREA_BBOX = {
  minLon: 124.5,
  maxLon: 131.5,
  minLat: 33.0,
  maxLat: 38.8,
};

// 다운로드할 오프라인 타일 소스 목록
const TILE_SOURCES = [
  {
    name: 'osm',
    urlPattern: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    headers: { 'User-Agent': 'GeoTopology-Offline-Downloader/1.0' },
  },
  {
    name: 'dark',
    urlPattern: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    headers: { 'User-Agent': 'GeoTopology-Offline-Downloader/1.0' },
  },
  {
    name: 'voyager',
    urlPattern: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    headers: { 'User-Agent': 'GeoTopology-Offline-Downloader/1.0' },
  },
];

async function downloadTile(url, destPath, headers) {
  if (fs.existsSync(destPath)) {
    return; // 이미 다운로드됨
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, { headers }, response => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        } else {
          file.close();
          fs.unlink(destPath, () => {});
          resolve(); // 404 등은 건너뜀
        }
      })
      .on('error', err => {
        fs.unlink(destPath, () => {});
        resolve(); // 에러 발생 시 무시하고 다음 진행
      });
  });
}

async function main() {
  console.log('🚀 대한민국 오프라인 지도 타일 다운로드 시작...');
  const zooms = [5, 6, 7, 8]; // 대한민국 전역

  // 주요 대도시/국사 권역 (Zoom 9, 10 상세 타일)
  const METRO_BOXES = [
    { name: '수도권/서울/경기', minLon: 126.6, maxLon: 127.4, minLat: 37.2, maxLat: 37.8 },
    { name: '충청/대전/세종', minLon: 127.1, maxLon: 127.6, minLat: 36.2, maxLat: 36.7 },
    { name: '영남/부산/울산', minLon: 128.8, maxLon: 129.4, minLat: 35.0, maxLat: 35.6 },
  ];

  for (const source of TILE_SOURCES) {
    console.log(`\n📦 [${source.name}] 전국 및 주요 대도시 타일 다운로드 중...`);
    const outputDir = path.join(projectRoot, 'public', 'tiles', source.name);

    // 1. 전국 줌 5~8
    for (const z of zooms) {
      const minX = lon2tile(KOREA_BBOX.minLon, z);
      const maxX = lon2tile(KOREA_BBOX.maxLon, z);
      const minY = lat2tile(KOREA_BBOX.maxLat, z);
      const maxY = lat2tile(KOREA_BBOX.minLat, z);

      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          const url = source.urlPattern.replace('{z}', z).replace('{x}', x).replace('{y}', y);
          const dest = path.join(outputDir, String(z), String(x), `${y}.png`);
          await downloadTile(url, dest, source.headers);
        }
      }
    }

    // 2. 주요 거점 대도시 줌 9~10 상세 타일
    for (const z of [9, 10]) {
      for (const mBox of METRO_BOXES) {
        const minX = lon2tile(mBox.minLon, z);
        const maxX = lon2tile(mBox.maxLon, z);
        const minY = lat2tile(mBox.maxLat, z);
        const maxY = lat2tile(mBox.minLat, z);

        for (let x = minX; x <= maxX; x++) {
          for (let y = minY; y <= maxY; y++) {
            const url = source.urlPattern.replace('{z}', z).replace('{x}', x).replace('{y}', y);
            const dest = path.join(outputDir, String(z), String(x), `${y}.png`);
            await downloadTile(url, dest, source.headers);
          }
        }
      }
    }
  }

  console.log('\n✅ 대한민국 오프라인 지도 타일 다운로드 완료! (public/tiles/)');
}

main().catch(console.error);
