// 라우트 경로 상수 (docs/plans/home-screen.md 확정 컨벤션 기준)
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  signupComplete: '/signup/complete',
  resetPassword: '/reset-password',
  newWorry: '/worries/new',
  worries: '/worries',
  records: '/records',
  mypage: '/mypage',
  notifications: '/notifications',
} as const;
