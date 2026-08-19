import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { NicknameProvider } from './contexts/NicknameContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { HomePage } from './pages/Home';
import { LandingLayout } from './pages/Landing';
import { MyPage } from './pages/MyPage';
import { NewWorryPage } from './pages/NewWorry';
import { NotificationsPage } from './pages/Notifications';
import { RecordsPage } from './pages/Records';
import { WorriesPage } from './pages/Worries';
import { ROUTES } from './routes/paths';

function App() {
  return (
    <NicknameProvider>
      <NotificationsProvider>
        <Routes>
          <Route element={<LandingLayout />}>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.home} element={<HomePage />} />
              <Route path={ROUTES.newWorry} element={<NewWorryPage />} />
              <Route path={ROUTES.worries} element={<WorriesPage />} />
              <Route path={ROUTES.records} element={<RecordsPage />} />
              <Route path={ROUTES.mypage} element={<MyPage />} />
            </Route>
            <Route
              path={ROUTES.notifications}
              element={<NotificationsPage />}
            />
          </Route>
        </Routes>
      </NotificationsProvider>
    </NicknameProvider>
  );
}

export default App;
