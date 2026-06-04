import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  companyFeatures: Record<string, boolean> | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  companyFeatures: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
    },
    setSession: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; companyFeatures?: Record<string, boolean> | null }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.companyFeatures = action.payload.companyFeatures ?? null;
      localStorage.setItem('accessToken', action.payload.accessToken);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setCompanyFeatures: (state, action: PayloadAction<Record<string, boolean> | null>) => {
      state.companyFeatures = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.companyFeatures = null;
      localStorage.removeItem('accessToken');
    },
  },
});

export const { setCredentials, setSession, setUser, setCompanyFeatures, logout } = authSlice.actions;
export default authSlice.reducer;
