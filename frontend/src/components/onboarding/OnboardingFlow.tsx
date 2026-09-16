import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { OnboardingStep, SubscriptionPlan, PreferenceItem, OnboardingUserData, SUBSCRIPTION_PLANS, PREFERENCE_ITEMS } from './types';
import { LandingLoginStep } from './steps/LandingLoginStep';
import { PlansStep } from './steps/PlansStep';
import { AccountCreationStep } from './steps/AccountCreationStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { AgentSetupStep } from './steps/AgentSetupStep';
import { DashboardRevealTransition } from './steps/DashboardRevealTransition';
import { SplitScreenCurtain } from './components/SplitScreenCurtain';

interface OnboardingFlowProps {
  onComplete: (userData: OnboardingUserData) => void;
  onInstantBypass?: () => void;
  onDirectSignIn?: (email: string) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onInstantBypass,
  onDirectSignIn
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('landing');
  const [isSplitting, setIsSplitting] = useState(false);

  // User State
  const [userData, setUserData] = useState<OnboardingUserData>({
    name: 'Alex Mercer',
    email: 'alex.mercer@zhoosh.stream',
    phone: '(555) 349-2810',
    selectedPlan: SUBSCRIPTION_PLANS[1], // Standard default
    selectedPreferences: [], // Start empty so user can freely select genres and languages
    agentName: 'Nova',
  });

  // Step 1 -> Step 2
  const handleGoToPlans = () => {
    setCurrentStep('plans');
  };

  // Step 1: direct sign in -> enters dashboard directly
  const handleLoginSuccess = (email: string) => {
    const updatedUser = {
      ...userData,
      email,
      name: email.split('@')[0].replace('.', ' ')
    };
    setUserData(updatedUser);
    if (onDirectSignIn) {
      onDirectSignIn(email);
    } else {
      onComplete(updatedUser);
    }
  };

  // Step 2 -> Step 3
  const handlePlanSelected = (plan: SubscriptionPlan) => {
    setUserData((prev) => ({ ...prev, selectedPlan: plan }));
    setCurrentStep('account');
  };

  // Step 3 -> Step 4
  const handleAccountCreated = (created: Partial<OnboardingUserData>) => {
    setUserData((prev) => ({
      ...prev,
      ...created
    }));
    setCurrentStep('preferences');
  };

  // Step 4 -> Step 5 (Agent Setup — NEW final onboarding step)
  const handlePreferencesComplete = (preferences: PreferenceItem[]) => {
    setUserData((prev) => ({ ...prev, selectedPreferences: preferences }));
    setCurrentStep('agent-setup');
  };

  // Step 5 -> Step 6 (Reveal)
  const handleAgentSetupComplete = (agentName: string) => {
    setUserData((prev) => ({ ...prev, agentName }));
    setCurrentStep('reveal');
  };

  // Step 6: "Let's Go" clicked -> Trigger 400ms Split Screen Curtain
  const handleBeginReveal = () => {
    setIsSplitting(true);
  };

  // Curtain finished sliding left & right 400ms -> unveil dashboard!
  const handleSplitComplete = () => {
    // Save completion flag in localStorage
    try {
      localStorage.setItem('zhoosh_onboarding_completed', 'true');
      localStorage.setItem('zhoosh_user_profile', JSON.stringify(userData));
    } catch {
      // ignore
    }
    onComplete(userData);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050508] text-white select-none">
      {/* Dynamic Step Transitions */}
      <AnimatePresence mode="wait">
        {currentStep === 'landing' && (
          <LandingLoginStep
            key="landing"
            onGoToPlans={handleGoToPlans}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentStep === 'plans' && (
          <PlansStep
            key="plans"
            initialSelectedId={userData.selectedPlan?.id || 'standard'}
            onPlanSelected={handlePlanSelected}
            onBack={() => setCurrentStep('landing')}
          />
        )}

        {currentStep === 'account' && (
          <AccountCreationStep
            key="account"
            selectedPlan={userData.selectedPlan || SUBSCRIPTION_PLANS[1]}
            onAccountCreated={handleAccountCreated}
            onBack={() => setCurrentStep('plans')}
          />
        )}

        {currentStep === 'preferences' && (
          <PreferencesStep
            key="preferences"
            selectedPlan={userData.selectedPlan || SUBSCRIPTION_PLANS[1]}
            userName={userData.name}
            initialPreferences={userData.selectedPreferences}
            onPreferencesComplete={handlePreferencesComplete}
            onBack={() => setCurrentStep('account')}
          />
        )}

        {currentStep === 'agent-setup' && (
          <AgentSetupStep
            key="agent-setup"
            userName={userData.name}
            selectedPlan={userData.selectedPlan || SUBSCRIPTION_PLANS[1]}
            onComplete={handleAgentSetupComplete}
            onBack={() => setCurrentStep('preferences')}
          />
        )}

        {currentStep === 'reveal' && (
          <DashboardRevealTransition
            key="reveal"
            selectedPlan={userData.selectedPlan || SUBSCRIPTION_PLANS[1]}
            selectedPreferences={userData.selectedPreferences}
            userName={userData.name}
            onBeginReveal={handleBeginReveal}
            onModifyPreferences={() => setCurrentStep('preferences')}
          />
        )}
      </AnimatePresence>

      {/* 400ms Left/Right Split Screen Curtain Reveal */}
      <SplitScreenCurtain
        isSplitting={isSplitting}
        onSplitComplete={handleSplitComplete}
      />
    </div>
  );
};
