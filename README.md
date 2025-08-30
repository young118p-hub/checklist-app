# 체크리스트 앱

상황별 체크리스트를 만들고 공유하는 웹 애플리케이션입니다.

## 주요 기능

- 🏕️ **상황별 템플릿**: 캠핑, 여행, 면접 등 다양한 상황에 맞는 미리 준비된 템플릿
- 👥 **인원별 계산**: 인원 수에 따라 개인 준비물 수량 자동 계산
- ✅ **체크리스트 관리**: 항목 추가/수정/삭제, 완료 체크
- 🔗 **공유 기능**: 체크리스트를 다른 사람과 공유
- ⭐ **리뷰 시스템**: 공유된 체크리스트에 리뷰와 댓글 작성
- 📱 **반응형 디자인**: 모바일과 데스크톱에서 모두 사용 가능

## 기술 스택

### Frontend
- **Next.js 14** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트 라이브러리

### Backend & Database
- **Supabase** - 인증, 데이터베이스, 실시간 기능
- **PostgreSQL** - 메인 데이터베이스
- **Prisma** - ORM

### State Management
- **Zustand** - 상태 관리

## 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd checklist-app
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일을 만들고 필요한 값들을 설정합니다:

```bash
cp .env.example .env.local
```

#### Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Project Settings > API에서 다음 값들을 복사:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Project Settings > Database에서 Connection string을 복사하여 `DATABASE_URL`과 `DIRECT_URL`에 설정

### 4. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev --name init
```

### 5. 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── checklist/         # 체크리스트 상세 페이지
│   ├── create/            # 체크리스트 생성 페이지
│   ├── login/             # 로그인 페이지
│   └── signup/            # 회원가입 페이지
├── components/            # React 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   ├── checklist/        # 체크리스트 관련 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   └── ui/               # shadcn/ui 컴포넌트
├── hooks/                # Custom React Hooks
├── lib/                  # 유틸리티 함수들
├── stores/               # Zustand 스토어
└── types/                # TypeScript 타입 정의
```

## 사용 가이드

### 1. 회원가입/로그인
- 이메일과 비밀번호로 계정 생성
- Supabase Auth를 통한 안전한 인증

### 2. 체크리스트 만들기
- **템플릿 사용**: 미리 준비된 상황별 템플릿 선택
- **직접 만들기**: 완전히 새로운 체크리스트 생성
- 인원 수 입력 시 개인 준비물 자동 계산

### 3. 체크리스트 관리
- 항목별 완료 체크
- 진행률 확인
- 항목 추가/수정/삭제

### 4. 공유 및 커뮤니티
- 공개 체크리스트로 설정하여 다른 사용자와 공유
- 리뷰와 별점 작성
- 댓글로 소통

## 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린터 실행
npm run lint

# Prisma Studio 실행
npx prisma studio
```

## 배포

### Vercel 배포 (권장)

1. Vercel에 프로젝트 연결
2. 환경 변수를 Vercel 대시보드에서 설정
3. 자동 배포 완료

### 환경 변수 설정 (프로덕션)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 라이센스

MIT License
