import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AppLayout from '../../components/AppLayout';
import StatusBadge from '../../components/StatusBadge';
import {
  Download, Plus, Filter, Clock, CheckCircle2,
  AlertTriangle, UploadCloud, RefreshCw, ArrowRight, BookOpen
} from 'lucide-react';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/faculty/dashboard');
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const breadcrumbs = [
    { label: 'Academic Operations', path: '/faculty' },
    { label: 'Faculty Workspace', path: '/faculty' },
    { label: 'Faculty Dashboard', path: '/faculty' }
  ];

  const courses = dashboardData?.courses || [];
  const metrics = dashboardData?.metrics || { assignedCourses: 4, inProgress: 2, awaitingReview: 1, approved: 1 };
  const pendingTasks = dashboardData?.pendingTasks || [];
  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title-row">
            <h1 className="page-title">Faculty Dashboard</h1>
            <span className="badge badge-neutral" style={{ background: '#f1f5f9', fontWeight: 600 }}>
              Session Active
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-outline"
            onClick={() => alert('Academic Summary Manifest exported.')}
            id="btn-export-summary"
          >
            <Download size={16} />
            <span>Export Academic Summary</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/faculty/courses')}
            id="btn-prepare-course"
          >
            <Plus size={16} />
            <span>+ Prepare New Course File</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="metrics-grid">
        {/* Card 1: Assigned Courses */}
        <div className="metric-card purple">
          <div className="metric-header">
            <span className="metric-label">ASSIGNED COURSES</span>
            <span className="metric-dot" style={{ backgroundColor: 'var(--purple)' }}></span>
          </div>
          <div className="metric-val-row">
            <span className="metric-val">{metrics.assignedCourses || 4}</span>
            <span className="metric-unit">Portfolio Files</span>
          </div>
          <div className="metric-desc">3 Theory, 1 Practical Lab</div>
        </div>

        {/* Card 2: In Progress */}
        <div className="metric-card orange">
          <div className="metric-header">
            <span className="metric-label">IN PROGRESS</span>
            <span className="metric-dot" style={{ backgroundColor: 'var(--warning)' }}></span>
          </div>
          <div className="metric-val-row">
            <span className="metric-val">{metrics.inProgress || 2}</span>
            <span className="metric-unit">Active Dossiers</span>
          </div>
          <div className="metric-desc">Dossiers actively updating</div>
        </div>

        {/* Card 3: Awaiting Review */}
        <div className="metric-card blue">
          <div className="metric-header">
            <span className="metric-label">AWAITING REVIEW</span>
            <span className="metric-dot" style={{ backgroundColor: 'var(--info)' }}></span>
          </div>
          <div className="metric-val-row">
            <span className="metric-val">{metrics.awaitingReview || 1}</span>
            <span className="metric-unit">In HOD Queue</span>
          </div>
          <div className="metric-desc">Submitted to HOD, pending sign-off</div>
        </div>

        {/* Card 4: Approved */}
        <div className="metric-card green">
          <div className="metric-header">
            <span className="metric-label">APPROVED</span>
            <span className="metric-dot" style={{ backgroundColor: 'var(--success)' }}></span>
          </div>
          <div className="metric-val-row">
            <span className="metric-val">{metrics.approved || 1}</span>
            <span className="metric-unit">Audited</span>
          </div>
          <div className="metric-desc">Finalized for Statutory Audit</div>
        </div>
      </div>

      {/* My Courses Table Panel */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">My Courses</h3>
            <p className="card-subtitle">Current semester portfolio progress and review statuses</p>
          </div>
          <button className="btn btn-outline btn-sm">
            <Filter size={14} />
            <span>Filter: Active AY</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>COURSE CODE</th>
                <th>COURSE TITLE</th>
                <th>SEMESTER / SECTION</th>
                <th style={{ width: '220px' }}>PORTFOLIO COMPLETION</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading assigned courses...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No assigned courses found.
                  </td>
                </tr>
              ) : (
                courses.slice(0, 5).map(c => (
                  <tr key={c.faculty_course_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{c.code}</span>
                        <span className={`badge ${c.course_type === 'Laboratory' ? 'badge-purple' : 'badge-indigo'}`} style={{ fontSize: '0.65rem' }}>
                          {c.course_type || 'Core Theory'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-secondary)' }}>{c.semester} ({c.section || 'Sec A'})</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="progress-track" style={{ flex: 1 }}>
                          <div
                            className={`progress-fill ${c.progress >= 90 ? 'green' : c.progress >= 60 ? 'indigo' : 'orange'}`}
                            style={{ width: `${c.progress}%` }}
                          ></div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', minWidth: '35px' }}>{c.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate(`/faculty/course/${c.faculty_course_id}`)}
                        id={`btn-open-course-${c.code}`}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Bottom Grid: Pending Tasks & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Pending Tasks */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 className="card-title">Pending Tasks</h3>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                {pendingTasks.length} actionable items
              </span>
            </div>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/faculty/courses'); }}
              style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              View All Tasks
            </a>
          </div>

          <div className="card-body" style={{ padding: '0.75rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingTasks.map(t => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: t.priority === 'High' ? 'var(--danger)' : t.priority === 'Medium' ? 'var(--warning)' : 'var(--text-light)',
                        marginTop: '6px',
                        flexShrink: 0
                      }}
                    ></span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <strong>{t.course_code}</strong> • Due: {t.due_date} • <span style={{ color: t.priority === 'High' ? 'var(--danger)' : 'inherit', fontWeight: t.priority === 'High' ? 600 : 400 }}>{t.priority} Priority</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      if (t.action_path) navigate(t.action_path);
                      else navigate('/faculty/courses');
                    }}
                    style={{ flexShrink: 0 }}
                  >
                    {t.action_label || 'Action'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Activity</h3>
              <p className="card-subtitle">Audited submissions &amp; reviewer remarks</p>
            </div>
            <Clock size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

          <div className="card-body" style={{ padding: '0.75rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--info-bg)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UploadCloud size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Submitted revised Lesson Plan &amp; Delivery Schedule for Unit 3</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CS501 • 2 hours ago • Dr. Aris Thorne</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>HOD Dr. R. Kulkarni approved CIA-I Assessment Rubrics &amp; Sample Papers</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CS508 Lab • Yesterday at 4:15 PM</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400e' }}>Returned for correction: Please update CIA-II marks bell curve analysis</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CS702 • 2 days ago • Prof. M. Vance</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <RefreshCw size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Automated SIS attendance sync finalized (Week 8 cycle)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>All courses • 3 days ago</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', textAlign: 'right' }}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/faculty/course/4'); }}
                style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span>View full audit compliance trail</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FacultyDashboard;
