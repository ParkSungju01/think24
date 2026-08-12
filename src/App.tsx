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
      <NotificationsProvider>
        <Routes>
          <Route element={<LandingLayout />}>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.signup} element={<SignUpPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path={ROUTES.home} element={<HomePage />} />
                <Route path={ROUTES.newWorry} element={<NewWorryPage />} />
                <Route path={ROUTES.mypage} element={<MyPage />} />
              </Route>
              <Route
                path={ROUTES.notifications}
                element={<NotificationsPage />}
              />
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
