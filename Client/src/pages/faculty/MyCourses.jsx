import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppLayout from '../../components/AppLayout';
import StatusBadge from '../../components/StatusBadge';
import {
  Search, Filter, Download, X, Sparkles, ChevronRight,
  AlertTriangle, RefreshCw
} from 'lucide-react';

export const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Semester V');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/faculty/courses');
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const breadcrumbs = [
    { label: 'Academic Operations', path: '/faculty' },
    { label: 'Faculty Workspace', path: '/faculty' },
    { label: 'My Courses', path: '/faculty/courses' }
  ];

  // Filtering
  const filteredCourses = courses.filter(c => {
    const matchesSearch = !searchQuery ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSem = !selectedSemester || selectedSemester === 'All' || c.semester === selectedSemester;

    const matchesStatus = !selectedStatus || selectedStatus === 'All' ||
      c.status.toUpperCase() === selectedStatus.toUpperCase();

    return matchesSearch && matchesSem && matchesStatus;
  });

  const submittedApprovedCount = courses.filter(c => ['APPROVED', 'SUBMITTED'].includes(c.status?.toUpperCase())).length;
  const needsCorrectionCount = courses.filter(c => c.status?.toUpperCase() === 'CORRECTION_REQUIRED').length;

  const handleExportCSV = () => {
    let csv = 'Course Code,Course Title,Semester,Type,Credits,Completion,Status,Role\n';
    courses.forEach(c => {
      csv += `"${c.code}","${c.name}","${c.semester}","${c.course_type}",${c.credits},${c.progress}%,"${c.status}","${c.role_title}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CFMS_Assigned_Courses.csv';
    a.click();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title-row">
            <h1 className="page-title">My Courses</h1>
            <span className="badge badge-neutral" style={{ background: '#f1f5f9', fontWeight: 600 }}>
              Session Active
            </span>
          </div>
          <p className="page-subtitle">
            Manage your assigned academic course files and statutory dossiers
          </p>
        </div>

        <div className="header-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ padding: '0.3rem 0.6rem', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
              Total Assigned: <strong>{courses.length} Courses</strong>
            </span>
            <span style={{ padding: '0.3rem 0.6rem', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
              Submitted / Approved: <strong>{submittedApprovedCount}</strong>
            </span>
            <span style={{ padding: '0.3rem 0.6rem', background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', borderRadius: 'var(--radius-sm)' }}>
              Needs Correction: <strong>{needsCorrectionCount}</strong>
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="search-box" style={{ flex: 1, minWidth: '280px' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by course title or course code (e.g. AI, CS501, Networks)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="input-search-courses"
            />
          </div>

          {/* Semester Dropdown */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '170px' }}
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="All">All Semesters</option>
            <option value="Semester V">Semester V (Active)</option>
            <option value="Semester VI">Semester VI</option>
          </select>

          {/* Status Dropdown */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CORRECTION_REQUIRED">Returned</option>
            <option value="DRAFT">Not Started</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery || selectedSemester !== 'All' || selectedStatus !== 'All') && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedSemester('All');
                setSelectedStatus('All');
              }}
            >
              <X size={14} />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Active Filters Tag & Status Legend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Active filters:</span>
            {selectedSemester !== 'All' && (
              <span className="badge badge-neutral">
                Semester: {selectedSemester}
              </span>
            )}
            <span style={{ color: 'var(--text-muted)' }}>Showing {filteredCourses.length} of {courses.length} records</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></span> Approved</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--info)' }}></span> Submitted</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)' }}></span> In Progress</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }}></span> Returned</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-light)' }}></span> Not Started</span>
          </div>
        </div>
      </div>

      {/* Courses Directory Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>COURSE CODE</th>
                <th>COURSE TITLE</th>
                <th>SEMESTER</th>
                <th>ASSIGNED FACULTY</th>
                <th style={{ width: '220px' }}>COURSE FILE COMPLETION</th>
                <th>CURRENT STATUS</th>
                <th>LAST UPDATED</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading courses directory...
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <div style={{ maxWidth: '360px', margin: '0 auto', textAlign: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--text-muted)' }}>
                        <Search size={24} />
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Courses Found</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        If no course matches the query, reset filter parameters to view the complete catalog.
                      </p>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedSemester('All');
                          setSelectedStatus('All');
                        }}
                      >
                        Reset search parameters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCourses.map(c => {
                  const isReturned = c.status === 'CORRECTION_REQUIRED';
                  const isApproved = c.status === 'APPROVED';
                  const isDraft = c.status === 'DRAFT';

                  return (
                    <tr key={c.faculty_course_id}>
                      {/* Code */}
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '0.2rem 0.45rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                          {c.code}
                        </span>
                      </td>

                      {/* Title & Metadata */}
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>{c.name}</span>
                            {isReturned && (
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)' }}></span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {c.course_type || 'Core Theory'} • {c.credits} Credits • {c.section || 'Sec A'}
                          </div>
                          {isReturned && c.hod_note && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 600, marginTop: '2px' }}>
                              HOD note: {c.hod_note}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Semester */}
                      <td>
                        <div style={{ color: 'var(--text-secondary)' }}>{c.semester}</div>
                      </td>

                      {/* Assigned Faculty */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="user-avatar" style={{ width: 26, height: 26, fontSize: '0.7rem' }}>
                            AT
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Dr. Aris Thorne</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{c.role_title || 'Primary Instructor'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Completion Progress */}
                      <td>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700 }}>{c.progress}%</span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {isApproved ? '14/14 Statutory Complete' : `${Math.round((c.progress / 100) * 14)}/14 Components`}
                            </span>
                          </div>
                          <div className="progress-track">
                            <div
                              className={`progress-fill ${isApproved ? 'green' : isReturned ? 'red' : c.progress >= 60 ? 'orange' : 'indigo'}`}
                              style={{ width: `${c.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Current Status */}
                      <td>
                        <StatusBadge status={c.status} />
                      </td>

                      {/* Last Updated */}
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {c.last_submitted_at ? c.last_submitted_at.substring(0, 10) : 'Oct 26, 2026'}
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {isReturned ? (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => navigate(`/faculty/course/${c.faculty_course_id}`)}
                            id={`btn-review-feedback-${c.code}`}
                          >
                            <span>Review Feedback</span>
                            <ChevronRight size={14} />
                          </button>
                        ) : isDraft ? (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate(`/faculty/course/${c.faculty_course_id}`)}
                            id={`btn-init-file-${c.code}`}
                          >
                            <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                            <span>Initialize File</span>
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate(`/faculty/course/${c.faculty_course_id}`)}
                            id={`btn-open-course-file-${c.code}`}
                          >
                            <span>Open Course File</span>
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', padding: '0 0.5rem' }}>
        <div>
          CFMS Academic ERP • Statutory Audit Compliance Portal • Session AY 2026–27
        </div>
        <div>
          Server Latency: 24ms • Internal Quality Assurance Cell (IQAC)
        </div>
      </div>
    </AppLayout>
  );
};

export default MyCourses;
