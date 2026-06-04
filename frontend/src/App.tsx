import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { AppRoutes } from '@/routes/AppRoutes';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setTheme } from '@/store/themeSlice';
import { setUser, setCompanyFeatures } from '@/store/authSlice';
import { apiClient } from '@/api/client';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

function ThemeInit() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  useEffect(() => {
    dispatch(setTheme(mode));
  }, [dispatch, mode]);
  return null;
}

function AuthInit() {
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
  useEffect(() => {
    if (isAuth) {
      apiClient
        .get('/auth/me')
        .then((res) => {
          if (res.data.data?.user) dispatch(setUser(res.data.data.user));
          if (res.data.data?.company?.features) dispatch(setCompanyFeatures(res.data.data.company.features));
        })
        .catch(() => {});
    }
  }, [dispatch, isAuth]);
  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeInit />
          <AuthInit />
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
