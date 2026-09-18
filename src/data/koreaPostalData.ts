import type { PostalAddressItem } from '../types/topology';

// 대한민국 17개 광역시도 중심 좌표 및 우편번호 대역
export interface ProvinceMeta {
  code: string;
  name: string;
  shortName: string;
  postalPrefix: string;
  lat: number;
  lng: number;
}

export const KOREA_PROVINCES: ProvinceMeta[] = [
  { code: 'SEOUL', name: '서울특별시', shortName: '서울', postalPrefix: '01~09', lat: 37.5665, lng: 126.9780 },
  { code: 'GYEONGGI', name: '경기도', shortName: '경기', postalPrefix: '10~20', lat: 37.4138, lng: 127.5183 },
  { code: 'INCHEON', name: '인천광역시', shortName: '인천', postalPrefix: '21~23', lat: 37.4563, lng: 126.7052 },
  { code: 'GANGWON', name: '강원특별자치도', shortName: '강원', postalPrefix: '24~26', lat: 37.8228, lng: 128.1555 },
  { code: 'CHUNGBUK', name: '충청북도', shortName: '충북', postalPrefix: '27~29', lat: 36.6357, lng: 127.4912 },
  { code: 'SEJONG', name: '세종특별자치시', shortName: '세종', postalPrefix: '30', lat: 36.4800, lng: 127.2890 },
  { code: 'CHUNGNAM', name: '충청남도', shortName: '충남', postalPrefix: '31~33', lat: 36.5184, lng: 126.8000 },
  { code: 'DAEJEON', name: '대전광역시', shortName: '대전', postalPrefix: '34~35', lat: 36.3504, lng: 127.3845 },
  { code: 'GYEONGBUK', name: '경상북도', shortName: '경북', postalPrefix: '36~40', lat: 36.5760, lng: 128.5056 },
  { code: 'DAEGU', name: '대구광역시', shortName: '대구', postalPrefix: '41~43', lat: 35.8714, lng: 128.6014 },
  { code: 'ULSAN', name: '울산광역시', shortName: '울산', postalPrefix: '44~45', lat: 35.5384, lng: 129.3114 },
  { code: 'BUSAN', name: '부산광역시', shortName: '부산', postalPrefix: '46~49', lat: 35.1796, lng: 129.0756 },
  { code: 'GYEONGNAM', name: '경상남도', shortName: '경남', postalPrefix: '50~53', lat: 35.2383, lng: 128.6924 },
  { code: 'JEONBUK', name: '전북특별자치도', shortName: '전북', postalPrefix: '54~56', lat: 35.7175, lng: 127.1530 },
  { code: 'JEONNAM', name: '전라남도', shortName: '전남', postalPrefix: '57~60', lat: 34.8161, lng: 126.4629 },
  { code: 'GWANGJU', name: '광주광역시', shortName: '광주', postalPrefix: '61~62', lat: 35.1595, lng: 126.8526 },
  { code: 'JEJU', name: '제주특별자치도', shortName: '제주', postalPrefix: '63', lat: 33.4996, lng: 126.5312 },
];

// 전국 17개 시·도 전역을 망라하는 전국 통신 국사 및 주요 기간 거점 디렉토리 (80개 핵심 노드)
export const KOREA_POSTAL_DIRECTORY: PostalAddressItem[] = [
  // ================= 1. 서울특별시 (01xxx ~ 09xxx) =================
  { postalCode: '03186', province: '서울특별시', cityDistrict: '종로구', dongOrRoad: '세종대로 178', fullAddress: '서울특별시 종로구 세종대로 178 (광화문국사)', lat: 37.5714, lng: 126.9784 },
  { postalCode: '06234', province: '서울특별시', cityDistrict: '강남구', dongOrRoad: '테헤란로 152', fullAddress: '서울특별시 강남구 테헤란로 152 (강남메인국사)', lat: 37.5000, lng: 127.0365 },
  { postalCode: '06611', province: '서울특별시', cityDistrict: '서초구', dongOrRoad: '서초대로 397', fullAddress: '서울특별시 서초구 서초대로 397 (서초IDC국사)', lat: 37.4950, lng: 127.0210 },
  { postalCode: '05551', province: '서울특별시', cityDistrict: '송파구', dongOrRoad: '올림픽로 300', fullAddress: '서울특별시 송파구 올림픽로 300 (잠실통신센터)', lat: 37.5133, lng: 127.1028 },
  { postalCode: '07335', province: '서울특별시', cityDistrict: '영등포구', dongOrRoad: '여의대로 56', fullAddress: '서울특별시 영등포구 여의대로 56 (여의도금융국사)', lat: 37.5255, lng: 126.9242 },
  { postalCode: '03925', province: '서울특별시', cityDistrict: '마포구', dongOrRoad: '월드컵북로 396', fullAddress: '서울특별시 마포구 월드컵북로 396 (상암미디어국사)', lat: 37.5794, lng: 126.8899 },
  { postalCode: '08503', province: '서울특별시', cityDistrict: '금천구', dongOrRoad: '가산디지털1로 168', fullAddress: '서울특별시 금천구 가산디지털1로 168 (가산IT국사)', lat: 37.4803, lng: 126.8828 },
  { postalCode: '04763', province: '서울특별시', cityDistrict: '성동구', dongOrRoad: '왕십리로 222', fullAddress: '서울특별시 성동구 왕십리로 222 (한양통신국사)', lat: 37.5559, lng: 127.0436 },
  { postalCode: '02043', province: '서울특별시', cityDistrict: '중랑구', dongOrRoad: '망우로 353', fullAddress: '서울특별시 중랑구 망우로 353 (상봉통신국사)', lat: 37.5966, lng: 127.0850 },
  { postalCode: '01395', province: '서울특별시', cityDistrict: '도봉구', dongOrRoad: '도봉로 552', fullAddress: '서울특별시 도봉구 도봉로 552 (창동통신국사)', lat: 37.6532, lng: 127.0371 },
  { postalCode: '07505', province: '서울특별시', cityDistrict: '강서구', dongOrRoad: '공항대로 247', fullAddress: '서울특별시 강서구 공항대로 247 (마곡R&D통신국사)', lat: 37.5601, lng: 126.8342 },
  { postalCode: '08708', province: '서울특별시', cityDistrict: '관악구', dongOrRoad: '관악로 1', fullAddress: '서울특별시 관악구 관악로 1 (서울대관악국사)', lat: 37.4600, lng: 126.9519 },

  // ================= 2. 경기도 (10xxx ~ 20xxx) =================
  { postalCode: '13494', province: '경기도', cityDistrict: '성남시 분당구', dongOrRoad: '판교역로 146', fullAddress: '경기도 성남시 분당구 판교역로 146 (판교백본IDC)', lat: 37.3951, lng: 127.1115 },
  { postalCode: '16490', province: '경기도', cityDistrict: '수원시 팔달구', dongOrRoad: '효원로 295', fullAddress: '경기도 수원시 팔달구 효원로 295 (수원중앙국사)', lat: 37.2636, lng: 127.0286 },
  { postalCode: '14067', province: '경기도', cityDistrict: '안양시 동안구', dongOrRoad: '시민대로 235', fullAddress: '경기도 안양시 동안구 시민대로 235 (평촌스마트국사)', lat: 37.3943, lng: 126.9568 },
  { postalCode: '10414', province: '경기도', cityDistrict: '고양시 일산동구', dongOrRoad: '중앙로 1256', fullAddress: '경기도 고양시 일산동구 중앙로 1256 (일산호수국사)', lat: 37.6584, lng: 126.7725 },
  { postalCode: '17093', province: '경기도', cityDistrict: '용인시 처인구', dongOrRoad: '중부대로 1199', fullAddress: '경기도 용인시 처인구 중부대로 1199 (용인반도체국사)', lat: 37.2343, lng: 127.2013 },
  { postalCode: '14558', province: '경기도', cityDistrict: '부천시 원미구', dongOrRoad: '길주로 210', fullAddress: '경기도 부천시 원미구 길주로 210 (부천중동국사)', lat: 37.5034, lng: 126.7660 },
  { postalCode: '15355', province: '경기도', cityDistrict: '안산시 단원구', dongOrRoad: '중앙대로 918', fullAddress: '경기도 안산시 단원구 중앙대로 918 (안산스마트허브국사)', lat: 37.3188, lng: 126.8309 },
  { postalCode: '17901', province: '경기도', cityDistrict: '평택시', dongOrRoad: '경기대로 245', fullAddress: '경기도 평택시 경기대로 245 (평택고덕국사)', lat: 37.0125, lng: 127.0850 },
  { postalCode: '18469', province: '경기도', cityDistrict: '화성시', dongOrRoad: '동탄대로 537', fullAddress: '경기도 화성시 동탄대로 537 (동탄테크노국사)', lat: 37.2005, lng: 127.0984 },
  { postalCode: '11651', province: '경기도', cityDistrict: '의정부시', dongOrRoad: '시민로 1', fullAddress: '경기도 의정부시 시민로 1 (의정부경기북부국사)', lat: 37.7381, lng: 127.0337 },
  { postalCode: '10881', province: '경기도', cityDistrict: '파주시', dongOrRoad: '시청로 50', fullAddress: '경기도 파주시 시청로 50 (파주디스플레이국사)', lat: 37.7599, lng: 126.7798 },
  { postalCode: '12133', province: '경기도', cityDistrict: '남양주시', dongOrRoad: '경춘로 1037', fullAddress: '경기도 남양주시 경춘로 1037 (남양주다산국사)', lat: 37.6360, lng: 127.2165 },

  // ================= 3. 인천광역시 (21xxx ~ 23xxx) =================
  { postalCode: '21998', province: '인천광역시', cityDistrict: '연수구', dongOrRoad: '송도국제대로 123', fullAddress: '인천광역시 연수구 송도국제대로 123 (송도바이오국사)', lat: 37.3827, lng: 126.6565 },
  { postalCode: '21554', province: '인천광역시', cityDistrict: '남동구', dongOrRoad: '정각로 29', fullAddress: '인천광역시 남동구 정각로 29 (인천시청중앙국사)', lat: 37.4563, lng: 126.7052 },
  { postalCode: '22382', province: '인천광역시', cityDistrict: '중구', dongOrRoad: '공항로 272', fullAddress: '인천광역시 중구 공항로 272 (인천국제공항국사)', lat: 37.4602, lng: 126.4407 },
  { postalCode: '22726', province: '인천광역시', cityDistrict: '서구', dongOrRoad: '청라에메랄드로 99', fullAddress: '인천광역시 서구 청라에메랄드로 99 (청라국제국사)', lat: 37.5348, lng: 126.6575 },

  // ================= 4. 대전 / 세종 / 충청권역 (27xxx ~ 35xxx) =================
  { postalCode: '34141', province: '대전광역시', cityDistrict: '유성구', dongOrRoad: '대덕대로 512', fullAddress: '대전광역시 유성구 대덕대로 512 (대덕연구단지국사)', lat: 36.3742, lng: 127.3845 },
  { postalCode: '35242', province: '대전광역시', cityDistrict: '서구', dongOrRoad: '둔산로 100', fullAddress: '대전광역시 서구 둔산로 100 (대전둔산청사국사)', lat: 36.3550, lng: 127.3838 },
  { postalCode: '30151', province: '세종특별자치시', cityDistrict: '세종시', dongOrRoad: '다솜2로 94', fullAddress: '세종특별자치시 다솜2로 94 (정부세종청사국사)', lat: 36.5042, lng: 127.2655 },
  { postalCode: '28644', province: '충청북도', cityDistrict: '청주시 흥덕구', dongOrRoad: '직지대로 436', fullAddress: '충청북도 청주시 흥덕구 직지대로 436 (청주하이닉스국사)', lat: 36.6385, lng: 127.4410 },
  { postalCode: '27316', province: '충청북도', cityDistrict: '충주시', dongOrRoad: '으뜸로 21', fullAddress: '충청북도 충주시 으뜸로 21 (충주기업도시국사)', lat: 36.9916, lng: 127.9260 },
  { postalCode: '27158', province: '충청북도', cityDistrict: '제천시', dongOrRoad: '내토로 295', fullAddress: '충청북도 제천시 내토로 295 (제천통신국사)', lat: 37.1326, lng: 128.2140 },
  { postalCode: '31156', province: '충청남도', cityDistrict: '천안시 서북구', dongOrRoad: '불당21로 67', fullAddress: '충청남도 천안시 서북구 불당21로 67 (천안아산역국사)', lat: 36.8198, lng: 127.1087 },
  { postalCode: '31434', province: '충청남도', cityDistrict: '아산시', dongOrRoad: '시민로 456', fullAddress: '충청남도 아산시 시민로 456 (아산탕정스마트국사)', lat: 36.7898, lng: 127.0018 },
  { postalCode: '31959', province: '충청남도', cityDistrict: '서산시', dongOrRoad: '관아문길 1', fullAddress: '충청남도 서산시 관아문길 1 (서산대산석유화학국사)', lat: 36.7845, lng: 126.4503 },
  { postalCode: '32589', province: '충청남도', cityDistrict: '공주시', dongOrRoad: '봉황로 1', fullAddress: '충청남도 공주시 봉황로 1 (공주백제국사)', lat: 36.4465, lng: 127.1190 },
  { postalCode: '35015', province: '충청남도', cityDistrict: '홍성군', dongOrRoad: '충남대로 21', fullAddress: '충청남도 홍성군 홍북읍 충남대로 21 (충남도청내포국사)', lat: 36.6588, lng: 126.6728 },

  // ================= 5. 강원특별자치도 (24xxx ~ 26xxx) =================
  { postalCode: '26464', province: '강원특별자치도', cityDistrict: '원주시', dongOrRoad: '시청로 1', fullAddress: '강원특별자치도 원주시 시청로 1 (원주혁신국사)', lat: 37.3422, lng: 127.9202 },
  { postalCode: '24249', province: '강원특별자치도', cityDistrict: '춘천시', dongOrRoad: '중앙로 1', fullAddress: '강원특별자치도 춘천시 중앙로 1 (강원도청춘천국사)', lat: 37.8853, lng: 127.7298 },
  { postalCode: '25457', province: '강원특별자치도', cityDistrict: '강릉시', dongOrRoad: '강릉대로 33', fullAddress: '강원특별자치도 강릉시 강릉대로 33 (강릉동해안국사)', lat: 37.7519, lng: 128.8761 },
  { postalCode: '24822', province: '강원특별자치도', cityDistrict: '속초시', dongOrRoad: '중앙로 183', fullAddress: '강원특별자치도 속초시 중앙로 183 (속초설악국사)', lat: 38.2070, lng: 128.5918 },
  { postalCode: '25749', province: '강원특별자치도', cityDistrict: '동해시', dongOrRoad: '천곡로 77', fullAddress: '강원특별자치도 동해시 천곡로 77 (동해항만국사)', lat: 37.5247, lng: 129.1143 },
  { postalCode: '25932', province: '강원특별자치도', cityDistrict: '태백시', dongOrRoad: '태백로 21', fullAddress: '강원특별자치도 태백시 태백로 21 (태백고원국사)', lat: 37.1640, lng: 128.9856 },

  // ================= 6. 대구 / 경북권역 (36xxx ~ 43xxx) =================
  { postalCode: '42194', province: '대구광역시', cityDistrict: '수성구', dongOrRoad: '달구벌대로 2450', fullAddress: '대구광역시 수성구 달구벌대로 2450 (대구수성IDC)', lat: 35.8580, lng: 128.6250 },
  { postalCode: '41911', province: '대구광역시', cityDistrict: '중구', dongOrRoad: '국채보상로 130', fullAddress: '대구광역시 중구 국채보상로 130 (대구중앙국사)', lat: 35.8714, lng: 128.6014 },
  { postalCode: '42988', province: '대구광역시', cityDistrict: '달성군', dongOrRoad: '테크노중앙대로 333', fullAddress: '대구광역시 달성군 테크노중앙대로 333 (대구국가산단국사)', lat: 35.6710, lng: 128.4350 },
  { postalCode: '37666', province: '경상북도', cityDistrict: '포항시 남구', dongOrRoad: '포스코대로 123', fullAddress: '경상북도 포항시 남구 포스코대로 123 (포항제철소국사)', lat: 36.0190, lng: 129.3650 },
  { postalCode: '39281', province: '경상북도', cityDistrict: '구미시', dongOrRoad: '수출대로 135', fullAddress: '경상북도 구미시 수출대로 135 (구미전자국가산단국사)', lat: 36.1195, lng: 128.3444 },
  { postalCode: '38102', province: '경상북도', cityDistrict: '경주시', dongOrRoad: '양정로 260', fullAddress: '경상북도 경주시 양정로 260 (경주원전통신국사)', lat: 35.8562, lng: 129.2247 },
  { postalCode: '36691', province: '경상북도', cityDistrict: '안동시', dongOrRoad: '도청대로 455', fullAddress: '경상북도 안동시 풍천면 도청대로 455 (경북도청안동국사)', lat: 36.5760, lng: 128.5056 },
  { postalCode: '39512', province: '경상북도', cityDistrict: '김천시', dongOrRoad: '혁신로 123', fullAddress: '경상북도 김천시 혁신로 123 (김천혁신국사)', lat: 36.1215, lng: 128.1820 },
  { postalCode: '36323', province: '경상북도', cityDistrict: '울진군', dongOrRoad: '울진북로 1', fullAddress: '경상북도 울진군 북면 울진북로 1 (한울원자력국사)', lat: 37.0930, lng: 129.3830 },

  // ================= 7. 부산 / 울산 / 경남권역 (44xxx ~ 53xxx) =================
  { postalCode: '48058', province: '부산광역시', cityDistrict: '해운대구', dongOrRoad: '센텀중앙로 79', fullAddress: '부산광역시 해운대구 센텀중앙로 79 (부산센텀국제해저케이블국사)', lat: 35.1742, lng: 129.1310 },
  { postalCode: '48938', province: '부산광역시', cityDistrict: '중구', dongOrRoad: '중앙대로 20', fullAddress: '부산광역시 중구 중앙대로 20 (부산항만물류국사)', lat: 35.1028, lng: 129.0360 },
  { postalCode: '47545', province: '부산광역시', cityDistrict: '연제구', dongOrRoad: '중앙대로 1001', fullAddress: '부산광역시 연제구 중앙대로 1001 (부산시청중앙국사)', lat: 35.1796, lng: 129.0756 },
  { postalCode: '46726', province: '부산광역시', cityDistrict: '강서구', dongOrRoad: '녹산산단382로 14', fullAddress: '부산광역시 강서구 녹산산단382로 14 (부산녹산산단국사)', lat: 35.0935, lng: 128.8550 },
  { postalCode: '44675', province: '울산광역시', cityDistrict: '남구', dongOrRoad: '중앙로 201', fullAddress: '울산광역시 남구 중앙로 201 (울산석유화학산단국사)', lat: 35.5398, lng: 129.3115 },
  { postalCode: '44248', province: '울산광역시', cityDistrict: '북구', dongOrRoad: '현대자동차로 700', fullAddress: '울산광역시 북구 현대자동차로 700 (울산자동차산업국사)', lat: 35.5820, lng: 129.3620 },
  { postalCode: '51435', province: '경상남도', cityDistrict: '창원시 의창구', dongOrRoad: '중앙대로 151', fullAddress: '경상남도 창원시 의창구 중앙대로 151 (창원기계산단국사)', lat: 35.2280, lng: 128.6811 },
  { postalCode: '51000', province: '경상남도', cityDistrict: '김해시', dongOrRoad: '김해대로 2401', fullAddress: '경상남도 김해시 김해대로 2401 (김해스마트국사)', lat: 35.2285, lng: 128.8890 },
  { postalCode: '52828', province: '경상남도', cityDistrict: '진주시', dongOrRoad: '충의로 19', fullAddress: '경상남도 진주시 충의로 19 (진주항공혁신국사)', lat: 35.1802, lng: 128.1420 },
  { postalCode: '53201', province: '경상남도', cityDistrict: '거제시', dongOrRoad: '거제중앙로 13', fullAddress: '경상남도 거제시 거제중앙로 13 (거제대우조선해양국사)', lat: 34.8806, lng: 128.6210 },
  { postalCode: '50600', province: '경상남도', cityDistrict: '양산시', dongOrRoad: '양산대로 800', fullAddress: '경상남도 양산시 양산대로 800 (양산물류ICD국사)', lat: 35.3350, lng: 129.0370 },
  { postalCode: '53000', province: '경상남도', cityDistrict: '통영시', dongOrRoad: '통영해안로 1', fullAddress: '경상남도 통영시 통영해안로 1 (통영남해해양국사)', lat: 34.8540, lng: 128.4330 },

  // ================= 8. 광주 / 전라권역 (54xxx ~ 62xxx) =================
  { postalCode: '61947', province: '광주광역시', cityDistrict: '서구', dongOrRoad: '상무번영로 90', fullAddress: '광주광역시 서구 상무번영로 90 (광주상무국사)', lat: 35.1530, lng: 126.8510 },
  { postalCode: '61011', province: '광주광역시', cityDistrict: '북구', dongOrRoad: '첨단과기로 123', fullAddress: '광주광역시 북구 첨단과기로 123 (광주AI첨단산단국사)', lat: 35.2260, lng: 126.8480 },
  { postalCode: '54994', province: '전북특별자치도', cityDistrict: '전주시 완산구', dongOrRoad: '효자로 225', fullAddress: '전북특별자치도 전주시 완산구 효자로 225 (전주혁신국사)', lat: 35.8202, lng: 127.1088 },
  { postalCode: '54000', province: '전북특별자치도', cityDistrict: '군산시', dongOrRoad: '새만금북로 400', fullAddress: '전북특별자치도 군산시 새만금북로 400 (군산새만금국사)', lat: 35.9675, lng: 126.7360 },
  { postalCode: '54500', province: '전북특별자치도', cityDistrict: '익산시', dongOrRoad: '인북로 32', fullAddress: '전북특별자치도 익산시 인북로 32 (익산국가식품국사)', lat: 35.9480, lng: 126.9570 },
  { postalCode: '59724', province: '전라남도', cityDistrict: '여수시', dongOrRoad: '시청로 1', fullAddress: '전라남도 여수시 시청로 1 (여수국가산단국사)', lat: 34.7604, lng: 127.6622 },
  { postalCode: '57900', province: '전라남도', cityDistrict: '순천시', dongOrRoad: '중앙로 100', fullAddress: '전라남도 순천시 중앙로 100 (순천생태통신국사)', lat: 34.9506, lng: 127.4870 },
  { postalCode: '57700', province: '전라남도', cityDistrict: '광양시', dongOrRoad: '제철로 1', fullAddress: '전라남도 광양시 제철로 1 (광양제철소국사)', lat: 34.9405, lng: 127.6950 },
  { postalCode: '58564', province: '전라남도', cityDistrict: '무안군', dongOrRoad: '오룡길 1', fullAddress: '전라남도 무안군 삼향읍 오룡길 1 (전남도청남악국사)', lat: 34.8166, lng: 126.4633 },
  { postalCode: '58600', province: '전라남도', cityDistrict: '목포시', dongOrRoad: '영산로 1', fullAddress: '전라남도 목포시 영산로 1 (목포항만국사)', lat: 34.8118, lng: 126.3920 },
  { postalCode: '58200', province: '전라남도', cityDistrict: '나주시', dongOrRoad: '전력로 55', fullAddress: '전라남도 나주시 빛가람동 전력로 55 (한전빛가람에너지국사)', lat: 35.0255, lng: 126.7830 },
  { postalCode: '59000', province: '전라남도', cityDistrict: '해남군', dongOrRoad: '군청길 1', fullAddress: '전라남도 해남군 군청길 1 (해남땅끝통신국사)', lat: 34.5735, lng: 126.5990 },

  // ================= 9. 제주특별자치도 (63xxx) =================
  { postalCode: '63122', province: '제주특별자치도', cityDistrict: '제주시', dongOrRoad: '도령로 35', fullAddress: '제주특별자치도 제주시 도령로 35 (제주중앙국사)', lat: 33.4900, lng: 126.4980 },
  { postalCode: '63565', province: '제주특별자치도', cityDistrict: '서귀포시', dongOrRoad: '신중로 55', fullAddress: '제주특별자치도 서귀포시 신중로 55 (서귀포해저케이블국사)', lat: 33.2541, lng: 126.5601 },
  { postalCode: '63000', province: '제주특별자치도', cityDistrict: '제주시', dongOrRoad: '첨단로 242', fullAddress: '제주특별자치도 제주시 첨단로 242 (제주첨단과학기술단지국사)', lat: 33.4530, lng: 126.5700 },

  // ================= 10. 도서 및 국경/영토 최외곽 거점 =================
  { postalCode: '40200', province: '경상북도', cityDistrict: '울릉군', dongOrRoad: '도동길 1', fullAddress: '경상북도 울릉군 울릉읍 도동길 1 (울릉도통신국사)', lat: 37.4840, lng: 130.9050 },
  { postalCode: '40240', province: '경상북도', cityDistrict: '울릉군', dongOrRoad: '독도안용복길 3', fullAddress: '경상북도 울릉군 울릉읍 독도안용복길 3 (독도영토통신초소)', lat: 37.2408, lng: 131.8696 },
  { postalCode: '23100', province: '인천광역시', cityDistrict: '옹진군', dongOrRoad: '백령로 1', fullAddress: '인천광역시 옹진군 백령면 백령로 1 (서해최북단백령도국사)', lat: 37.9690, lng: 124.6300 },
];
