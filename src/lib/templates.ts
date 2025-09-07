import { SituationTemplate } from '@/types'

export const SITUATION_TEMPLATES: SituationTemplate[] = [
  // === 일상 루틴 ===
  {
    id: 'morning_work',
    name: '출근 준비',
    description: '깜빡하기 쉬운 출근 필수템들',
    category: '일상',
    peopleMultiplier: false,
    items: [
      { title: '지갑', description: '신용카드, 현금, 신분증', baseQuantity: 1, unit: '개' },
      { title: '교통카드', description: '지하철/버스 카드', baseQuantity: 1, unit: '개' },
      { title: '회사 출입카드', description: '사원증/출입카드', baseQuantity: 1, unit: '개' },
      { title: '핸드폰', description: '충전 확인', baseQuantity: 1, unit: '개' },
      { title: '이어폰', description: '무선/유선 이어폰', baseQuantity: 1, unit: '개' },
      { title: '마스크', description: '개인 방역용', baseQuantity: 2, unit: '개' },
      { title: '우산', description: '날씨 확인 후', baseQuantity: 1, unit: '개' },
      { title: '텀블러', description: '카페 할인 + 환경보호', baseQuantity: 1, unit: '개' },
      { title: '간식', description: '오후 허기 대비', baseQuantity: 1, unit: '개' },
      { title: '충전기', description: '휴대용 보조배터리', baseQuantity: 1, unit: '개' },
    ]
  },
  {
    id: 'gym_prep',
    name: '헬스장 준비',
    description: '운동 효과 극대화 준비물',
    category: '운동',
    peopleMultiplier: false,
    items: [
      { title: '운동복', description: '통기성 좋은 셔츠+반바지', baseQuantity: 1, unit: '벌' },
      { title: '운동화', description: '웨이트 전용 신발', baseQuantity: 1, unit: '켤레' },
      { title: '수건', description: '개인 수건 (대형)', baseQuantity: 1, unit: '개' },
      { title: '물병', description: '1L 이상 대용량', baseQuantity: 1, unit: '개' },
      { title: '헬스장 멤버십', description: '출입용 카드/앱', baseQuantity: 1, unit: '개' },
      { title: '운동장갑', description: '웨이트 트레이닝용', baseQuantity: 1, unit: '개' },
      { title: '이어폰', description: '운동 음악용', baseQuantity: 1, unit: '개' },
      { title: '프로틴', description: '운동 후 단백질', baseQuantity: 1, unit: '개' },
      { title: '개인물품보관함', description: '휴대폰, 지갑 보관용 파우치', baseQuantity: 1, unit: '개' },
      { title: '샤워용품', description: '샴푸, 바디워시', baseQuantity: 1, unit: '세트' },
    ]
  },
  {
    id: 'before_sleep',
    name: '잠자기 전',
    description: '숙면과 내일 준비를 위한 체크',
    category: '일상',
    peopleMultiplier: false,
    items: [
      { title: '핸드폰 충전', description: '침대 옆 충전케이블', baseQuantity: 1, unit: '개' },
      { title: '알람 설정', description: '기상 시간 + 여유 5분', baseQuantity: 1, unit: '개' },
      { title: '내일 옷 준비', description: '날씨 확인 후 의상', baseQuantity: 1, unit: '벌' },
      { title: '현관문 잠금', description: '도어락/열쇠 확인', baseQuantity: 1, unit: '회' },
      { title: '가스밸브 잠금', description: '안전 확인', baseQuantity: 1, unit: '회' },
      { title: '창문 닫기', description: '방범/온도 조절', baseQuantity: 1, unit: '회' },
      { title: '내일 일정 확인', description: '캘린더/메모 점검', baseQuantity: 1, unit: '회' },
      { title: '물 한잔', description: '숙면을 위한 수분 보충', baseQuantity: 1, unit: '잔' },
    ]
  },
  {
    id: 'camping',
    name: '캠핑',
    description: '캠핑에 필요한 기본 준비물',
    category: '아웃도어',
    peopleMultiplier: true,
    items: [
      { title: '텐트', description: '🏕️ 방수 기능이 있는 텐트', baseQuantity: 1, unit: '개' },
      { title: '침낭', description: '🛏️ 계절에 맞는 침낭', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '매트', description: '바닥 매트', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '블루투스 스피커', description: '🎵 캠핑 필수템! 분위기 UP', baseQuantity: 1, unit: '개' },
      { title: '보조배터리', description: '🔋 20000mAh 이상, 핸드폰 충전용', baseQuantity: 1, unit: '개' },
      { title: '고기', description: '🥩 바베큐용 고기 (남성 300g, 여성 200g 평균)', baseQuantity: 250, unit: 'g', multiplier: 1 },
      { title: '쌈장', description: '🥄 고기용 쌈장 (8인까지 충분)', baseQuantity: 1, unit: '개' },
      { title: '상추/깻잎', description: '🥬 쌈 채소 (4인 기준)', baseQuantity: 2, unit: '봉지' },
      { title: '가위', description: '✂️ 고기용 가위', baseQuantity: 1, unit: '개' },
      { title: '집게', description: '바베큐 집게', baseQuantity: 2, unit: '개' },
      { title: '그릴', description: '바베큐 그릴', baseQuantity: 1, unit: '개' },
      { title: '숯', description: '바베큐용 숯', baseQuantity: 3, unit: 'kg' },
      { title: '착화제', description: '숯 점화용', baseQuantity: 1, unit: '개' },
      { title: '물', description: '💧 식수 (남성 1.3L, 여성 1.1L 평균)', baseQuantity: 1.2, unit: 'L', multiplier: 1 },
      { title: '랜턴', description: '🏮 LED 랜턴', baseQuantity: 1, unit: '개' },
      { title: '헤드랜턴', description: '개인용 헤드랜턴', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '모기 퇴치제', description: '🦟 여름 캠핑 필수템', baseQuantity: 1, unit: '개' },
      { title: '젖은 물티슈', description: '🧻 손 씻기 어려운 환경 (1박2일 기준)', baseQuantity: 1, unit: '팩' },
      { title: '캠핑 의자', description: '🪑 접이식 의자', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '아이스박스', description: '🧊 음료, 고기 보관용', baseQuantity: 1, unit: '개' },
      { title: '얼음', description: '🧊 아이스박스용', baseQuantity: 3, unit: 'kg' },
    ]
  },
  {
    id: 'pension',
    name: '펜션',
    description: '펜션 여행 준비물',
    category: '여행',
    peopleMultiplier: true,
    items: [
      { title: '수건', description: '개인용 수건', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '세면도구', description: '칫솔, 치약, 샴푸 등', baseQuantity: 1, unit: '세트', multiplier: 1 },
      { title: '슬리퍼', description: '개인용 슬리퍼', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '여벌 옷', description: '갈아입을 옷', baseQuantity: 2, unit: '벌', multiplier: 1 },
      { title: '간식', description: '🍪 함께 나눠먹을 간식 (과자, 과일 등)', baseQuantity: 5, unit: '개' },
      { title: '음료', description: '🥤 시원한 음료 (1인당 2개)', baseQuantity: 2, unit: '개', multiplier: 1 },
      { title: '게임', description: '보드게임 또는 카드게임', baseQuantity: 2, unit: '개' },
      { title: '충전기', description: '휴대폰 충전기', baseQuantity: 1, unit: '개', multiplier: 1 },
    ]
  },
  {
    id: 'interview',
    name: '면접',
    description: '면접 준비물',
    category: '업무',
    peopleMultiplier: false,
    items: [
      { title: '이력서', description: '인쇄된 이력서', baseQuantity: 3, unit: '부' },
      { title: '자기소개서', description: '인쇄된 자기소개서', baseQuantity: 3, unit: '부' },
      { title: '포트폴리오', description: '작업물 모음집', baseQuantity: 1, unit: '개' },
      { title: '신분증', description: '주민등록증 또는 운전면허증', baseQuantity: 1, unit: '개' },
      { title: '증명사진', description: '여분의 증명사진', baseQuantity: 2, unit: '매' },
      { title: '펜', description: '볼펜', baseQuantity: 2, unit: '개' },
      { title: '메모장', description: '작은 메모장', baseQuantity: 1, unit: '개' },
      { title: '시계', description: '시간 확인용', baseQuantity: 1, unit: '개' },
    ]
  },
  {
    id: 'hiking',
    name: '등산',
    description: '등산 준비물',
    category: '아웃도어',
    peopleMultiplier: true,
    items: [
      { title: '등산화', description: '미끄럼 방지 등산화', baseQuantity: 1, unit: '켤레', multiplier: 1 },
      { title: '배낭', description: '등산용 배낭', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '등산복', description: '땀 배출이 잘 되는 옷', baseQuantity: 1, unit: '벌', multiplier: 1 },
      { title: '물', description: '💧 등산용 충분한 수분 (남성 1.8L, 여성 1.3L)', baseQuantity: 1.5, unit: 'L', multiplier: 1 },
      { title: '간식', description: '🍫 에너지바, 견과류 (남성 4개, 여성 2개)', baseQuantity: 3, unit: '개', multiplier: 1 },
      { title: '등산스틱', description: '트레킹 폴', baseQuantity: 2, unit: '개', multiplier: 1 },
      { title: '모자', description: '햇빛 차단용', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '선크림', description: 'SPF 50+', baseQuantity: 1, unit: '개' },
      { title: '구급약', description: '반창고, 소독약 등', baseQuantity: 1, unit: '세트' },
    ]
  },
  {
    id: 'running',
    name: '러닝',
    description: '러닝 준비물',
    category: '운동',
    peopleMultiplier: false,
    items: [
      { title: '러닝화', description: '쿠셔닝이 좋은 러닝화', baseQuantity: 1, unit: '켤레' },
      { title: '러닝복', description: '통기성 좋은 운동복', baseQuantity: 1, unit: '벌' },
      { title: '물병', description: '수분 보충용', baseQuantity: 1, unit: '개' },
      { title: '스마트워치', description: '운동량 측정용', baseQuantity: 1, unit: '개' },
      { title: '이어폰', description: '무선 이어폰', baseQuantity: 1, unit: '개' },
      { title: '수건', description: '땀 닦기용 작은 수건', baseQuantity: 1, unit: '개' },
      { title: '휴대폰', description: '음악 재생 및 긴급상황 대비', baseQuantity: 1, unit: '개' },
    ]
  },
  {
    id: 'southeast_asia',
    name: '동남아 여행',
    description: '🌴 동남아 특화 준비물 (현지 팁 포함)',
    category: '해외여행',
    peopleMultiplier: true,
    items: [
      { title: '여권', description: '유효기간 6개월 이상 필수', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '110V 어댑터', description: '⚡ 한국 220V와 다름! C타입/A타입', baseQuantity: 1, unit: '개' },
      { title: '방수 파우치', description: '📱 스콜(소나기) 대비, 핸드폰 필수', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '설사약', description: '💊 현지 음식 적응용 (정로환/스멕타)', baseQuantity: 1, unit: '박스' },
      { title: '모기 퇴치제', description: '🦟 열대 모기 강력함. DEET 성분', baseQuantity: 1, unit: '개' },
      { title: 'SPF50+ 선크림', description: '☀️ 적도 근처 자외선 강함', baseQuantity: 2, unit: '개' },
      { title: '속건 티셔츠', description: '👕 습도 90% 환경, 빨래 3일 안마름', baseQuantity: 5, unit: '개', multiplier: 1 },
      { title: '얇은 긴팔', description: '🧥 에어컨 너무 추움, 냉방병 주의', baseQuantity: 2, unit: '개', multiplier: 1 },
      { title: '샌들', description: '👟 비 많음, 빨리 마르는 소재', baseQuantity: 1, unit: '켤레', multiplier: 1 },
      { title: '현금 USD', description: '💵 카드 안되는 곳 많음, 달러 준비 (1인당 200불)', baseQuantity: 200, unit: 'USD', multiplier: 1 },
      { title: '물티슈', description: '🧻 화장실 휴지 없는 곳 많음. 대형 팩으로!', baseQuantity: 10, unit: '팩' },
      { title: '해외여행보험', description: '🏥 의료비 비쌈, 필수 가입. 트리플에서 할인 혜택', baseQuantity: 1, unit: '개' },
    ]
  },
  {
    id: 'europe',
    name: '유럽 여행',
    description: '🏰 유럽 특화 준비물 (현지 팁 포함)',
    category: '해외여행',
    peopleMultiplier: true,
    items: [
      { title: '여권', description: '유효기간 6개월 이상 + 복사본', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '220V C타입 어댑터', description: '🔌 한국과 동일 전압, C타입 필수', baseQuantity: 1, unit: '개' },
      { title: '여행용 멀티탭', description: '⚡ 호텔 콘센트 부족, 멀티탭 필수', baseQuantity: 1, unit: '개' },
      { title: '현금 유로', description: '💶 팁 문화 있음, 소액권 준비', baseQuantity: 300, unit: 'EUR', multiplier: 1 },
      { title: '체크카드', description: '💳 해외 수수료 낮은 카드', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '텀블러', description: '🥤 물값 비쌈(3-5유로), 텀블러 필수', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '걷기 편한 신발', description: '👟 하루 2만보 각오, 쿠셔닝 중요', baseQuantity: 1, unit: '켤레', multiplier: 1 },
      { title: '레이어링 의류', description: '🧥 일교차 크고 변덕스러운 날씨', baseQuantity: 3, unit: '벌', multiplier: 1 },
      { title: '접이식 우산', description: '☔ 갑작스런 소나기 대비', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '시티패스/교통패스', description: '🚇 대중교통 패스 사전 구매 권장', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '해외여행보험', description: '🏥 의료비 매우 비쌈, 필수 가입', baseQuantity: 1, unit: '개' },
      { title: '목베개', description: '✈️ 장거리 비행 필수템', baseQuantity: 1, unit: '개', multiplier: 1 },
    ]
  },
  // === 아시아 여행 ===
  {
    id: 'japan_travel',
    name: '일본 여행',
    description: '🗾 일본 특화 준비물 (현지 팁 포함)',
    category: '해외여행',
    peopleMultiplier: true,
    items: [
      { title: '여권', description: '90일 무비자, 유효기간 확인', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '엔화 현금', description: '💴 카드 안되는 곳 많음! 현금 필수', baseQuantity: 50000, unit: 'JPY', multiplier: 1 },
      { title: '포켓와이파이/eSIM', description: '📶 공공와이파이 제한적. 트리플 eSIM 할인 혜택 확인!', baseQuantity: 1, unit: '개' },
      { title: 'IC 카드', description: '🚇 스이카/파스모, 편의점 결제 가능', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '지진 앱', description: '📱 안전알리미, 일본 지진 알림 앱', baseQuantity: 1, unit: '개' },
      { title: '슬리퍼', description: '🥿 숙소/온천 입실 시 신발 벗음', baseQuantity: 1, unit: '켤레', multiplier: 1 },
      { title: '타월', description: '🧖 온천 입장료에 타월 미포함', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '여행 필수 앱', description: '📱 트리플(일정), 파파고(번역), 구글맵', baseQuantity: 3, unit: '개' },
      { title: '현금 지갑', description: '👛 동전 많음, 동전지갑 필수', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '마스크', description: '😷 일본 마스크 문화, 예의', baseQuantity: 10, unit: '개' },
      { title: '편한 신발', description: '👟 많이 걸음, 신발 벗기 쉬운 것', baseQuantity: 1, unit: '켤레', multiplier: 1 },
    ]
  },
  // === 라이프 이벤트 ===
  {
    id: 'moving_prep',
    name: '이사 준비',
    description: '📦 이사 전후 필수 체크사항',
    category: '생활',
    peopleMultiplier: false,
    items: [
      { title: '이사업체 예약', description: '📞 최소 1주일 전 예약', baseQuantity: 1, unit: '업체' },
      { title: '박스/포장재', description: '📦 이삿짐 포장용 박스', baseQuantity: 20, unit: '개' },
      { title: '주소 변경 신고', description: '🏠 주민센터 전입신고', baseQuantity: 1, unit: '회' },
      { title: '인터넷 설치 예약', description: '🌐 입주 전 미리 예약', baseQuantity: 1, unit: '건' },
      { title: '가스 개통 신청', description: '🔥 도시가스 개통 예약', baseQuantity: 1, unit: '건' },
      { title: '전기 개통 신청', description: '⚡ 한전 전기 개통', baseQuantity: 1, unit: '건' },
      { title: '수도 개통 신청', description: '💧 상수도 개통 신청', baseQuantity: 1, unit: '건' },
      { title: '택배 주소 변경', description: '📮 쇼핑몰 배송지 변경', baseQuantity: 1, unit: '회' },
      { title: '은행 주소 변경', description: '🏛️ 주거래 은행 주소 변경', baseQuantity: 1, unit: '회' },
      { title: '청소용품', description: '🧽 입주 청소용 세제', baseQuantity: 1, unit: '세트' },
    ]
  },
  {
    id: 'wedding_prep',
    name: '결혼 준비',
    description: '💒 결혼 준비 필수 체크리스트',
    category: '생활',
    peopleMultiplier: false,
    items: [
      { title: '웨딩홀 예약', description: '🏛️ 6개월~1년 전 예약', baseQuantity: 1, unit: '곳' },
      { title: '웨딩드레스', description: '👰 드레스 시착 및 예약', baseQuantity: 1, unit: '벌' },
      { title: '신랑 예복', description: '🤵 턱시도/정장 맞춤', baseQuantity: 1, unit: '벌' },
      { title: '스튜디오 예약', description: '📸 웨딩촬영 스튜디오', baseQuantity: 1, unit: '곳' },
      { title: '메이크업 예약', description: '💄 본식 당일 메이크업', baseQuantity: 1, unit: '건' },
      { title: '청첩장 제작', description: '💌 하객 수에 맞춰 제작', baseQuantity: 100, unit: '장' },
      { title: '신혼여행 예약', description: '✈️ 허니문 항공+숙박', baseQuantity: 1, unit: '패키지' },
      { title: '예단/예물 준비', description: '💍 반지, 예단 준비', baseQuantity: 1, unit: '세트' },
      { title: '신부가방', description: '👜 한국 전통 결혼 문화, 신부 용돈 가방', baseQuantity: 1, unit: '개' },
      { title: '폐백 준비물', description: '🥜 대추, 밤 등 폐백 용품', baseQuantity: 1, unit: '세트' },
      { title: '하객 리스트', description: '📋 초대할 하객 명단', baseQuantity: 1, unit: '개' },
      { title: '혼인신고서', description: '📄 구청/주민센터 제출', baseQuantity: 1, unit: '통' },
    ]
  },
  // === 한국 특화 템플릿 ===
  {
    id: 'csat_exam',
    name: '수능 준비',
    description: '📝 수능 당일 필수 준비물',
    category: '학습',
    peopleMultiplier: false,
    items: [
      { title: '수험표', description: '📄 절대 필수! 복사본도 준비', baseQuantity: 2, unit: '매' },
      { title: '신분증', description: '🆔 주민등록증/학생증', baseQuantity: 1, unit: '개' },
      { title: '컴퓨터용 사인펜', description: '✏️ 검은색, 0.5mm', baseQuantity: 3, unit: '개' },
      { title: '연필', description: '✏️ 2B 연필 (샤프 금지)', baseQuantity: 5, unit: '개' },
      { title: '지우개', description: '🧽 깨끗한 지우개', baseQuantity: 2, unit: '개' },
      { title: '시계', description: '⏰ 아날로그 시계 (디지털 불가)', baseQuantity: 1, unit: '개' },
      { title: '휴대용 연필깎이', description: '✂️ 소음 적은 것', baseQuantity: 1, unit: '개' },
      { title: '마스크', description: '😷 개인 방역용', baseQuantity: 2, unit: '개' },
      { title: '초콜릿', description: '🍫 당분 보충용 (시끄럽지 않은 것)', baseQuantity: 2, unit: '개' },
      { title: '물', description: '💧 생수 (라벨 제거)', baseQuantity: 1, unit: '개' },
    ]
  },
  {
    id: 'job_interview_korea',
    name: '한국 취업 면접',
    description: '👔 한국 기업 면접 특화 준비물',
    category: '업무',
    peopleMultiplier: false,
    items: [
      { title: '정장', description: '👔 네이비/차콜 정장 (다림질 필수)', baseQuantity: 1, unit: '벌' },
      { title: '구두', description: '👞 검은색 정장 구두 (광택)', baseQuantity: 1, unit: '켤레' },
      { title: '이력서', description: '📄 한국형 이력서 (사진 부착)', baseQuantity: 5, unit: '부' },
      { title: '자기소개서', description: '📋 회사별 맞춤 작성', baseQuantity: 3, unit: '부' },
      { title: '졸업증명서', description: '🎓 원본 + 복사본', baseQuantity: 2, unit: '부' },
      { title: '성적증명서', description: '📊 대학 성적표', baseQuantity: 2, unit: '부' },
      { title: '자격증 사본', description: '🏆 토익, 컴활 등', baseQuantity: 3, unit: '부' },
      { title: '증명사진', description: '📸 여분 (3x4cm)', baseQuantity: 5, unit: '매' },
      { title: '펜', description: '🖊️ 검은색 볼펜', baseQuantity: 2, unit: '개' },
      { title: '손수건', description: '🤧 긴장 시 땀 닦기용', baseQuantity: 1, unit: '개' },
    ]
  },
  {
    id: 'korean_festival',
    name: '한국 축제 (벚꽃, 불꽃축제)',
    description: '🌸 한국 봄가을 축제 준비물',
    category: '문화',
    peopleMultiplier: true,
    items: [
      { title: '돗자리', description: '🏞️ 방수 돗자리 (앉을 자리 확보)', baseQuantity: 1, unit: '개' },
      { title: '간식', description: '🍪 김밥, 과자 등', baseQuantity: 3, unit: '개', multiplier: 1 },
      { title: '음료', description: '🥤 시원한 음료', baseQuantity: 2, unit: '개', multiplier: 1 },
      { title: '휴지', description: '🧻 물티슈 + 휴지', baseQuantity: 3, unit: '팩' },
      { title: '쓰레기봉투', description: '🗑️ 뒷정리용', baseQuantity: 3, unit: '개' },
      { title: '카메라/핸드폰', description: '📱 인생샷 촬영용', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '보조배터리', description: '🔋 사진 많이 찍을 예정', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '얇은 외투', description: '🧥 저녁 기온 하락 대비', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '방석/쿠션', description: '🪑 장시간 앉기 편한', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '선크림', description: '☀️ 야외 활동용', baseQuantity: 1, unit: '개' },
    ]
  },
  {
    id: 'korean_hiking_mountain',
    name: '한국 산 등산 (북한산, 설악산)',
    description: '⛰️ 한국 명산 등반 준비물',
    category: '아웃도어', 
    peopleMultiplier: true,
    items: [
      { title: '등산화', description: '👟 발목 보호 등산화', baseQuantity: 1, unit: '켤레', multiplier: 1 },
      { title: '등산복', description: '👕 속건성 소재', baseQuantity: 1, unit: '벌', multiplier: 1 },
      { title: '백팩', description: '🎒 20-30L 등산용', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '물', description: '💧 충분한 수분 (500ml x 3)', baseQuantity: 1.5, unit: 'L', multiplier: 1 },
      { title: '김밥', description: '🍙 한국 등산 필수 도시락', baseQuantity: 1, unit: '줄', multiplier: 1 },
      { title: '막걸리', description: '🍶 정상 인증용 (선택사항)', baseQuantity: 1, unit: '병' },
      { title: '컵라면', description: '🍜 산장/대피소용', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '등산스틱', description: '🦯 무릎 보호용', baseQuantity: 2, unit: '개', multiplier: 1 },
      { title: '헤드랜턴', description: '🔦 일찍 어두워지는 계절', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '구급약', description: '🩹 밴드, 파스 등', baseQuantity: 1, unit: '세트' },
    ]
  }
]

export function getTemplate(templateId: string): SituationTemplate | undefined {
  return SITUATION_TEMPLATES.find(template => template.id === templateId)
}

export function calculateQuantity(item: { baseQuantity?: number; multiplier?: number }, peopleCount: number = 1): number {
  if (!item.multiplier) return item.baseQuantity || 1
  return (item.baseQuantity || 1) * Math.max(1, peopleCount)
}

export function generateChecklistFromTemplate(
  templateId: string, 
  peopleCount: number = 1
): { items: { title: string; description?: string; quantity: number; unit?: string; order: number }[] } | null {
  const template = getTemplate(templateId)
  if (!template) return null

  const items = template.items.map((item, index) => ({
    title: item.title,
    description: item.description,
    quantity: calculateQuantity(item, template.peopleMultiplier ? peopleCount : 1),
    unit: item.unit,
    isCompleted: false,
    order: index,
  }))

  return { items }
}