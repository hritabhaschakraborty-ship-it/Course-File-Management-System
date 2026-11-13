import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AppLayout from '../../components/AppLayout';
import StatusBadge from '../../components/StatusBadge';
import {
  CheckCircle, AlertTriangle, MessageSquare, Clock, ShieldAlert,
  ArrowRight, RefreshCw, FileText, ExternalLink
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

function ReviewerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isHod = user?.role === 'HOD';
  
  // Dash data
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  
  // Review specific states
  const [comments, setComments] = useState('');
  const [reviewHistory, setReviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const totalItems = selectedCourse?.courseInfo?.total_items ?? 0;
  const verifiedItems = selectedCourse?.courseInfo?.verified_items ?? 0;
  const readiness = totalItems > 0
    ? Math.round((verifiedItems / totalItems) * 100)
    : 0;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.get('/api/reviewer/dashboard');
      setCourses(data);
      const requestedCourseId = Number(id);
      const requestedCourse = data.find(course => Number(course.faculty_course_id) === requestedCourseId);
      if (requestedCourse) {
        handleSelectCourse(requestedCourse.faculty_course_id);
      } else if (data.length > 0 && !selectedCourseId && !id) {
        handleSelectCourse(data[0].faculty_course_id);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load assigned courses for review.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (fcId) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setComments('');
    setSelectedCourseId(fcId);
    try {
      const details = await api.get(`/api/reviewer/course/${fcId}`);
      setSelectedCourse(details);
      
      const history = await api.get(`/api/reviewer/review-history/${fcId}`);
      setReviewHistory(history);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to fetch course file details.');
    }
  };

  const handleReviewSubmit = async (status) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.post(`/api/reviewer/review/${selectedCourseId}`, { status, comments });
      setSuccessMsg(`Course documentation marked as ${status} successfully.`);
      
      // Refresh current selection
      handleSelectCourse(selectedCourseId);
      // Refresh main dashboard counts
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to submit review decision.');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AppLayout breadcrumbs={[{ label: isHod ? 'Department Audit' : 'Institutional Compliance' }, { label: isHod ? 'HOD Dashboard' : 'Review Console' }]}>
      <div className="page-header-container">
        <div className="page-header-left">
          <div className="page-tag">{isHod ? 'DEPARTMENT AUDIT & APPROVALS' : 'AUDIT & ACCREDITATION GOVERNANCE'}</div>
          <h1 className="page-title">{isHod ? 'HOD Department Audit Dashboard' : 'Documentation Review Console'}</h1>
          <p className="page-subtitle">
            {isHod
              ? 'Review departmental course files, verify statutory compliance, and authorize compliance dossiers.'
              : 'Evaluate 15-item statutory course files, audit syllabus completion, and sign off compliance.'}
          </p>
        </div>
        <div className="page-header-actions">
          {isHod && (
            <button className="btn btn-outline" onClick={() => navigate('/hod')}>
              <span>Back to HOD Overview</span>
            </button>
          )}
          <button className="btn btn-outline" onClick={fetchDashboardData}>
            <RefreshCw size={15} />
            <span>Refresh Audit Queue</span>
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

      {successMsg && (
        <div className="notice-banner" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#15803d', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* Grid split */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedCourse ? '380px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left: Course Queue */}
        <div className="content-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {isHod ? 'Department Course Files' : 'Assigned Course Files'} ({courses.length})
            </h3>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>Loading review queue...</div>
          ) : courses.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>No courses currently assigned for review.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {courses.map(c => {
                const isSelected = selectedCourseId === c.faculty_course_id;
                return (
                  <div
                    key={c.faculty_course_id}
                    onClick={() => handleSelectCourse(c.faculty_course_id)}
                    style={{
                      padding: '1rem',
                      backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--primary-color)' : 'var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    id={`reviewer-course-card-${c.code}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.9rem' }}>{c.code}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Faculty: {c.faculty_name}</span>
                      {c.last_submitted_at && <span>Sub: {c.last_submitted_at.split(' ')[0]}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Inspection, Dossier Preview & Decision */}
        {selectedCourse && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Header details */}
            <div className="content-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{selectedCourse.courseInfo.department}</div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-primary)' }}>
                    {selectedCourse.courseInfo.code}: {selectedCourse.courseInfo.name}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Instructor: <strong>{selectedCourse.courseInfo.faculty_name}</strong> | Semester: <strong>{selectedCourse.courseInfo.semester}</strong> | Section: <strong>{selectedCourse.courseInfo.section || 'A'}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={selectedCourse.courseInfo.status} />
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '0.4rem' }}>
                    {readiness}% Ready
                  </div>
                </div>
              </div>

              {/* Action: Open dossier preview */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/faculty/course/${selectedCourseId}/preview`)}
                  id="btn-reviewer-view-dossier"
                >
                  <ExternalLink size={15} />
                  <span>Inspect Complete Consolidated Dossier</span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/faculty/course/${selectedCourseId}/copo`)}
                >
                  <span>Inspect CO-PO Attainment</span>
                </button>
              </div>

              {/* Checklist */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                15-Item Statutory Course File Checklist
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                {selectedCourse.components.map((item, idx) => {
                  const isDone = ['APPROVED', 'COMPLETED'].includes(item.status.toUpperCase());
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '0.6rem 0.8rem',
                        backgroundColor: isDone ? '#f0fdf4' : '#fffbeb',
                        border: '1px solid',
                        borderColor: isDone ? '#bbf7d0' : '#fde68a',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
                      {isDone ? (
                        <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.75rem' }}>✓ Verified</span>
                      ) : (
                        <span style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.75rem' }}>Pending</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decision & Remarks */}
            <div className="content-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={16} /> {isHod ? 'HOD Assessment Remarks' : 'Auditor Assessment Remarks'}
              </h4>
              <textarea
                id="reviewer-comments-input"
                className="form-control"
                style={{ width: '100%', height: '80px', marginBottom: '1rem', resize: 'vertical' }}
                placeholder="Enter statutory audit comments, compliance notes, or instructions for corrections..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ flex: 1, padding: '0.65rem' }}
                  onClick={() => handleReviewSubmit('APPROVED')}
                  id="btn-reviewer-approve"
                >
                  <CheckCircle size={16} />
                  <span>Approve & Sign Off Course File</span>
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ flex: 1, padding: '0.65rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                  onClick={() => handleReviewSubmit('CORRECTION_REQUIRED')}
                  id="btn-reviewer-reject"
                >
                  <ShieldAlert size={16} />
                  <span>Request Modifications / Send Back</span>
                </button>
              </div>
            </div>

            {/* Audit History Log */}
            {reviewHistory.length > 0 && (
              <div className="content-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={15} /> Audit Trail & History
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {reviewHistory.map(h => (
                    <div
                      key={h.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#f8fafc',
                        borderLeft: '3px solid',
                        borderLeftColor: h.status === 'APPROVED' ? 'var(--success)' : 'var(--danger)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>Status Marked: {h.status}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{h.created_at}</span>
                      </div>
                      {h.comments && <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>"{h.comments}"</div>}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>Auditor: {h.reviewer_name || 'HOD / Auditor'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </AppLayout>
  );
}

export default ReviewerDashboard;
