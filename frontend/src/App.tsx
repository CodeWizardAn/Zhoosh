import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/common/SplashScreen';
import { AppShell } from './components/layout/AppShell';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { setUser, addToast } = useAppStore();

  useEffect(() => {
    try {
      const completed = localStorage.getItem('zhoosh_onboarding_completed') || localStorage.getItem('aura_onboarding_completed');
      if (completed === 'true') {
        setHasCompletedOnboarding(true);
      }
    } catch {
      // fallback
    }
  }, []);

  return (
    <div className="bg-[#050508] min-h-screen text-white selection:bg-[#FF1E56] selection:text-white">
      {!hasLoaded ? (
        <SplashScreen onComplete={() => setHasLoaded(true)} />
      ) : !hasCompletedOnboarding ? (
        <OnboardingFlow
          onComplete={(data) => {
            setUser({
              id: 'u-user-custom',
              name: data.name,
              email: data.email,
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: `${data.selectedPlan?.name || 'Standard'} Member`
            });
            setHasCompletedOnboarding(true);
            try {
              localStorage.setItem('zhoosh_onboarding_completed', 'true');
            } catch {}
            addToast({
              title: `Welcome to Zhoosh, ${data.name}!`,
              description: `${data.selectedPreferences.length} preferences calibrated for your ${data.selectedPlan?.name} tier`,
              type: 'success'
            });
          }}
          onInstantBypass={() => setHasCompletedOnboarding(true)}
        />
      ) : (
        <AppShell />
      )}
    </div>
  );
}
