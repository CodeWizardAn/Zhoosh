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
      const authSession = localStorage.getItem('zhoosh_auth_session');
      const completed = localStorage.getItem('zhoosh_onboarding_completed');
      if (authSession === 'true' || completed === 'true') {
        setHasCompletedOnboarding(true);
        loadFromStorage();

        // Restore saved user profile if available
        const savedProfileStr = localStorage.getItem('zhoosh_user_profile');
        if (savedProfileStr) {
          try {
            const p = JSON.parse(savedProfileStr);
            setUser({
              id: 'u-user-custom',
              name: p.name || 'Alex Mercer',
              email: p.email || 'alex.mercer@zhoosh.stream',
              avatar: DEFAULT_AVATAR,
              role: `${p.selectedPlan?.name || 'Standard'} Member`
            });
          } catch {}
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [loadFromStorage, setUser]);

  // ── Listen for logout event — redirect back to landing page ──
  const handleLogoutRedirect = useCallback(() => {
    try {
      localStorage.setItem('zhoosh_auth_session', 'false');
      localStorage.removeItem('zhoosh_auth_session');
      localStorage.removeItem('zhoosh_onboarding_completed');
    } catch {}
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
          onDirectSignIn={(email) => {
            try {
              localStorage.setItem('zhoosh_auth_session', 'true');
              localStorage.setItem('zhoosh_onboarding_completed', 'true');
              localStorage.setItem('zhoosh_last_email', email);
            } catch {}

            const savedProfileStr = localStorage.getItem('zhoosh_user_profile');
            let userName = email.split('@')[0].replace('.', ' ');
            userName = userName.charAt(0).toUpperCase() + userName.slice(1);
            let userRole = 'Zhoosh VIP Member';

            if (savedProfileStr) {
              try {
                const p = JSON.parse(savedProfileStr);
                if (p.name) userName = p.name;
                if (p.selectedPlan?.name) userRole = `${p.selectedPlan.name} Member`;
              } catch {}
            }

            setUser({
              id: 'u-user-custom',
              name: userName,
              email: email,
              avatar: DEFAULT_AVATAR,
              role: userRole
            });

            loadFromStorage();
            setHasCompletedOnboarding(true);

            addToast({
              title: `Welcome back, ${userName}!`,
              description: 'Signed in directly to dashboard.',
              type: 'success'
            });
          }}
          onComplete={(data) => {
            try {
              localStorage.setItem('zhoosh_auth_session', 'true');
              localStorage.setItem('zhoosh_onboarding_completed', 'true');
              localStorage.setItem('zhoosh_last_email', data.email);
              localStorage.setItem('zhoosh_user_profile', JSON.stringify(data));
            } catch {}

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

            addToast({
              title: `Welcome to Zhoosh, ${data.name}!`,
              description: `${agentName} is ready to guide your journey · ${data.selectedPreferences.length} preferences calibrated`,
              type: 'success'
            });
          }}
          onInstantBypass={() => {
            try {
              localStorage.setItem('zhoosh_auth_session', 'true');
              localStorage.setItem('zhoosh_onboarding_completed', 'true');
            } catch {}
            setHasCompletedOnboarding(true);
          }}
        />
      ) : (
        <AppShell />
      )}
    </div>
  );
}
