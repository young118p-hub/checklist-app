import { SituationTemplate } from '../types'
import { SITUATION_TEMPLATES } from './templates'

// 날씨 기반 추천
export interface WeatherCondition {
  condition: 'sunny' | 'rainy' | 'cloudy' | 'snow' | 'hot' | 'cold'
  temperature?: number
  season?: 'spring' | 'summer' | 'fall' | 'winter'
}

// 시간대별 추천
export interface TimeContext {
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night'
  dayOfWeek: 'weekday' | 'weekend'
  isHoliday?: boolean
}

// 사용자 컨텍스트
export interface UserContext {
  recentTemplates?: string[] // 최근 사용한 템플릿 ID들
  favoriteCategories?: string[] // 자주 사용하는 카테고리
  location?: 'domestic' | 'international' // 국내/해외
  weather?: WeatherCondition
  time?: TimeContext
}

// 날씨별 추천 항목
const weatherBasedSuggestions = {
  rainy: [
    { title: '우산', description: '🔥꿀팁: 접이식보다 일반 우산이 바람에 강함', priority: 10 },
    { title: '방수 신발/신발커버', description: '🔥꿀팁: 발 젖는 것만큼 불편한 건 없음', priority: 9 },
    { title: '비닐봉지', description: '🔥꿀팁: 젖은 옷, 우산 보관용', priority: 7 },
    { title: '수건', description: '🔥꿀팁: 젖은 머리카락 말리기', priority: 6 },
  ],
  sunny: [
    { title: '선크림 SPF50+', description: '🔥꿀팁: 2시간마다 덧발라야 효과', priority: 10 },
    { title: '선글라스', description: '🔥꿀팁: UV 차단 기능 확인 필수', priority: 8 },
    { title: '모자', description: '🔥꿀팁: 챙 넓은 것으로 목뒤까지 보호', priority: 8 },
    { title: '시원한 음료', description: '🔥꿀팁: 탈수 방지, 전해질 보충', priority: 7 },
  ],
  hot: [
    { title: '쿨토시', description: '🔥꿀팁: 팔 태닝 방지, 체감온도 -3도', priority: 9 },
    { title: '부채/휴대용 선풍기', description: '🔥꿀팁: 대중교통에서 생명템', priority: 8 },
    { title: '얼음물', description: '🔥꿀팁: 목뒤에 대면 체온 빠르게 하강', priority: 9 },
    { title: '염분정', description: '🔥꿀팁: 땀 많이 흘릴 때 탈수 방지', priority: 6 },
  ],
  cold: [
    { title: '핫팩', description: '🔥꿀팁: 신발 속, 주머니용 각각 준비', priority: 10 },
    { title: '목도리/머플러', description: '🔥꿀팁: 목만 따뜻해도 체감온도 +5도', priority: 9 },
    { title: '따뜻한 음료', description: '🔥꿀팁: 보온병에 미리 준비', priority: 7 },
    { title: '방한장갑', description: '🔥꿀팁: 스마트폰 터치 가능한 것', priority: 8 },
  ],
  snow: [
    { title: '미끄럼방지 깔창', description: '🔥꿀팁: 빙판길 사고 예방 필수', priority: 10 },
    { title: '방수 부츠', description: '🔥꿀팁: 눈 스며들면 동상 위험', priority: 9 },
    { title: '여분 양말', description: '🔥꿀팁: 발 젖으면 체온 급속 하강', priority: 8 },
    { title: '비상 연락처', description: '🔥꿀팁: 교통마비 시 지인 연락용', priority: 6 },
  ]
}

// 시간대별 추천 템플릿
const timeBasedRecommendations = {
  dawn: ['running', 'gym_prep'],
  morning: ['morning_work', 'interview', 'gym_prep'],
  afternoon: ['shopping', 'meeting'],
  evening: ['date', 'dinner', 'social'],
  night: ['before_sleep', 'night_out'],
  weekday: ['morning_work', 'interview', 'business_trip'],
  weekend: ['camping', 'hiking', 'pension', 'travel']
}

// 계절별 추천
const seasonalSuggestions = {
  spring: [
    { title: '황사마스크', description: '🔥꿀팁: 미세먼지 심한 날 KF94', priority: 8 },
    { title: '알레르기약', description: '🔥꿀팁: 꽃가루 알레르기 대비', priority: 7 },
    { title: '얇은 카디건', description: '🔥꿀팁: 아침저녁 일교차 대비', priority: 7 },
  ],
  summer: [
    { title: '휴대용 선풍기', description: '🔥꿀팁: 목에 거는 타입 추천', priority: 9 },
    { title: '전해질 음료', description: '🔥꿀팁: 포카리스웨트 등 탈수 방지', priority: 9 },
    { title: '아이스팩', description: '🔥꿀팁: 목뒤/손목에 대면 급속 쿨다운', priority: 8 },
  ],
  fall: [
    { title: '레이어링 의류', description: '🔥꿀팁: 벗거나 입기 쉬운 옷', priority: 8 },
    { title: '립밤', description: '🔥꿀팁: 건조해지는 계절 입술관리', priority: 6 },
    { title: '보습제', description: '🔥꿀팁: 핸드크림, 보디로션 필수', priority: 6 },
  ],
  winter: [
    { title: '기모내의', description: '🔥꿀팁: 히트텍보다 기모가 더 따뜻', priority: 9 },
    { title: '방한용품 세트', description: '🔥꿀팁: 모자+장갑+목도리 세트', priority: 9 },
    { title: '건조 대비 용품', description: '🔥꿀팁: 가습기, 코 보습제', priority: 7 },
  ]
}

// 스마트 추천 엔진
export class SmartRecommendationEngine {
  
  // 컨텍스트 기반 추천 템플릿
  static getContextualTemplates(context: UserContext): SituationTemplate[] {
    const recommendations = new Set<string>()
    
    // 시간 기반 추천
    if (context.time) {
      const timeRecs = timeBasedRecommendations[context.time.timeOfDay] || []
      const dayRecs = timeBasedRecommendations[context.time.dayOfWeek] || []
      
      timeRecs.forEach(id => recommendations.add(id))
      dayRecs.forEach(id => recommendations.add(id))
    }
    
    // 최근 사용 템플릿의 관련 추천
    if (context.recentTemplates) {
      context.recentTemplates.forEach(templateId => {
        const relatedTemplates = this.getRelatedTemplates(templateId)
        relatedTemplates.forEach(id => recommendations.add(id))
      })
    }
    
    // 선호 카테고리 기반
    if (context.favoriteCategories) {
      SITUATION_TEMPLATES
        .filter(t => context.favoriteCategories!.includes(t.category))
        .slice(0, 3) // 상위 3개만
        .forEach(t => recommendations.add(t.id))
    }
    
    return SITUATION_TEMPLATES.filter(t => recommendations.has(t.id))
  }
  
  // 날씨 기반 추가 항목 추천
  static getWeatherBasedItems(weather: WeatherCondition) {
    const suggestions = []
    
    if (weather.condition && weatherBasedSuggestions[weather.condition]) {
      suggestions.push(...weatherBasedSuggestions[weather.condition])
    }
    
    if (weather.season && seasonalSuggestions[weather.season]) {
      suggestions.push(...seasonalSuggestions[weather.season])
    }
    
    // 온도 기반 추가 추천
    if (weather.temperature) {
      if (weather.temperature >= 30) {
        suggestions.push(...weatherBasedSuggestions.hot)
      } else if (weather.temperature <= 5) {
        suggestions.push(...weatherBasedSuggestions.cold)
      }
    }
    
    // 우선순위 정렬
    return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 5)
  }
  
  // 관련 템플릿 찾기
  private static getRelatedTemplates(templateId: string): string[] {
    const relatedMap: Record<string, string[]> = {
      'camping': ['hiking', 'pension', 'outdoor_festival'],
      'hiking': ['camping', 'running', 'outdoor_sports'],
      'gym_prep': ['running', 'swimming', 'sports'],
      'morning_work': ['interview', 'business_meeting'],
      'southeast_asia': ['japan_travel', 'europe', 'travel_general'],
      'running': ['gym_prep', 'hiking', 'marathon'],
    }
    
    return relatedMap[templateId] || []
  }
  
  // 사용 패턴 분석 기반 추천
  static getUsageBasedRecommendations(usageHistory: { templateId: string, timestamp: Date, season: string }[]): string[] {
    const currentSeason = this.getCurrentSeason()
    const seasonalUsage = usageHistory.filter(h => h.season === currentSeason)
    
    // 현재 계절에 자주 사용한 템플릿들
    const frequencyMap = seasonalUsage.reduce((acc, usage) => {
      acc[usage.templateId] = (acc[usage.templateId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(frequencyMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([templateId]) => templateId)
  }
  
  // 현재 계절 감지
  private static getCurrentSeason(): string {
    const month = new Date().getMonth() + 1
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'fall'
    return 'winter'
  }
  
  // 위치 기반 추천
  static getLocationBasedSuggestions(location: string) {
    const locationSuggestions: Record<string, any[]> = {
      'seoul': [
        { title: '지하철 교통카드', description: '🔥꿀팁: 티머니/하나로카드 충전 확인', priority: 10 },
        { title: '미세먼지 마스크', description: '🔥꿀팁: 서울 미세먼지 심할 때 필수', priority: 8 }
      ],
      'busan': [
        { title: '햇빛 차단용품', description: '🔥꿀팁: 해안 지역 자외선 강함', priority: 9 },
        { title: '바람막이', description: '🔥꿀팁: 바닷바람 대비', priority: 7 }
      ],
      'jeju': [
        { title: '렌터카 준비', description: '🔥꿀팁: 국제면허증 또는 한국면허증', priority: 10 },
        { title: '바람막이/우의', description: '🔥꿀팁: 제주도 날씨 변화무쌍', priority: 9 }
      ]
    }
    
    return locationSuggestions[location] || []
  }
}

// 실시간 추천 API
export async function getSmartRecommendations(context: UserContext) {
  const engine = SmartRecommendationEngine
  
  // 컨텍스트 기반 템플릿 추천
  const recommendedTemplates = engine.getContextualTemplates(context)
  
  // 날씨 기반 추가 항목
  const weatherItems = context.weather ? engine.getWeatherBasedItems(context.weather) : []
  
  return {
    templates: recommendedTemplates.slice(0, 6), // 상위 6개 템플릿
    additionalItems: weatherItems,
    reasoning: this.generateReasoningText(context)
  }
}

function generateReasoningText(context: UserContext): string {
  const reasons = []
  
  if (context.weather?.condition === 'rainy') {
    reasons.push("비가 와서 우산과 방수용품을 추천드려요")
  }
  
  if (context.time?.timeOfDay === 'morning') {
    reasons.push("아침 시간대라서 출근 관련 템플릿을 우선 추천해요")
  }
  
  if (context.time?.dayOfWeek === 'weekend') {
    reasons.push("주말이라서 여가 활동 템플릿을 추천드려요")
  }
  
  return reasons.join(', ') || "현재 상황에 맞는 추천을 준비했어요"
}