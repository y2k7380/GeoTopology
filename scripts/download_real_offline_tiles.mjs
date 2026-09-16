import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

const KOREA_BBOX = {
  minLon: 125.0,
  maxLon: 130.5,
  minLat: 33.2,
  maxLat: 38.6,
};

const STATIONS = [
  { name: '광화문', lat: 37.5714, lng: 126.9784 },
  { name: '강남', lat: 37.5000, lng: 127.0365 },
  { name: '서초', lat: 37.4950, lng: 127.0210 },
  { name: '판교', lat: 37.4015, lng: 127.1086 },
  { name: '수원', lat: 37.2636, lng: 127.0286 },
  { name: '인천', lat: 37.4563, lng: 126.7052 },
  { name: '송도', lat: 37.3850, lng: 126.6520 },
  { name: '대전', lat: 36.3504, lng: 127.3845 },
  { name: '세종', lat: 36.4800, lng: 127.2890 },
  { name: '천안', lat: 36.8151, lng: 127.1522 },
  { name: '청주', lat: 36.6424, lng: 127.4897 },
  { name: '대구_수성', lat: 35.8580, lng: 128.6250 },
  { name: '대구_북구', lat: 35.8850, lng: 128.5820 },
  { name: '구미', lat: 36.1195, lng: 128.3444 },
  { name: '포항', lat: 36.0190, lng: 129.3650 },
  { name: '울산', lat: 35.5384, lng: 129.3114 },
  { name: '부산_서면', lat: 35.1580, lng: 129.0590 },
  { name: '부산_센텀', lat: 35.1700, lng: 129.1300 },
  { name: '창원', lat: 35.2280, lng: 128.6811 },
  { name: '광주', lat: 35.1595, lng: 126.8526 },
  { name: '전주', lat: 35.8242, lng: 127.1480 },
  { name: '춘천', lat: 37.8813, lng: 127.7298 },
  { name: '원주', lat: 37.3422, lng: 127.9195 },
  { name: '강릉', lat: 37.7519, lng: 128.8761 },
  { name: '제주', lat: 33.4996, lng: 126.5312 },
];

const SOURCES = [
  {
    name: 'street',
    fetchUrl: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`,
  },
  {
    name: 'topo',
    fetchUrl: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}`,
  },
];

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      } else {
        file.close();
        fs.unlink(dest, () => {});
        resolve();
      }
    }).on('error', () => {
      fs.unlink(dest, () => {});
      resolve();
    });
  });
}

async function run() {
  console.log('🚀 대한민국 실제 고화질 상세 오프라인 타일 다운로드 시작...');
  for (const s of SOURCES) {
    console.log(`\n📦 [${s.name}] 다운로드 중...`);
    const baseDir = path.join(projectRoot, 'public', 'tiles', s.name);

    for (const z of [5, 6, 7, 8]) {
      const minX = lon2tile(KOREA_BBOX.minLon, z);
      const maxX = lon2tile(KOREA_BBOX.maxLon, z);
      const minY = lat2tile(KOREA_BBOX.maxLat, z);
      const maxY = lat2tile(KOREA_BBOX.minLat, z);
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          const dest = path.join(baseDir, String(z), String(x), `${y}.jpg`);
          await download(s.fetchUrl(z, x, y), dest);
        }
      }
    }

    for (const st of STATIONS) {
      for (const z of [9, 10, 11, 12, 13]) {
        const cx = lon2tile(st.lng, z);
        const cy = lat2tile(st.lat, z);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const x = cx + dx;
            const y = cy + dy;
            const dest = path.join(baseDir, String(z), String(x), `${y}.jpg`);
            await download(s.fetchUrl(z, x, y), dest);
          }
        }
      }
    }
  }
  console.log('✅ 대한민국 실제 상세 오프라인 타일 다운로드 완료!');
}

run();
