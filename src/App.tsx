import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { HomePage } from './pages/Home';
import { LandingLayout } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { MyPage } from './pages/MyPage';
import { NewWorryPage } from './pages/NewWorry';
import { NotificationsPage } from './pages/Notifications';
import { SignUpPage } from './pages/SignUp';
import { SignupCompletePage } from './pages/SignupComplete';
import { ROUTES } from './routes/paths';

function App() {
  return (
    <AuthProvider>
      {/* 알림은 이제 모든 화면에서 /notifications 풀스크린 페이지로 이동한다(드롭다운 없음).
          모바일 상단바에 마운트된 벨이 안읽음 상태를 공유하도록 앱 전역에서 한 번만 provider를 둔다. */}
      <NotificationsProvider>
        <Routes>
          {/* 이슈 #39: path 없는 레이아웃 라우트 — URL 세그먼트를 소비하지 않고 모든 하위 라우트에
              "좌측 설명 패널 + 우측 폰 프레임" 셸을 씌운다(docs/plans/landing-phone-refactor.md 3-1). */}
          <Route element={<LandingLayout />}>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.signup} element={<SignUpPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path={ROUTES.home} element={<HomePage />} />
                <Route path={ROUTES.newWorry} element={<NewWorryPage />} />
                <Route path={ROUTES.mypage} element={<MyPage />} />
              </Route>
              {/* 이슈 #17 확인 완료: /notifications는 AppLayout(MobileTopBar/BottomNav)
                  밖의 독립 풀스크린 라우트다(로그인/회원가입 페이지와 동일한 셸 패턴). 다만 로그인
                  여부는 필요하므로 ProtectedRoute 안에는 유지하되 AppLayout만 벗어난다. */}
              <Route
                path={ROUTES.notifications}
                element={<NotificationsPage />}
              />
              {/* 이슈 #21 확인 완료: 가입 완료·목표 설정 화면도 동일하게 AppLayout 밖의 독립
                  풀스크린 라우트다. 로그인 필요 + sessionStorage 플래그(회원가입 직후에만 true)로
                  직접 URL 접근을 막는다 (SignupCompletePage 내부에서 처리). */}
              <Route
                path={ROUTES.signupComplete}
                element={<SignupCompletePage />}
              />
            </Route>
          </Route>
        </Routes>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
