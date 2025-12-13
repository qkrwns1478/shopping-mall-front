# MUNSIKSA Shopping Mall Front-end

## Introduction

**MUNSIKSA**는 Next.js 기반으로 제작된 쇼핑몰 웹 애플리케이션입니다. 사용자에게는 상품 탐색, 장바구니, 주문 및 결제, 마이페이지 기능을 제공하며, 관리자에게는 상품, 카테고리, 쿠폰, 회원, 매출 관리 기능을 제공합니다. 포트원(PortOne) API를 연동하여 실제 결제 프로세스를 구현하였으며, 반응형 디자인이 적용되어 있습니다.

## Key Problem Solving

### **Next.js 도입을 통한 프론트엔드 아키텍처 개선 및 SPA 전환**

**1. 문제**
* 기존 Thymeleaf 기반 SSR 방식은 프론트/백엔드 강결합으로 인해 현대적 UI 프레임워크(Next.js) 도입 및 유지보수가 어려웠음.
* 백엔드 API(8080)와 분리된 환경(3000) 통신 시, CORS 정책 및 세션 쿠키(JSESSIONID) 미전송 문제로 로그인 유지가 되지 않음.
* 비로그인 상태로 마이페이지 접근 시 화면 깜빡임(FOUC) 현상 등 UX 저하 요소가 존재함.

**2. 해결**
* 기존 HTML/jQuery 로직을 Next.js(React) 컴포넌트와 Tailwind CSS로 전면 재작성하여 재사용 가능한 UI 구조를 확립함.
* `axios` 설정에 `withCredentials: true`를 적용하고, Next.js Middleware(`proxy.ts`)를 도입해 쿠키를 안전하게 전달하며 서버 단에서 리다이렉트를 처리함.
* 헤더 컴포넌트가 백엔드 인증 API와 연동되어 실시간 상태를 갱신하도록 구현함.

**3. 결과**
* 뷰 로직을 클라이언트로 완전히 분리하여 사용자 인터랙션이 빠르고 부드러운 SPA를 구축함.
* 미들웨어를 통해 페이지 진입 전 인증 여부를 판별함으로써 화면 깜빡임 없는 매끄러운 페이지 이동과 보안성을 확보함.
* 백엔드 변경 없이 프론트엔드 독자적으로 배포 및 확장이 가능한 구조를 완성해 개발 생산성을 높임.

### **Next.js 기반 결제/인증 프로세스 최적화 및 배포 트러블슈팅**

**1. 문제**
* 비로그인 상태에서 '바로 구매' 시도 시, 임시 장바구니 ID 소실 및 미들웨어의 단순 상태 코드 의존으로 인한 무한 리다이렉트 오류가 발생함.
* 개발 환경에서 실운영 결제 키가 적용되어 실제 과금이 발생하고, Form 태그의 기본 동작(새로고침)으로 인해 디버깅 로그 확인이 어려웠음.
* `useSearchParams` 훅 사용 시 Suspense 경계 처리 누락으로 Vercel 정적 빌드(Static Generation)가 실패함.

**2. 해결**
* 주문 프로세스를 '로그인 선행 → DB 장바구니 병합 → ID 반환 → 이동'으로 재설계하고, 응답 바디의 `authenticated` 값을 검증하도록 수정함.
* 포트원 테스트 채널 키 적용 및 환경변수 캐싱 문제를 해결하고, `e.preventDefault()`를 통해 안정적인 디버깅 환경을 구축함.
* 쿼리 파라미터 의존 컴포넌트를 `<Suspense>`로 감싸 빌드 에러를 해결하고, Next.js 버전을 최신으로 업데이트해 보안 취약점을 조치함.

**3. 결과**
* 비로그인 사용자도 오류 없이 자연스럽게 로그인 후 결제 페이지로 복귀하는 끊김 없는(Seamless) 주문 경험을 제공함.
* 테스트/운영 결제 환경을 확실히 분리하여 오과금 위험을 차단하고, 페이지 이동 시 로그인 상태가 즉각 동기화되도록 개선함.
* Vercel 배포 파이프라인을 정상화하여 지속적 배포(CI/CD) 환경을 복구함.

### **장바구니 상태 관리 최적화 및 사용자 경험(UX) 개선**

**1. 문제**
* 회원(DB)과 비회원(LocalStorage)의 장바구니 데이터 저장소가 이원화되어 있어 상태 관리가 복잡하고 로그인 시 데이터 동기화 문제가 발생함.
* 백엔드 데이터와 프론트엔드 타입 불일치로 인한 `id` 참조 오류 및 라우팅 경로 `undefined` 에러가 빈번함.
* 할인율 및 배송비가 미반영된 단순 가격 표기, 삭제 시 불필요한 확인 절차 등으로 사용자 편의성이 저하됨.

**2. 해결**
* `CartContext`를 도입해 로그인 여부에 따라 API 요청과 로컬 스토리지 로직을 분기하고, 로그인 성공 시 로컬 데이터를 서버로 전송해 병합하는 프로세스를 구축함.
* `CartItem` 인터페이스를 백엔드 DTO 구조에 맞춰 재정의하고 데이터 매핑 로직을 수정해 타입 안정성을 확보함.
* 할인/배송비 계산 로직을 UI에 반영하고, 삭제 기능을 즉시 처리되도록 수정하여 UX를 개선함.

**3. 결과**
* 비회원 상태에서 담은 상품이 로그인 후에도 유실 없이 DB로 이관되는 하이브리드 장바구니 시스템을 완성함.
* 정확한 결제 예정 금액 표시와 상품 상세 이동 기능이 정상 작동하여 애플리케이션의 신뢰도를 높임.
* 복잡한 삭제 절차를 간소화하고 데이터 참조 오류를 해결해 인터랙션 속도와 안정성을 개선함.

### **상품 이미지 관리를 위한 드래그 앤 드롭(DnD) UX 고도화**

**1. 문제**
* 단순 업로드를 넘어 다중 이미지의 순서 변경(드래그)과 대표 이미지 지정(클릭)이 동시에 가능한 인터페이스가 필요했음.
* 드래그 라이브러리(`dnd-kit`)의 위치 계산과 애니메이션 라이브러리(`framer-motion`)의 레이아웃 조정이 충돌하여 기능 오작동이 발생함.
* 드래그 중인 요소가 다른 요소 위를 지날 때 불필요한 리렌더링으로 프레임 드랍(Lag)이 발생함.

**2. 해결**
* 드래그 컨테이너(`dnd-kit`)와 애니메이션 컨테이너(`framer-motion`)를 명확히 분리하여 스타일 충돌을 차단함.
* `DragOverlay`를 도입해 드래그 중인 요소를 최상위 레이어에 렌더링함으로써 리스트 내부 연산 부하를 최소화함.
* 드래그 활성화 시 리스트 아이템에 `pointer-events-none`을 적용해 불필요한 연산을 차단함.

**3. 결과**
* 끊김 없는 60fps 수준의 부드러운 드래그 경험과 자연스러운 위치 교환 애니메이션을 구현함.
* 마우스와 터치 환경 모두에서 오작동 없는 안정적인 순서 변경 기능을 제공함.
* 복잡한 이미지 처리 로직을 `ImageUploader` 컴포넌트로 캡슐화하여 재사용성을 확보함.

## Tech Stacks

![Next.js](https://img.shields.io/badge/Next.js-000000?style=badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=badge&logo=react&logoColor=black)
![vercel](https://img.shields.io/badge/vercel-000000?style=badge&logo=vercel&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=badge&logo=tailwindcss&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=badge&logo=axios&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=badge&logo=reacthookform&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=badge&logo=framer&logoColor=white)
![dnd-kit](https://img.shields.io/badge/dnd--kit-000000?style=badge&logo=dnd&logoColor=white)

## Features
- 회원 관리: 회원가입(이메일 인증), 로그인, 정보 수정, 비밀번호 찾기, 회원 탈퇴
- 상품: 상품 목록 및 상세 조회, 옵션 선택, 검색
- 주문/결제: 장바구니, 포인트 및 쿠폰 사용, 결제(카드/간편결제), 주문 내역 조회
- 관리자 페이지

## Environment Variables `.env.local`

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_STORE_ID=
NEXT_PUBLIC_CHANNEL_KEY=
```