import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { HomePage } from './pages/Home';
import { LoginPage } from './pages/Login';
import { SignUpPage } from './pages/SignUp';
import { ROUTES } from './routes/paths';

function App() {
  return (
    <AuthProvider>
      {/* 알림은 별도 페이지가 아니라 NotificationBell 드롭다운으로 표시된다. 모바일 상단바/
          데스크톱 홈 헤더 두 곳에 마운트된 벨이 같은 안읽음 상태를 공유하도록 앱 전역에서
          한 번만 provider를 둔다. */}
      <NotificationsProvider>
        <Routes>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.signup} element={<SignUpPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.home} element={<HomePage />} />
            </Route>
          </Route>
        </Routes>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
