import { SituationTemplate } from '@/types'

export const SITUATION_TEMPLATES: SituationTemplate[] = [
  {
    id: 'camping',
    name: '캠핑',
    description: '캠핑에 필요한 기본 준비물',
    category: '아웃도어',
    peopleMultiplier: true,
    items: [
      { title: '텐트', description: '방수 기능이 있는 텐트', baseQuantity: 1, unit: '개' },
      { title: '침낭', description: '계절에 맞는 침낭', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '매트', description: '바닥 매트', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '고기', description: '바베큐용 고기', baseQuantity: 500, unit: 'g', multiplier: 1 },
      { title: '쌈장', description: '고기용 쌈장', baseQuantity: 1, unit: '개' },
      { title: '가위', description: '고기용 가위', baseQuantity: 1, unit: '개' },
      { title: '집게', description: '바베큐 집게', baseQuantity: 2, unit: '개' },
      { title: '그릴', description: '바베큐 그릴', baseQuantity: 1, unit: '개' },
      { title: '숯', description: '바베큐용 숯', baseQuantity: 3, unit: 'kg' },
      { title: '착화제', description: '숯 점화용', baseQuantity: 1, unit: '개' },
      { title: '물', description: '식수', baseQuantity: 2, unit: 'L', multiplier: 1 },
      { title: '랜턴', description: 'LED 랜턴', baseQuantity: 1, unit: '개' },
      { title: '헤드랜턴', description: '개인용 헤드랜턴', baseQuantity: 1, unit: '개', multiplier: 1 },
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
      { title: '간식', description: '함께 나눠먹을 간식', baseQuantity: 3, unit: '개' },
      { title: '음료', description: '시원한 음료', baseQuantity: 6, unit: '개' },
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
      { title: '물', description: '충분한 수분', baseQuantity: 1.5, unit: 'L', multiplier: 1 },
      { title: '간식', description: '에너지바, 견과류 등', baseQuantity: 3, unit: '개', multiplier: 1 },
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
    description: '동남아 여행 준비물',
    category: '해외여행',
    peopleMultiplier: true,
    items: [
      { title: '여권', description: '유효기간 6개월 이상', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '비자', description: '필요시 비자', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '항공권', description: '왕복 항공권', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '해외여행보험', description: '의료보험 가입', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '선크림', description: 'SPF 50+ 방수', baseQuantity: 1, unit: '개' },
      { title: '모기약', description: '모기 기피제', baseQuantity: 1, unit: '개' },
      { title: '설사약', description: '장염 대비 약품', baseQuantity: 1, unit: '박스' },
      { title: '반팔', description: '면 소재 반팔', baseQuantity: 5, unit: '개', multiplier: 1 },
      { title: '반바지', description: '통기성 좋은 반바지', baseQuantity: 3, unit: '개', multiplier: 1 },
      { title: '샌들', description: '물에 젖어도 되는 샌들', baseQuantity: 1, unit: '켤레', multiplier: 1 },
      { title: '수영복', description: '해변용 수영복', baseQuantity: 2, unit: '개', multiplier: 1 },
      { title: '멀티어댑터', description: '전기 플러그 어댑터', baseQuantity: 1, unit: '개' },
    ]
  },
  {
    id: 'europe',
    name: '유럽 여행',
    description: '유럽 여행 준비물',
    category: '해외여행',
    peopleMultiplier: true,
    items: [
      { title: '여권', description: '유효기간 6개월 이상', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '비자', description: '셰겐비자 등', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '항공권', description: '왕복 항공권', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '해외여행보험', description: '의료보험 필수', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '겨울옷', description: '따뜻한 외투', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '우산', description: '접이식 우산', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '편한 신발', description: '걷기 편한 운동화', baseQuantity: 1, unit: '켤레', multiplier: 1 },
      { title: '정장', description: '고급 레스토랑용', baseQuantity: 1, unit: '벌', multiplier: 1 },
      { title: '멀티어댑터', description: 'C타입 어댑터', baseQuantity: 1, unit: '개' },
      { title: '유레일패스', description: '기차 패스', baseQuantity: 1, unit: '개', multiplier: 1 },
      { title: '가이드북', description: '여행 가이드북', baseQuantity: 1, unit: '권' },
    ]
  }
]

export function getTemplate(templateId: string): SituationTemplate | undefined {
  return SITUATION_TEMPLATES.find(template => template.id === templateId)
}

export function calculateQuantity(item: { baseQuantity?: number; multiplier?: boolean }, peopleCount: number = 1): number {
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