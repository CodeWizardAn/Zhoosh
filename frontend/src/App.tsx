import React, { useState, useEffect, useCallback } from 'react';
import { SplashScreen } from './components/common/SplashScreen';
import { AppShell } from './components/layout/AppShell';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { useAppStore } from './store/useAppStore';
import { useAgentStore } from './store/useAgentStore';
import { DEFAULT_AVATAR } from './utils/avatars';

export default function App() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { setUser, addToast } = useAppStore();
  const { setProfile, loadFromStorage, resetForLogout } = useAgentStore();

  // ── Restore session on first load ──
  useEffect(() => {
    try {
      const completed =
        localStorage.getItem('zhoosh_onboarding_completed') ||
        localStorage.getItem('aura_onboarding_completed');
      if (completed === 'true') {
        setHasCompletedOnboarding(true);
        loadFromStorage();
      }
    } catch {
      // ignore storage errors
    }
  }, [loadFromStorage]);

  // ── Listen for logout event — redirect back to landing ──
  const handleLogoutRedirect = useCallback(() => {
    resetForLogout();
    setHasCompletedOnboarding(false);
  }, [resetForLogout]);

  useEffect(() => {
    window.addEventListener('zhoosh:logout', handleLogoutRedirect);
    return () => window.removeEventListener('zhoosh:logout', handleLogoutRedirect);
  }, [handleLogoutRedirect]);

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
              avatar: DEFAULT_AVATAR,
              role: `${data.selectedPlan?.name || 'Standard'} Member`
            });

            const agentName = data.agentName || 'Nova';
            setProfile({
              name: agentName,
              avatarUrl: '/agent-avatar.jpg',
              createdAt: new Date().toISOString(),
            });

            fetch('/api/agent/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: 'u-user-custom', agent_name: agentName }),
            }).catch(() => {});

            setHasCompletedOnboarding(true);
            try {
              localStorage.setItem('zhoosh_onboarding_completed', 'true');
            } catch {}

            addToast({
              title: `Welcome to Zhoosh, ${data.name}!`,
              description: `${agentName} is ready to guide your journey · ${data.selectedPreferences.length} preferences calibrated`,
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
