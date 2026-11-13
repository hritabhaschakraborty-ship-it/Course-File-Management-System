import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck,
  Eye, KeyRound, LayoutDashboard, Plus, RefreshCw, ShieldCheck, Users
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const initialAccount = {
  name: '',
  email: '',
  password: '',
  role: 'FACULTY'
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, switchWorkspace } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [account, setAccount] = useState(initialAccount);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    setErrorMsg('');
    try {
      const [users, requests] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/account-requests')
      ]);
      setAccounts(users);
      setAccountRequests(requests);
    } catch (error) {
      setErrorMsg(error.message || 'Unable to load account details.');
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const openWorkspace = async (role) => {
    setErrorMsg('');
    setSuccessMsg('');
    setWorkspaceLoading(role);
    try {
      await switchWorkspace(role);
      navigate(role === 'HOD' ? '/hod' : '/reviewer', { replace: true });
    } catch (error) {
      setErrorMsg(error.message || `Unable to open the ${role} workspace.`);
    } finally {
      setWorkspaceLoading(null);
    }
  };

  const createAccount = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setCreatingAccount(true);

    try {
      await api.post('/api/admin/users', account);
      const accountType = account.role === 'ADMIN' ? 'Main Administrator' : 'Faculty';
      setSuccessMsg(`${accountType} account created for ${account.name}. They can now sign in with these credentials.`);
      setAccount(initialAccount);
      await loadAccounts();
    } catch (error) {
      setErrorMsg(error.message || 'Unable to create the account.');
    } finally {
      setCreatingAccount(false);
    }
  };

  const reviewAccountRequest = async (requestId, decision) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const result = await api.post(`/api/admin/account-requests/${requestId}/${decision}`, {});
      setSuccessMsg(result.message);
      await loadAccounts();
    } catch (error) {
      setErrorMsg(error.message || `Unable to ${decision} the account request.`);
    }
  };

  const administrators = accounts.filter((item) => item.role === 'ADMIN').length;
  const faculty = accounts.filter((item) => item.role === 'FACULTY').length;

  return (
    <AppLayout breadcrumbs={[{ label: 'Main Administrator' }, { label: 'Dashboard' }]}>
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          color: '#fff',
          background: 'linear-gradient(125deg, #312e81, #4338ca 58%, #6366f1)'
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', opacity: 0.8 }}>
            MAIN ADMINISTRATOR
          </div>
          <h1 style={{ margin: '0.35rem 0', fontSize: '1.65rem' }}>Administration Dashboard</h1>
          <p style={{ margin: 0, opacity: 0.88 }}>
            Welcome, {user?.name || 'Administrator'}. Manage accounts and open your workspaces from here.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.12)' }}>
          <ShieldCheck size={19} />
          <div>
            <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>Signed in as</div>
            <div style={{ fontWeight: 600 }}>{user?.email}</div>
          </div>
        </div>
      </section>

      {errorMsg && (
        <div className="notice-banner" role="alert" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#b91c1c', marginBottom: '1rem' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="notice-banner" role="status" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#15803d', marginBottom: '1rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <section className="content-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Administrator account requests</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
              Approve requests to allow the applicant to sign in to the Administration dashboard.
            </p>
          </div>
          <span style={{ borderRadius: 'var(--radius-full)', padding: '0.2rem 0.65rem', background: 'var(--primary-light)', color: 'var(--primary-text)', fontWeight: 700, fontSize: '0.8rem' }}>
            {accountRequests.length} pending
          </span>
        </div>
        {accountRequests.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No administrator account requests are waiting for approval.</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.65rem' }}>
            {accountRequests.map((request) => (
              <div key={request.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', padding: '0.8rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <strong style={{ display: 'block' }}>{request.name}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.83rem' }}>{request.email}</span>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Requested {new Date(`${request.requested_at.replace(' ', 'T')}Z`).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => reviewAccountRequest(request.id, 'approve')}>
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => reviewAccountRequest(request.id, 'reject')}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '0.85rem' }}>
          <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Your profiles</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Reviewer and HOD use this administrator account. No separate sign-in is needed.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <button
            type="button"
            className="content-card"
            onClick={() => openWorkspace('REVIEWER')}
            disabled={workspaceLoading !== null}
            style={{ padding: '1.25rem', textAlign: 'left', color: 'inherit', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 'var(--radius-md)', color: 'var(--primary)', background: 'var(--primary-light)' }}>
                <Eye size={21} />
              </span>
              <div>
                <strong style={{ display: 'block' }}>Reviewer Profile</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Review course files and compliance submissions.</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
              {workspaceLoading === 'REVIEWER' ? 'Opening profile...' : 'Open Reviewer workspace'}
              <ArrowRight size={16} />
            </div>
          </button>

          <button
            type="button"
            className="content-card"
            onClick={() => openWorkspace('HOD')}
            disabled={workspaceLoading !== null}
            style={{ padding: '1.25rem', textAlign: 'left', color: 'inherit', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 'var(--radius-md)', color: '#6d28d9', background: '#f5f3ff' }}>
                <ClipboardCheck size={21} />
              </span>
              <div>
                <strong style={{ display: 'block' }}>HOD Profile</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Audit department files and manage approvals.</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
              {workspaceLoading === 'HOD' ? 'Opening profile...' : 'Open HOD workspace'}
              <ArrowRight size={16} />
            </div>
          </button>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', alignItems: 'start' }}>
        <section className="content-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--primary)' }}><Users size={19} /></span>
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Create an account</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0 0 1rem' }}>
            Create a Faculty or Main Administrator account. Share the login email and password with the new account holder.
          </p>
          <form onSubmit={createAccount}>
            <div style={{ marginBottom: '0.8rem' }}>
              <label className="form-label" htmlFor="admin-create-name">Full name</label>
              <input
                id="admin-create-name"
                type="text"
                className="form-control"
                value={account.name}
                onChange={(event) => setAccount({ ...account, name: event.target.value })}
                autoComplete="name"
                required
                disabled={creatingAccount}
              />
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <label className="form-label" htmlFor="admin-create-email">Login email</label>
              <input
                id="admin-create-email"
                type="email"
                className="form-control"
                value={account.email}
                onChange={(event) => setAccount({ ...account, email: event.target.value })}
                autoComplete="email"
                required
                disabled={creatingAccount}
              />
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <label className="form-label" htmlFor="admin-create-role">Account type</label>
              <select
                id="admin-create-role"
                className="form-control"
                value={account.role}
                onChange={(event) => setAccount({ ...account, role: event.target.value })}
                disabled={creatingAccount}
              >
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Main Administrator</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="admin-create-password">Temporary password</label>
              <input
                id="admin-create-password"
                type="password"
                className="form-control"
                value={account.password}
                onChange={(event) => setAccount({ ...account, password: event.target.value })}
                autoComplete="new-password"
                minLength={6}
                required
                disabled={creatingAccount}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={creatingAccount}>
              <Plus size={16} />
              <span>{creatingAccount ? 'Creating account...' : 'Create account'}</span>
            </button>
          </form>
        </section>

        <section className="content-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ color: 'var(--primary)' }}><LayoutDashboard size={19} /></span>
              <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Account overview</h2>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={loadAccounts} disabled={loadingAccounts}>
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Main Administrators</div>
              <strong style={{ fontSize: '1.35rem' }}>{loadingAccounts ? '—' : administrators}</strong>
            </div>
            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Faculty accounts</div>
              <strong style={{ fontSize: '1.35rem' }}>{loadingAccounts ? '—' : faculty}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary-text)', fontSize: '0.83rem' }}>
            <KeyRound size={17} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Sign in from the login page with the email and password assigned to your Main Administrator account. Successful login opens this dashboard automatically.</span>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

export default AdminDashboard;
