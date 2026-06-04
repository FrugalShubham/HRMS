import { useFeatures, FeatureKey } from '@/hooks/useFeatures';

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { hasFeature } = useFeatures();
  if (!hasFeature(feature)) return <>{fallback}</>;
  return <>{children}</>;
}
