import { useAppSelector } from './redux';

export type FeatureKey =
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'recruitment'
  | 'whatsapp'
  | 'aiAssistant'
  | 'geoFencing'
  | 'faceRecognition'
  | 'performanceManagement'
  | 'assetManagement'
  | 'reports';

export function useFeatures() {
  const features = useAppSelector((s) => s.auth.companyFeatures);
  const role = useAppSelector((s) => s.auth.user?.role);

  const hasFeature = (key: FeatureKey): boolean => {
    if (role === 'super_admin') return true;
    return !!features?.[key];
  };

  return { features, hasFeature };
}
