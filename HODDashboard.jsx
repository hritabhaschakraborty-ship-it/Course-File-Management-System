import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Building2, CheckCircle, ClipboardCheck, Clock3, RefreshCw } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';

function HODDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.get('/api/reviewer/dashboard');
      setCourses(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load department audit data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const submittedCount = courses.filter(course => course.status === 'SUBMITTED').length;
  const inProgressCount = courses.filter(course => course.status === 'UNDER_REVIEW').length;
  const approvedCount = courses.filter(course => course.status === 'APPROVED').length;

  return (
    <AppLayout breadcrumbs={[{ label: 'Department Audit' }, { label: 'HOD Dashboard' }]}>
      <div className="page-header-container">
        <div className="page-header-left">
          <div className="page-tag">DEPARTMENTAL ACADEMIC GOVERNANCE</div>
          <h1 className="page-title">HOD Department Overview</h1>
          <p className="page-subtitle">
            Monitor departmental course-file compliance and open submissions for statutory audit and approval.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={fetchDashboardData}>
            <RefreshCw size={15} />
            <span>Refresh Department Data</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="notice-banner" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#b91c1c', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      <div className="stats-row" style={{ marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Department Course Files</span>
            <Building2 size={16} className="metric-icon" style={{ color: 'var(--primary-color)' }} />
          </div>
          <div className="metric-value">{loading ? '—' : courses.length}</div>
          <div className="metric-subtitle">Files in your audit scope</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Awaiting HOD Review</span>
            <ClipboardCheck size={16} className="metric-icon" style={{ color: 'var(--warning)' }} />
          </div>
          <div className="metric-value">{loading ? '—' : submittedCount}</div>
          <div className="metric-subtitle">Submitted for approval</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Under Audit</span>
            <Clock3 size={16} className="metric-icon" style={{ color: 'var(--primary-color)' }} />
          </div>
          <div className="metric-value">{loading ? '—' : inProgressCount}</div>
          <div className="metric-subtitle">Currently in review</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Approved Files</span>
            <CheckCircle size={16} className="metric-icon" style={{ color: 'var(--success)' }} />
          </div>
          <div className="metric-value">{loading ? '—' : approvedCount}</div>
          <div className="metric-subtitle">Audit sign-off complete</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header" style={{ padding: '1rem 1.25rem' }}>
          <div>
            <h3 className="card-title">Department Audit Queue</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Review submission status, faculty ownership, and course-file readiness.
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" id="hod-audit-queue">
            <thead>
              <tr>
                <th>Course</th>
                <th>Faculty In Charge</th>
                <th>Semester</th>
                <th>Readiness</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading department audit queue...</td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No course files are currently assigned to your audit scope.</td>
                </tr>
              ) : courses.map(course => {
                const totalItems = course.total_items || 0;
                const readiness = totalItems
                  ? Math.round(((course.verified_items || 0) / totalItems) * 100)
                  : 0;

                return (
                  <tr key={course.faculty_course_id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{course.code}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{course.name}</div>
                    </td>
                    <td>{course.faculty_name}</td>
                    <td>{course.semester}</td>
                    <td>{readiness}%</td>
                    <td><StatusBadge status={course.status} /></td>
                    <td>{course.last_submitted_at ? course.last_submitted_at.split(' ')[0] : '—'}</td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate(`/hod/review/${course.faculty_course_id}`)}
                        aria-label={`Review ${course.code}`}
                      >
                        <span>Review file</span>
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

export default HODDashboard;
