import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppLayout from '../../components/AppLayout';
import StatusBadge from '../../components/StatusBadge';
import {
  ArrowLeft, FileText, Send, CheckCircle2, AlertTriangle, Clock,
  ChevronDown, ChevronUp, Download, Upload, Eye, ExternalLink,
  ShieldCheck, RefreshCw, Sparkles, Plus, Check, FileCheck
} from 'lucide-react';

export const CourseWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/faculty/course/${id || 4}`);
      setWorkspace(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  const toggleSection = (secNum) => {
    setOpenSections(prev => ({ ...prev, [secNum]: !prev[secNum] }));
  };

  const handleExpandAll = () => {
    setOpenSections({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
  };

  const handleCollapseAll = () => {
    setOpenSections({});
  };

  const handleSubmitForReview = async () => {
    if (!window.confirm('Are you sure you want to submit this course file for formal HOD statutory audit review?')) return;
    try {
      setSubmitting(true);
      await api.post(`/api/faculty/course/${id || 4}/submit`);
      setSubmitSuccess(true);
      fetchWorkspace();
    } catch (err) {
      alert(err.message || 'Failed to submit course file');
    } finally {
      setSubmitting(false);
    }
  };

  const courseInfo = workspace?.courseInfo || {
    code: 'CS504',
    name: 'Artificial Intelligence',
    department: 'Computer Science & Engineering',
    semester: 'Semester V',
    credits: 4.0,
    ltp: '3-1-0',
    section: 'Sec A',
    course_type: 'Core Theory',
    regulation: 'R-2022',
    status: 'IN_PROGRESS',
    reviewer_name: 'Dr. Rajesh Kulkarni'
  };

  const sections = workspace?.sections || [];
  const readiness = workspace?.readiness || {
    mandatoryCriteria: '11 / 13',
    statutorySecondary: '1 / 2',
    verifiedRatio: '11 / 15',
    percentage: 73
  };

  const breadcrumbs = [
    { label: 'Academic Operations', path: '/faculty' },
    { label: 'Faculty Workspace', path: '/faculty' },
    { label: `${courseInfo.code}: ${courseInfo.name}`, path: `/faculty/course/${id || 4}` }
  ];

  const handleItemAction = (item) => {
    if (item.action_label === 'View Register' || item.title.includes('Attendance')) {
      navigate(`/faculty/course/${id || 4}/attendance`);
    } else if (item.action_label === 'Enter Marks' || item.title.includes('Marks')) {
      navigate(`/faculty/course/${id || 4}/assessments`);
    } else if (item.action_label === 'View Matrix' || item.action_label === 'Recalculate' || item.title.includes('CO-PO') || item.title.includes('Attainment')) {
      navigate(`/faculty/course/${id || 4}/copo`);
    } else if (item.title.includes('Lesson Plan')) {
      navigate(`/faculty/course/${id || 4}/lesson-plan`);
    } else {
      navigate(`/faculty/course/${id || 4}/documents`);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {/* Top Navigation Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/faculty/courses')}
          id="btn-back-to-courses"
        >
          <ArrowLeft size={14} />
          <span>Back to My Courses</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate(`/faculty/course/${id || 4}/preview`)}
            id="btn-preview-consolidated"
          >
            <Eye size={14} />
            <span>Preview Consolidated File</span>
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => alert(`Statutory Course File Index: 15 mandatory items verified under NBA Tier-I Accreditation Standards.`)}
          >
            <FileText size={14} />
            <span>Index</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleSubmitForReview}
            disabled={submitting || courseInfo.status === 'SUBMITTED' || courseInfo.status === 'APPROVED'}
            id="btn-submit-review"
          >
            <Send size={14} />
            <span>{courseInfo.status === 'SUBMITTED' ? 'Submitted for Review' : courseInfo.status === 'APPROVED' ? 'Course File Approved' : 'Submit for Review'}</span>
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div className="alert-banner success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>Course file successfully submitted to HOD and Academic Committee for statutory review sign-off.</span>
        </div>
      )}

      {/* Course Title Banner */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {courseInfo.name}
          </h1>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
            {courseInfo.code}
          </span>
          <span className="badge badge-inprogress" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>
            In Progress • {readiness.percentage}% Verified
          </span>
        </div>
      </div>

      {/* 5 Metadata Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CATALOG &amp; COHORT</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '3px' }}>{courseInfo.course_type} • {courseInfo.credits} Credits</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{courseInfo.semester} - Section A (62 Enrolled)</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PERSONNEL</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '3px' }}>Dr. Aris Thorne <span className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>Primary</span></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Coord: Prof. Elena Vance</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ACCREDITATION BASE</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '3px' }}>Regulation {courseInfo.regulation}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>NBA Tier-I Statutory Track</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>DOSSIER DEADLINE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '3px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Nov 10, 2026</span>
            <span className="badge badge-returned" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>14 days remaining</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Internal Audit: Nov 14, 2026</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>READINESS</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '3px' }}>11 / 15 Verified ({readiness.percentage}%)</div>
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '4px', fontSize: '0.65rem' }}>
            <span style={{ color: 'var(--success)' }}>● 8 Approved</span>
            <span style={{ color: 'var(--warning)' }}>● 3 Partial</span>
            <span style={{ color: 'var(--text-light)' }}>● 4 Pending</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Matrix Accordion (7 Sections) + Right Governance Rail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Left Column: 15 Statutory Items across 7 Sections */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Course File Statutory Matrix
              </h2>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>15 Items</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={handleExpandAll}>Expand All</button>
              <button className="btn btn-outline btn-sm" onClick={handleCollapseAll}>Collapse All</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sections.map(sec => {
              const isOpen = openSections[sec.sectionNumber] !== false;

              return (
                <div
                  key={sec.sectionNumber}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  {/* Section Header */}
                  <div
                    onClick={() => toggleSection(sec.sectionNumber)}
                    style={{
                      padding: '0.85rem 1rem',
                      background: '#fafbfc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderBottom: isOpen ? '1px solid var(--border-light)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span>{sec.sectionName}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${sec.isFullyVerified ? 'badge-approved' : 'badge-inprogress'}`} style={{ fontSize: '0.65rem' }}>
                        {sec.verifiedCount} / {sec.totalItems} {sec.isFullyVerified ? 'Verified' : 'Complete'}
                      </span>
                    </div>
                  </div>

                  {/* Section Items */}
                  {isOpen && (
                    <div style={{ padding: '0.5rem 1rem' }}>
                      {sec.items.map(item => (
                        <div
                          key={item.id || item.item_index}
                          style={{
                            padding: '0.75rem 0',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                            {item.status === 'Approved' ? (
                              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
                            ) : item.status === 'In Progress' ? (
                              <Clock size={16} style={{ color: 'var(--warning)', marginTop: '2px', flexShrink: 0 }} />
                            ) : item.status === 'Correction Required' ? (
                              <AlertTriangle size={16} style={{ color: 'var(--danger)', marginTop: '2px', flexShrink: 0 }} />
                            ) : (
                              <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid var(--border-strong)', display: 'inline-block', marginTop: '2px', flexShrink: 0 }}></span>
                            )}

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {item.title}
                                </span>
                                <span className={`badge ${item.type === 'MANDATORY' ? 'badge-returned' : 'badge-neutral'}`} style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem' }}>
                                  {item.type}
                                </span>
                              </div>

                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {item.notes}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                            <div style={{ textAlign: 'right' }}>
                              <StatusBadge status={item.status} />
                              {item.review_date && (
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '2px' }}>
                                  {item.review_date}
                                </div>
                              )}
                            </div>

                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleItemAction(item)}
                              id={`btn-matrix-action-${item.item_index}`}
                            >
                              {item.action_label || 'View'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Rail: Readiness Audit & Governance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Readiness Audit */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ padding: '0.85rem 1rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Readiness Audit</h3>
              <span className="badge badge-inprogress" style={{ fontSize: '0.65rem' }}>Incomplete</span>
            </div>
            <div className="card-body" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mandatory Criteria:</span>
                <strong>{readiness.mandatoryCriteria} Completed</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Statutory &amp; Secondary:</span>
                <strong>{readiness.statutorySecondary} Completed</strong>
              </div>

              {/* 3 Pending Action Items Alert */}
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9f1239', fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                  <AlertTriangle size={14} />
                  <span>3 Pending Action Items:</span>
                </div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.7rem', color: '#881337', lineHeight: 1.5 }}>
                  <li>Internal Result Analysis (Mandatory)</li>
                  <li>CIA-II Marks Statement (14 entries remaining)</li>
                  <li>Unit 5 Lecture Notes (Pending upload)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Immediate Next Step Card */}
          <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
              ⚡ IMMEDIATE NEXT STEP
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
              Finalize CIA-II Assessment marks entry to automatically generate the Result Analysis curve.
            </div>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: '0.75rem', width: '100%' }}
              onClick={() => navigate(`/faculty/course/${id || 4}/assessments`)}
              id="btn-open-marks-register"
            >
              <span>Open Marks Register</span>
              <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>

          {/* Review & Audit Governance Card */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ padding: '0.85rem 1rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Review &amp; Audit Governance</h3>
            </div>
            <div className="card-body" style={{ padding: '0.85rem 1rem', fontSize: '0.8rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Reviewer:</span>
                <div style={{ fontWeight: 600 }}>Dr. Rajesh Kulkarni</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HOD, Computer Science &amp; Engineering</div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>IQAC Audit Date:</span>
                <div style={{ fontWeight: 600 }}>Nov 14, 2026 (Scheduled)</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>PREVIOUS REVIEW NOTE (OCT 25):</span>
                <p style={{ color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                  "Ensure Bloom's taxonomy revised levels are clearly highlighted for Assignment 2 before final statutory submission."
                </p>
              </div>
            </div>
          </div>

          {/* Workspace Utilities */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ padding: '0.85rem 1rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Workspace Utilities</h3>
            </div>
            <div className="card-body" style={{ padding: '0.5rem 1rem' }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'space-between', marginBottom: '0.5rem' }}
                onClick={() => navigate(`/faculty/course/${id || 4}/preview`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={14} />
                  <span>Download Draft Dossier (.pdf)</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>3.1 MB</span>
              </button>

              <button
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'space-between' }}
                onClick={() => navigate(`/faculty/course/${id || 4}/documents`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={14} />
                  <span>Batch Upload ZIP Package</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>Multi-slot</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseWorkspace;
