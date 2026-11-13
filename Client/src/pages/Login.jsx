import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, AlertTriangle, Eye, EyeOff,
  ArrowRight, ShieldCheck, HelpCircle, UserPlus, LogIn, CheckCircle2,
  Building, User, Mail
} from 'lucide-react';

const roleCatalog = [
  {
    designation: 'Faculty',
    email: 'faculty.a@cfms.edu',
    icon: GraduationCap,
    roleKey: 'FACULTY',
    tagline: 'Academic Portfolio & Attainment',
    description: 'Prepare syllabus compliance, 45-lecture plans, CIA internal assessments, and direct CO-PO attainment computation.'
  },
  {
    designation: 'Main Administrator',
    email: 'admin@cfms.edu',
    icon: ShieldCheck,
    roleKey: 'ADMIN',
    tagline: 'Institutional Governance',
    description: 'Manage the institution and open Reviewer or HOD workspaces.'
  },
  {
    designation: 'Student',
    email: 'rahul.sharma@bmu.edu.in',
    icon: User,
    roleKey: 'STUDENT',
    tagline: 'Enrolled Course Files',
    description: 'View course files and receive notifications when faculty publish new materials.'
  }
];

const departments = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Basic Sciences & Humanities'
];

export const Login = () => {
  const { login, register, requestAdminAccount } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // The role selected for sign-in or self-service registration.
  const [selectedRole, setSelectedRole] = useState('Faculty');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Feedback & async state
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle selecting a role button (in either mode)
  const handleRoleSelection = (roleItem) => {
    setSelectedRole(roleItem.designation);
    setError(null);
    setSuccessMessage(null);

    if (mode === 'login') {
      const isDemoOrEmpty = !email || roleCatalog.some(r => r.email.toLowerCase() === email.toLowerCase());
      if (isDemoOrEmpty) {
        setEmail(roleItem.email);
        setPassword('password123');
      }
      // If user already typed their own personal email/password, preserve them so they are not wiped!
    }
  };

  // Sign In submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const loginRole = selectedRole === 'Main Administrator' ? 'ADMIN' : selectedRole;
      await login(email.trim(), password, loginRole);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Create Account submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (selectedRole === 'Student' && !/^[a-z0-9]+(?:\.[a-z0-9]+)+@bmu\.edu\.in$/.test(cleanEmail)) {
      setError('Use your BMU email in the format studentname.lastname@bmu.edu.in.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify both passwords.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const accountData = {
        name: cleanName,
        email: cleanEmail,
        password: regPassword,
        department: regDepartment,
      };

      if (selectedRole === 'Main Administrator') {
        const request = await requestAdminAccount(accountData);
        setSuccessMessage(request.message);
      } else {
        await register({ ...accountData, role: selectedRole });
        setSuccessMessage(
          `Account created successfully for ${regName}! Redirecting to your ${selectedRole} workspace...`
        );
      }
    } catch (err) {
      setError(err.message || 'Account creation failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Switch to register mode with target role
  const switchToRegisterWithRole = (designation) => {
    if (!['Faculty', 'Student', 'Main Administrator'].includes(designation)) {
      setError('Reviewer and HOD are profiles inside the Main Administrator dashboard.');
      setSuccessMessage(null);
      return;
    }

    setSelectedRole(designation);
    setMode('register');
    setError(null);
    setSuccessMessage(null);
    if (!regEmail && email && !email.includes('@cfms.edu')) {
      setRegEmail(email);
    }
  };

  return (
    <div className="auth-page">
      {/* Top Academic Governance Banner */}
      <header className="auth-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
            <div className="brand-icon-box" style={{ width: '30px', height: '30px' }}>
              <GraduationCap size={18} />
            </div>
            <span style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>CFMS Portal</span>
          </div>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Academic Operations • AY 2026–27</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <span className="status-dot"></span>
            <span style={{ fontWeight: 500 }}>Academic Governance Gateway Active</span>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert('Directives & Assistance:\n• Course File Management Portal for statutory compliance.\n• Compliant with NBA Tier-I & NAAC Criterion 2.6 guidelines.\n• For support, contact: support.cfms@university.edu');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}
          >
            <HelpCircle size={15} />
            <span>Portal Help & Directives</span>
          </a>
        </div>
      </header>

      {/* Main Layout */}
      <main className="auth-body">
        <div className="auth-right" style={{ flex: 'none', width: '100%', maxWidth: '490px' }}>
          <div className="auth-card-wrapper">
            {/* Logo and Wordmark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <div className="brand-icon-box" style={{ width: '36px', height: '36px' }}>
                <GraduationCap size={20} />
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                CFMS Portal
              </span>
            </div>

            <p className="auth-card-subtitle">
              {mode === 'login'
                ? 'Sign in with your institutional account. The Main Administrator can open Reviewer and HOD workspaces.'
                : `Create your new institutional ID as ${selectedRole}.`}
            </p>

            {/* Mode Switcher Tabs: Sign In / Create Account */}
            <div className="auth-mode-tabs" role="tablist">
              <button
                type="button"
                className={`auth-mode-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                role="tab"
                aria-selected={mode === 'login'}
                id="tab-sign-in"
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`auth-mode-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setMode('register');
                  if (!['Faculty', 'Student', 'Main Administrator'].includes(selectedRole)) {
                    setSelectedRole('Faculty');
                  }
                  setError(null);
                  setSuccessMessage(null);
                }}
                role="tab"
                aria-selected={mode === 'register'}
                id="tab-create-account"
              >
                <UserPlus size={15} />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="alert-banner danger" style={{ marginBottom: '1.25rem' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="alert-banner success" style={{ marginBottom: '1.25rem', background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0, color: 'var(--success)' }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ----------------- MODE 1: SIGN IN FORM ----------------- */}
            {mode === 'login' && (
              <>
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email-input">
                      Institutional Email (Login ID)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="email-input"
                        type="email"
                        className="form-input"
                        placeholder="name@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        style={{ paddingLeft: '2.4rem' }}
                      />
                      <Mail
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-light)'
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" htmlFor="password-input">
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password-input"
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          left: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-light)',
                          display: 'flex'
                        }}
                      >
                        *
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-light)',
                          cursor: 'pointer'
                        }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                    disabled={loading}
                    id="btn-sign-in"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to CFMS'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>

                {/* Role Selector Grid */}
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                    Select Role:
                  </div>

                  <div className="demo-role-grid">
                    {roleCatalog.map(({ designation, icon: Icon }) => (
                      <button
                        key={designation}
                        type="button"
                        className={`demo-role-button${selectedRole === designation ? ' selected' : ''}`}
                        onClick={() => handleRoleSelection({ designation })}
                        aria-pressed={selectedRole === designation}
                        disabled={loading}
                        id={`role-btn-${designation.toLowerCase()}`}
                      >
                        <Icon size={16} aria-hidden="true" />
                        <span>{designation}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: '0.85rem' }}>
                    {['Faculty', 'Student', 'Main Administrator'].includes(selectedRole) ? (
                      <button
                        type="button"
                        className="btn-create-role-account"
                        onClick={() => switchToRegisterWithRole(selectedRole)}
                        id="btn-switch-to-create-account"
                      >
                        <UserPlus size={15} />
                        <span>Create New {selectedRole} Account</span>
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-create-role-account"
                        onClick={() => switchToRegisterWithRole('Main Administrator')}
                        id="btn-switch-to-create-account"
                      >
                        <UserPlus size={15} />
                        <span>Create New Main Administrator Account</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ----------------- MODE 2: CREATE ACCOUNT FORM ----------------- */}
            {mode === 'register' && (
              <>
                {/* Role Switcher in Registration Mode */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Registering Account For:
                  </div>
                  <div className="demo-role-grid" style={{ marginBottom: '0.75rem' }}>
                    {roleCatalog.map(({ designation, icon: Icon }) => (
                      <button
                        key={designation}
                        type="button"
                        className={`demo-role-button${selectedRole === designation ? ' selected' : ''}`}
                        onClick={() => handleRoleSelection({ designation })}
                        aria-pressed={selectedRole === designation}
                        disabled={loading}
                        id={`reg-role-btn-${designation.toLowerCase()}`}
                      >
                        <Icon size={16} aria-hidden="true" />
                        <span>{designation}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <form onSubmit={handleRegisterSubmit}>
                  {selectedRole === 'Main Administrator' && (
                    <div className="notice-banner" role="note" style={{ marginBottom: '1rem' }}>
                      Administrator account requests must be approved by an existing Main Administrator. You can sign in to the Administration dashboard after approval.
                    </div>
                  )}
                  {/* Full Name */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-name-input">
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="reg-name-input"
                        type="text"
                        className="form-input"
                        placeholder=""
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        disabled={loading}
                        style={{ paddingLeft: '2.4rem' }}
                      />
                      <User
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-light)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Institutional Email */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-email-input">
                      Institutional Email (Login ID)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="reg-email-input"
                        type="email"
                        className="form-input"
                        placeholder={selectedRole === 'Student' ? 'studentname.lastname@bmu.edu.in' : 'name@university.edu'}
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        disabled={loading}
                        style={{ paddingLeft: '2.4rem' }}
                      />
                      <Mail
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-light)'
                        }}
                      />
                    </div>
                  </div>

                  {selectedRole === 'Faculty' && (
                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-dept-select">
                        Academic Department
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          id="reg-dept-select"
                          className="form-input"
                          value={regDepartment}
                          onChange={(e) => setRegDepartment(e.target.value)}
                          disabled={loading}
                          style={{ paddingLeft: '2.4rem', appearance: 'auto' }}
                        >
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        <Building
                          size={16}
                          style={{
                            position: 'absolute',
                            left: '0.85rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-light)',
                            pointerEvents: 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password & Confirm Password */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="reg-password-input">
                        Password (min 6 chars)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="reg-password-input"
                          type={showRegPassword ? 'text' : 'password'}
                          className="form-input"
                          placeholder=""
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          minLength={6}
                          disabled={loading}
                          style={{ paddingRight: '2.3rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          style={{
                            position: 'absolute',
                            right: '0.65rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-light)',
                            cursor: 'pointer'
                          }}
                        >
                          {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="reg-confirm-password-input">
                        Confirm Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="reg-confirm-password-input"
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          className="form-input"
                          placeholder=""
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          disabled={loading}
                          style={{ paddingRight: '2.3rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '0.65rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-light)',
                            cursor: 'pointer'
                          }}
                        >
                          {showRegConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password match indicator */}
                  {regPassword && regConfirmPassword && (
                    <div style={{ marginBottom: '1rem', marginTop: '-0.75rem' }}>
                      {regPassword === regConfirmPassword ? (
                        <div className="password-match-hint match">
                          <CheckCircle2 size={13} />
                          <span>Passwords match</span>
                        </div>
                      ) : (
                        <div className="password-match-hint no-match">
                          <AlertTriangle size={13} />
                          <span>Passwords do not match</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                    disabled={loading}
                    id="btn-register-submit"
                  >
                    <UserPlus size={16} />
                    <span>
                      {loading ? 'Creating Account...' : `Create ${selectedRole} Account & Sign In`}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </form>

                {/* Back to Sign In Link */}
                <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Already have an institutional ID? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessMessage(null);
                      if (regEmail) setEmail(regEmail);
                      if (regPassword) setPassword(regPassword);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                    id="btn-back-to-signin"
                  >
                    Sign In to CFMS
                  </button>
                </div>
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
              For authorized institutional faculty, students, and administrators only
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;