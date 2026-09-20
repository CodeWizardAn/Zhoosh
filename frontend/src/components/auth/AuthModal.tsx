import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, LogIn, UserPlus, Lock, Mail, User, Eye, EyeOff,
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/api/client';
import { ZhooshLogo } from '@/components/common/ZhooshLogo';
import { zhooshAudio } from '@/utils/cinematicSound';
import { validateStrictEmail } from '@/utils/security';

// ─────────────────────────────────────────────
// Security constants
// ─────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes
const PASSWORD_MIN_LENGTH = 8;

// ─────────────────────────────────────────────
// Password strength analyser
// ─────────────────────────────────────────────
interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;   // 0 = empty, 1 = weak, 2 = fair, 3 = strong, 4 = very strong
  label: string;
  color: string;
  checks: { label: string; pass: boolean }[];
}

function analysePassword(pw: string): StrengthResult {
  const checks = [
    { label: `At least ${PASSWORD_MIN_LENGTH} characters`, pass: pw.length >= PASSWORD_MIN_LENGTH },
    { label: 'Uppercase letter (A-Z)', pass: /[A-Z]/.test(pw) },
    { label: 'Lowercase letter (a-z)', pass: /[a-z]/.test(pw) },
    { label: 'Number (0-9)', pass: /\d/.test(pw) },
    { label: 'Special character (!@#$…)', pass: /[^A-Za-z0-9]/.test(pw) },
  ];

  const passed = checks.filter((c) => c.pass).length;

  if (pw.length === 0) return { score: 0, label: '', color: 'transparent', checks };
  if (passed <= 1) return { score: 1, label: 'Weak', color: '#FF1E56', checks };
  if (passed === 2) return { score: 2, label: 'Fair', color: '#F97316', checks };
  if (passed === 3 || passed === 4) return { score: 3, label: 'Strong', color: '#22C55E', checks };
  return { score: 4, label: 'Very Strong', color: '#A855F7', checks };
}

// ─────────────────────────────────────────────
// Email validator
// ─────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ─────────────────────────────────────────────
// Rate-limit store (module-level, persists across re-renders)
// ─────────────────────────────────────────────
const _attempts: Record<string, { count: number; lockedAt: number | null }> = {};

function getAttemptInfo(email: string) {
  if (!_attempts[email]) _attempts[email] = { count: 0, lockedAt: null };
  return _attempts[email];
}

function isLockedOut(email: string): boolean {
  const info = getAttemptInfo(email);
  if (!info.lockedAt) return false;
  if (Date.now() - info.lockedAt > LOCKOUT_DURATION_MS) {
    // Lock expired — reset
    info.count = 0;
    info.lockedAt = null;
    return false;
  }
  return true;
}

function recordFailedAttempt(email: string) {
  const info = getAttemptInfo(email);
  info.count += 1;
  if (info.count >= MAX_LOGIN_ATTEMPTS) {
    info.lockedAt = Date.now();
  }
}

function recordSuccess(email: string) {
  _attempts[email] = { count: 0, lockedAt: null };
}

function remainingLockMs(email: string): number {
  const info = getAttemptInfo(email);
  if (!info.lockedAt) return 0;
  return Math.max(0, LOCKOUT_DURATION_MS - (Date.now() - info.lockedAt));
}

// ─────────────────────────────────────────────
// Input field component
// ─────────────────────────────────────────────
interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder: string;
  icon: React.ReactNode;
  error?: string | null;
  success?: boolean;
  rightAddon?: React.ReactNode;
  disabled?: boolean;
  autoComplete?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id, label, type, value, onChange, onBlur, placeholder, icon,
  error, success, rightAddon, disabled, autoComplete
}) => {
  const borderColor = error
    ? 'rgba(239,68,68,0.7)'
    : success
    ? 'rgba(34,197,94,0.5)'
    : 'rgba(255,255,255,0.08)';

  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div
        className="relative flex items-center rounded-xl transition-all duration-200"
        style={{
          background: 'rgba(12,8,22,0.8)',
          border: `1.5px solid ${borderColor}`,
          boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : success ? '0 0 0 3px rgba(34,197,94,0.08)' : 'none',
        }}
      >
        <span className="absolute left-3.5 text-gray-500 shrink-0">{icon}</span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full bg-transparent py-3 pl-10 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none disabled:opacity-40"
        />
        {rightAddon && (
          <span className="absolute right-3 shrink-0">{rightAddon}</span>
        )}
        {!rightAddon && success && (
          <CheckCircle2 className="absolute right-3 w-4 h-4 text-emerald-400 shrink-0" />
        )}
        {!rightAddon && error && (
          <XCircle className="absolute right-3 w-4 h-4 text-red-400 shrink-0" />
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-[11px] text-red-400 mt-1 ml-1 flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
// Password strength bar
// ─────────────────────────────────────────────
const PasswordStrengthBar: React.FC<{ strength: StrengthResult; show: boolean }> = ({ strength, show }) => {
  if (!show || strength.score === 0) return null;
  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="flex-1 rounded-full transition-all duration-300"
            style={{
              background: strength.score >= level ? strength.color : 'rgba(255,255,255,0.1)',
              boxShadow: strength.score >= level ? `0 0 6px ${strength.color}60` : 'none',
            }}
          />
        ))}
      </div>
      {/* Label + checks */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold" style={{ color: strength.color }}>
          {strength.label}
        </span>
        <div className="flex gap-2">
          {strength.checks.map((c) => (
            <span
              key={c.label}
              title={c.label}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${c.pass ? 'bg-emerald-400' : 'bg-white/15'}`}
            />
          ))}
        </div>
      </div>
      {/* Requirement list — only show failing ones */}
      {strength.score < 4 && (
        <ul className="space-y-0.5">
          {strength.checks.filter(c => !c.pass).map((c) => (
            <li key={c.label} className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <XCircle className="w-2.5 h-2.5 text-gray-600 shrink-0" />
              {c.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main AuthModal component
// ─────────────────────────────────────────────
export const AuthModal: React.FC = () => {
  const { isAuthOpen, closeAuth, authMode, openAuth, setUser, mode, addToast } = useAppStore();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validation errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutSec, setLockoutSec] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  // Password strength
  const pwStrength = analysePassword(password);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSec <= 0) return;
    const t = setTimeout(() => setLockoutSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [lockoutSec]);

  // Reset form when switching modes
  useEffect(() => {
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
    setNameError(null); setEmailError(null); setPasswordError(null); setConfirmError(null);
    setShowPassword(false); setShowConfirm(false);
  }, [authMode]);

  // ── Validators ──
  const validateName = useCallback((v: string) => {
    if (v.trim().length < 2) return 'Name must be at least 2 characters';
    if (v.trim().length > 50) return 'Name is too long';
    if (!/^[A-Za-z\s'-]+$/.test(v.trim())) return 'Name can only contain letters, spaces, hyphens, apostrophes';
    return null;
  }, []);

  const validateEmail = useCallback((v: string) => {
    const res = validateStrictEmail(v);
    return res.isValid ? null : res.error;
  }, []);

  const validatePassword = useCallback((v: string) => {
    if (!v) return 'Password is required';
    if (v.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    const s = analysePassword(v);
    if (s.score < 2) return 'Password is too weak — add uppercase, numbers, or symbols';
    return null;
  }, []);

  const validateConfirm = useCallback((v: string, pw: string) => {
    if (!v) return 'Please confirm your password';
    if (v !== pw) return 'Passwords do not match';
    return null;
  }, []);

  // ── Real-time field validation ──
  const handleEmailBlur = () => setEmailError(validateEmail(email));
  const handleNameBlur = () => setNameError(validateName(name));
  const handlePasswordBlur = () => setPasswordError(validatePassword(password));
  const handleConfirmBlur = () => setConfirmError(validateConfirm(confirmPassword, password));

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submitting
    const nameErr = authMode === 'signup' ? validateName(name) : null;
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = authMode === 'signup' ? validateConfirm(confirmPassword, password) : null;

    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passErr);
    setConfirmError(confirmErr);

    if (nameErr || emailErr || passErr || confirmErr) return;

    // Rate limiting check
    if (isLockedOut(email)) {
      const remMs = remainingLockMs(email);
      setLockoutSec(Math.ceil(remMs / 1000));
      addToast({
        title: 'Account temporarily locked',
        description: `Too many failed attempts. Try again in ${Math.ceil(remMs / 1000)}s`,
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        const newUser = await api.signup(name.trim(), email.trim(), password);
        setUser(newUser);
        recordSuccess(email.trim());
        try { zhooshAudio.playSuccessFanfare(); } catch {}
        addToast({ title: `Welcome to Zhoosh, ${newUser.name}!`, description: 'Your account has been created', type: 'success' });
      } else {
        const loggedIn = await api.login(email.trim(), password);
        setUser(loggedIn);
        recordSuccess(email.trim());
        try { zhooshAudio.playSubImpact(); } catch {}
        addToast({ title: `Welcome back, ${loggedIn.name}`, type: 'success' });
      }
      closeAuth();
    } catch (err: any) {
      recordFailedAttempt(email.trim());
      const info = getAttemptInfo(email.trim());
      setAttemptCount(info.count);

      if (isLockedOut(email.trim())) {
        setLockoutSec(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        addToast({ title: 'Account temporarily locked', description: 'Too many failed attempts. Try again in 2 minutes.', type: 'error' });
      } else {
        const remaining = MAX_LOGIN_ATTEMPTS - info.count;
        const msg = err?.message || 'Incorrect email or password';
        setPasswordError(msg);
        if (authMode === 'login' && remaining <= 2 && remaining > 0) {
          addToast({ title: `${remaining} attempt${remaining === 1 ? '' : 's'} remaining`, description: 'Account will be locked after too many failures', type: 'error' });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthOpen) return null;

  const isLocked = lockoutSec > 0;
  const canSubmit = !isLoading && !isLocked;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="auth-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuth}
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl"
      />

      {/* Modal */}
      <motion.div
        key="auth-modal"
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="relative w-full max-w-md rounded-3xl overflow-hidden pointer-events-auto"
          style={{
            background: 'linear-gradient(160deg, #0D0918 0%, #06040F 100%)',
            border: '1px solid rgba(157,78,221,0.2)',
            boxShadow: '0 0 0 1px rgba(255,30,86,0.06), 0 32px 80px rgba(0,0,0,0.9), 0 0 40px rgba(157,78,221,0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient aura blobs */}
          <div
            className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: mode === 'movies' ? '#FF1E56' : '#A855F7', transform: 'translate(30%, -30%)' }}
          />
          <div
            className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ background: '#FF1E56' }}
          />

          <div className="relative z-10 p-6 sm:p-8">
            {/* Close */}
            <button
              onClick={closeAuth}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/8 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-3">
                <ZhooshLogo size="sm" showWordmark={true} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-[260px] leading-relaxed">
                {authMode === 'login'
                  ? 'Sign in to continue your Zhoosh experience'
                  : 'Join the streaming universe — cinema & music unified'}
              </p>
            </div>

            {/* Tab switcher */}
            <div
              className="flex p-1 rounded-xl mb-6 relative"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { try { zhooshAudio.playSubImpact(); } catch {} openAuth(m); }}
                  className={`relative flex-1 py-2 rounded-lg text-xs font-bold transition-colors z-10 ${authMode === m ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                  {authMode === m && (
                    <motion.div
                      layoutId="authTabPill"
                      className="absolute inset-0 rounded-lg -z-10"
                      style={{ background: 'linear-gradient(135deg, #FF1E56, #A855F7)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Lockout banner */}
            <AnimatePresence>
              {isLocked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
                  >
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-red-300">Account Temporarily Locked</p>
                      <p className="text-[11px] text-red-400/70">
                        Try again in <span className="font-mono font-bold">{lockoutSec}s</span> after too many failed attempts.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Attempt warning */}
            <AnimatePresence>
              {!isLocked && attemptCount > 0 && attemptCount < MAX_LOGIN_ATTEMPTS && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)' }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <p className="text-[11px] text-orange-300">
                      {MAX_LOGIN_ATTEMPTS - attemptCount} attempt{MAX_LOGIN_ATTEMPTS - attemptCount === 1 ? '' : 's'} remaining before lockout
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {authMode === 'signup' && (
                <InputField
                  id="auth-name"
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(v) => { setName(v); if (nameError) setNameError(null); }}
                  onBlur={handleNameBlur}
                  placeholder="Alex Mercer"
                  icon={<User className="w-4 h-4" />}
                  error={nameError}
                  success={!nameError && name.length >= 2}
                  disabled={!canSubmit}
                  autoComplete="name"
                />
              )}

              <InputField
                id="auth-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(v) => { setEmail(v); if (emailError) setEmailError(null); }}
                onBlur={handleEmailBlur}
                placeholder="alex@zhoosh.stream"
                icon={<Mail className="w-4 h-4" />}
                error={emailError}
                success={!emailError && EMAIL_REGEX.test(email)}
                disabled={!canSubmit}
                autoComplete={authMode === 'login' ? 'email' : 'off'}
              />

              <div>
                <InputField
                  id="auth-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(v) => { setPassword(v); if (passwordError) setPasswordError(null); }}
                  onBlur={handlePasswordBlur}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  error={passwordError}
                  success={!passwordError && password.length >= PASSWORD_MIN_LENGTH && pwStrength.score >= 2}
                  disabled={!canSubmit}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  rightAddon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                {authMode === 'signup' && (
                  <PasswordStrengthBar strength={pwStrength} show={password.length > 0} />
                )}
              </div>

              {authMode === 'signup' && (
                <InputField
                  id="auth-confirm"
                  label="Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(v) => { setConfirmPassword(v); if (confirmError) setConfirmError(null); }}
                  onBlur={handleConfirmBlur}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  error={confirmError}
                  success={!confirmError && confirmPassword.length > 0 && confirmPassword === password}
                  disabled={!canSubmit}
                  autoComplete="new-password"
                  rightAddon={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              )}

              {/* Security badge for signup */}
              {authMode === 'signup' && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <p className="text-[10px] text-emerald-400/80 leading-relaxed">
                    Your credentials are encrypted end-to-end. We never store plaintext passwords.
                  </p>
                </div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={canSubmit ? { scale: 1.01 } : {}}
                whileTap={canSubmit ? { scale: 0.99 } : {}}
                className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white transition-all flex items-center justify-center gap-2 mt-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: canSubmit
                    ? 'linear-gradient(135deg, #FF1E56 0%, #C026D3 50%, #A855F7 100%)'
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: canSubmit ? '0 0 30px rgba(255,30,86,0.3), 0 8px 20px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Authenticating…</span>
                  </>
                ) : isLocked ? (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Locked — {lockoutSec}s</span>
                  </>
                ) : authMode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Zhoosh</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Secure Account</span>
                  </>
                )}
              </motion.button>

              {/* Footer note */}
              {authMode === 'signup' && (
                <p className="text-center text-[10px] text-gray-600 leading-relaxed mt-1">
                  By creating an account you agree to our{' '}
                  <span className="text-[#A855F7]/70 hover:text-[#A855F7] cursor-pointer transition-colors">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-[#A855F7]/70 hover:text-[#A855F7] cursor-pointer transition-colors">Privacy Policy</span>
                </p>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
