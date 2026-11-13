import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import {
  ArrowLeft, Download, Upload, Search, Filter, Printer,
  AlertTriangle, CheckCircle2, Clock, Check, X, ShieldAlert, Award
} from 'lucide-react';

export const MarksAssessmentManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id || 4;

  const [activeTab, setActiveTab] = useState('CIA-II');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initial student records matching Figma Screen 2
  const initialStudents = [
    {
      rollNo: '24DCSE101',
      name: 'Aarav Sharma',
      univId: 'UK-2024-CSE-0910',
      attendance: 'Present',
      marks: 44.5,
      max: 50.0,
      status: 'Verified',
      badge: null
    },
    {
      rollNo: '24DCSE102',
      name: 'Ananya S. Iyer',
      univId: 'UK-2024-CSE-0914',
      attendance: 'Present',
      marks: 41.5,
      max: 50.0,
      status: 'Unsaved Draft',
      badge: null
    },
    {
      rollNo: '24DCSE103',
      name: 'Rohan Deshmukh',
      univId: 'UK-2024-CSE-0922',
      attendance: 'Present',
      marks: 38.0,
      max: 50.0,
      status: 'Unsaved Draft',
      badge: null
    },
    {
      rollNo: '24DCSE104',
      name: 'Priyanshi Nair',
      univId: 'UK-2024-CSE-0931',
      attendance: 'Present',
      marks: 53.0, // Error: Exceeds 50.0
      max: 50.0,
      status: 'Validation Error',
      badge: null
    },
    {
      rollNo: '24DCSE105',
      name: 'Devendra K. Rathore',
      univId: 'UK-2024-CSE-0938',
      attendance: 'Present',
      marks: null,
      max: 50.0,
      status: 'Pending Entry',
      badge: null
    },
    {
      rollNo: '24DCSE106',
      name: 'Tanvi Gandhi',
      univId: 'UK-2024-CSE-0945 • Medical Leave',
      attendance: 'Absent',
      marks: 0,
      max: 50.0,
      status: 'Recorded Absent',
      badge: null
    },
    {
      rollNo: '24DCSE107',
      name: 'Vikramaditya Rao',
      univId: 'UK-2024-CSE-0952',
      attendance: 'Present',
      marks: 18.5,
      max: 50.0,
      status: 'Verified',
      badge: 'Remedial'
    },
    {
      rollNo: '24DCSE108',
      name: 'Sneha Venkatesh',
      univId: 'UK-2024-CSE-0959',
      attendance: 'Present',
      marks: 48.5,
      max: 50.0,
      status: 'Verified',
      badge: 'Cohort Top'
    },
    {
      rollNo: '24DCSE109',
      name: 'Karthik Subramanian',
      univId: 'UK-2024-CSE-0966',
      attendance: 'Present',
      marks: 34.0,
      max: 50.0,
      status: 'Verified',
      badge: null
    },
    {
      rollNo: '24DCSE110',
      name: 'Zoya Fatima',
      univId: 'UK-2024-CSE-0973',
      attendance: 'Present',
      marks: 39.5,
      max: 50.0,
      status: 'Verified',
      badge: null
    }
  ];

  const [students, setStudents] = useState(initialStudents);

  const handleMarksChange = (rollNo, val) => {
    const num = parseFloat(val);
    setStudents(prev =>
      prev.map(s => {
        if (s.rollNo === rollNo) {
          const isError = num > 50;
          return {
            ...s,
            marks: isNaN(num) ? null : num,
            status: isError ? 'Validation Error' : 'Unsaved Draft'
          };
        }
        return s;
      })
    );
  };

  const handleFixError = () => {
    // Fix row 4 Priyanshi Nair from 53 to 48
    setStudents(prev =>
      prev.map(s => s.rollNo === '24DCSE104' ? { ...s, marks: 48.0, status: 'Verified' } : s)
    );
  };

  const handleSaveAll = () => {
    // Check if error still exists
    const hasError = students.some(s => s.status === 'Validation Error');
    if (hasError) {
      alert('Please fix validation errors before saving! Marks cannot exceed maximum limit of 50.0.');
      return;
    }

    setStudents(prev =>
      prev.map(s => s.status === 'Unsaved Draft' ? { ...s, status: 'Verified' } : s)
    );
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const breadcrumbs = [
    { label: 'Academic Operations', path: '/faculty' },
    { label: 'Faculty Workspace', path: '/faculty' },
    { label: 'CS504: Artificial Intelligence', path: `/faculty/course/${courseId}` },
    { label: 'Assessments & Marks', path: `/faculty/course/${courseId}/assessments` }
  ];

  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'All' ||
      (filterStatus === 'Verified' && s.status === 'Verified') ||
      (filterStatus === 'Absent' && s.attendance === 'Absent');

    return matchesSearch && matchesFilter;
  });

  const hasValidationError = students.some(s => s.status === 'Validation Error');
  const unsavedCount = students.filter(s => s.status === 'Unsaved Draft').length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {/* Top Breadcrumb & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/faculty/course/${courseId}`)}
          id="btn-back-to-course"
        >
          <ArrowLeft size={14} />
          <span>Back to Course Workspace (CS504)</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
          <Clock size={13} />
          <span>Entry Open — Portal Closes in 2 Days (Oct 30, 2026 23:59 IST)</span>
        </div>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <div className="page-title-row">
            <h1 className="page-title">Marks &amp; Assessment Management</h1>
            <span className="badge badge-neutral" style={{ fontWeight: 700 }}>CS504</span>
            <span className="badge badge-indigo">Semester V (Active)</span>
          </div>
          <p className="page-subtitle">
            Core Theory • 4.0 Credits • Section A Cohort • Academic Session 2026–27 • <span style={{ color: 'var(--success)', fontWeight: 600 }}>HOD Audited Schema</span>
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => alert('Import CSV/Excel: Template supports University ID and Marks mapping.')}>
            <Upload size={14} />
            <span>Import CSV / Excel</span>
          </button>

          <button className="btn btn-outline btn-sm" onClick={() => alert('Exporting CIA-II Grade Award Template (.xlsx)...')}>
            <Download size={14} />
            <span>Export Template</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleSaveAll}
            id="btn-save-changes-top"
          >
            <Check size={14} />
            <span>Save Changes ({unsavedCount + (hasValidationError ? 1 : 0)} Unsaved)</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="alert-banner success" style={{ marginBottom: '1rem' }}>
          <CheckCircle2 size={16} />
          <span>CIA-II Assessment marks saved successfully and direct attainment re-indexed.</span>
        </div>
      )}

      {/* Assessment Sub-Nav Tabs */}
      <div className="tab-nav" style={{ marginBottom: '1.25rem', padding: '0 0.5rem' }}>
        <button className="tab-nav-btn" onClick={() => alert('CIA-I is finalized and audited under locked sign-off.')}>
          CIA-I (Locked / Audited)
        </button>
        <button className="tab-nav-btn active">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }}></span>
          <span>Internal Test (CIA-II)</span>
        </button>
        <button className="tab-nav-btn" onClick={() => setActiveTab('Assignment 1')}>
          Assignment 1
        </button>
        <button className="tab-nav-btn" onClick={() => setActiveTab('Assignment 2')}>
          Assignment 2
        </button>
        <button className="tab-nav-btn" onClick={() => setActiveTab('Quiz')}>
          Quiz / Surprise Test
        </button>
        <button className="tab-nav-btn" onClick={() => setActiveTab('Practical')}>
          Practical Lab Exam
        </button>
        <button className="tab-nav-btn" style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 600 }}>
          ⚙ Assessment Weights
        </button>
      </div>

      {/* Assessment Details Banner */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ASSESSMENT TITLE</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>Continuous Internal Assessment II (CIA-II)</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Units III &amp; IV - Bloom's Taxonomy Level K1-K4 Mapped</div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>MAX MARKS</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>50.0 <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>(Weight: 20%)</span></div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Passing Mark: 20.0 (40%)</div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>EVALUATION DATE</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>Oct 24, 2026</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hall LH-301 / LH-302</div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>COURSE OUTCOME MAPPING</div>
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '2px', fontSize: '0.75rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--primary)' }}>• CO3 (15M)</span>
            <span style={{ color: 'var(--primary)' }}>• CO4 (25M)</span>
            <span style={{ color: 'var(--primary)' }}>• CO5 (10M)</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NBA Criterion 2.2 Direct Attainment Bound</div>
        </div>
      </div>

      {/* Cohort Stats (6 Tiles) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Enrolled Students</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>62</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Section A Cohort</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Marks Entered</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>58 <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>/ 62</span> <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>93.5%</span></div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>4 Records Remaining</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Pending Entries</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning)' }}>4</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2 Absent • 2 Blank</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cohort Average</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>37.4 <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ 50.0</span></div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>74.8% Mean Score</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Highest / Lowest</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>48.5 <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ 16.0</span></div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Spread: 32.5 Marks</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Std Deviation (σ)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>6.82</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal Bell Fit</div>
        </div>
      </div>

      {/* Unsaved Notice Alert Banner */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#92400e' }}>
          <AlertTriangle size={16} />
          <div>
            <strong>You have {unsavedCount + (hasValidationError ? 1 : 0)} unsaved marks entries.</strong> Unsaved changes will be lost if you leave this workspace session.
            <div style={{ fontSize: '0.7rem', color: '#78350f' }}>
              Automatic background draft snapshot created 2 minutes ago. Direct Attainment Indices will recalculate upon final commit.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline btn-sm" style={{ background: '#ffffff' }} onClick={() => setStudents(initialStudents)}>
            Discard Changes
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSaveAll}>
            Save &amp; Compute Attainment
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '220px' }}>
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search Roll No, Name or Reg ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '150px', fontSize: '0.8rem' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">Filter Status: All Students (62)</option>
            <option value="Verified">Verified Only</option>
            <option value="Absent">Absent Only</option>
          </select>

          <select className="form-select" style={{ width: 'auto', minWidth: '160px', fontSize: '0.8rem' }}>
            <option>Sort: Roll Number (Ascending)</option>
            <option>Sort: Marks (High to Low)</option>
          </select>

          <button className="btn btn-outline btn-sm" onClick={() => alert('Batch mark selected absent')}>
            Batch Mark Absent
          </button>

          <button className="btn btn-outline btn-sm" onClick={() => alert('Award list print view ready.')}>
            <Printer size={14} />
            <span>Print Award List</span>
          </button>
        </div>
      </div>

      {/* Marks Table */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '36px' }}><input type="checkbox" /></th>
                <th>ROLL NO</th>
                <th>STUDENT NAME &amp; UNIVERSITY ID</th>
                <th>ATTENDANCE</th>
                <th style={{ width: '130px' }}>MARKS OBTAINED [MAX: 50.0]</th>
                <th>MAX</th>
                <th>PERCENTAGE</th>
                <th>VERIFICATION STATUS</th>
                <th style={{ textAlign: 'center' }}>AUDIT</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => {
                const isError = s.status === 'Validation Error';
                const isUnsaved = s.status === 'Unsaved Draft';
                const pct = s.marks !== null ? ((s.marks / 50) * 100).toFixed(1) : '—';

                return (
                  <tr key={s.rollNo} style={{ backgroundColor: isError ? '#fef2f2' : isUnsaved ? '#f8fafc' : 'inherit' }}>
                    <td><input type="checkbox" /></td>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.rollNo}</span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{s.name}</span>
                          {s.badge === 'Cohort Top' && (
                            <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', background: '#fef3c7', color: '#92400e' }}>
                              Cohort Top
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.univId}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${s.attendance === 'Present' ? 'badge-approved' : 'badge-returned'}`}>
                        {s.attendance}
                      </span>
                    </td>
                    <td>
                      {s.attendance === 'Absent' ? (
                        <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.85rem' }}>AB</span>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <input
                              type="number"
                              step="0.5"
                              value={s.marks !== null ? s.marks : ''}
                              onChange={(e) => handleMarksChange(s.rollNo, e.target.value)}
                              style={{
                                width: '65px',
                                padding: '0.25rem 0.45rem',
                                border: isError ? '2px solid var(--danger)' : isUnsaved ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                textAlign: 'right'
                              }}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 50</span>
                          </div>
                          {isError && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 600, marginTop: '2px' }}>
                              Exceeds max limit (50.0)
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      50.0
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: s.badge === 'Remedial' ? 'var(--danger)' : 'inherit' }}>
                        {pct !== '—' ? `${pct}%` : '—'}
                      </span>
                      {s.badge === 'Remedial' && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 600 }}>(Remedial)</div>
                      )}
                    </td>
                    <td>
                      {isError ? (
                        <span className="badge badge-returned" style={{ cursor: 'pointer' }} onClick={handleFixError} title="Click to fix error">
                          ⚠️ Validation Error (Click to fix)
                        </span>
                      ) : isUnsaved ? (
                        <span className="badge badge-indigo">● Unsaved Draft</span>
                      ) : s.status === 'Recorded Absent' ? (
                        <span className="badge badge-neutral">Recorded Absent</span>
                      ) : s.status === 'Pending Entry' ? (
                        <span className="badge badge-inprogress">Pending Entry</span>
                      ) : (
                        <span className="badge badge-approved">✓ Verified</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                      {isError ? <span style={{ color: 'var(--danger)', fontWeight: 800 }}>!</span> : <CheckCircle2 size={15} style={{ color: 'var(--border-strong)' }} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div>
            Showing <strong>1–10</strong> of <strong>62 Students</strong> • Rows per page: <strong>10</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button className="btn btn-outline btn-sm">&lt; Previous</button>
            <button className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>1</button>
            <button className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem' }}>2</button>
            <button className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem' }}>3</button>
            <button className="btn btn-outline btn-sm">Next &gt;</button>
          </div>
        </div>
      </div>

      {/* CIA-II Assessment Performance & Distribution Summary (NBA Criterion 2.2 Alignment) */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              CIA-II Assessment Performance &amp; Distribution Summary (NBA Criterion 2.2 Alignment)
            </h3>
          </div>
          <span className="badge badge-approved" style={{ fontSize: '0.75rem' }}>
            ✓ Cohort Pass Rate: 93.1% (54 / 58 Evaluated)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left: Score Distribution Bands */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Score Distribution Bands (58 Evaluated Students)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span>Excellent (&gt;80% = &gt;40.0M)</span>
                  <strong>28 Students (45.2%)</strong>
                </div>
                <div className="progress-track"><div className="progress-fill green" style={{ width: '45.2%' }}></div></div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span>Good (60%–79% = 30.0–39.5M)</span>
                  <strong>22 Students (35.5%)</strong>
                </div>
                <div className="progress-track"><div className="progress-fill indigo" style={{ width: '35.5%' }}></div></div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span>Average (40%–59% = 20.0–29.5M)</span>
                  <strong>8 Students (12.9%)</strong>
                </div>
                <div className="progress-track"><div className="progress-fill orange" style={{ width: '12.9%' }}></div></div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ color: 'var(--danger)' }}>Remedial / Needs Support (&lt;40% = &lt;20.0M)</span>
                  <strong style={{ color: 'var(--danger)' }}>4 Students (6.5%)</strong>
                </div>
                <div className="progress-track"><div className="progress-fill red" style={{ width: '6.5%' }}></div></div>
              </div>
            </div>
          </div>

          {/* Right: Direct Course Outcome Attainment Preview */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Direct Course Outcome (CO) Attainment Preview
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Institutional Target: 70.0%</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>CO3 Probabilistic Reasoning (15M Max)</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Bloom's Level K4 • 58 students computed</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)' }}>76.4%</span>
                    <span className="badge badge-approved" style={{ marginLeft: '6px', fontSize: '0.6rem' }}>Target Met</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>CO4 Bayesian Inference &amp; Networks (25M Max)</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Bloom's Level K4 • 58 students computed</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)' }}>72.8%</span>
                    <span className="badge badge-approved" style={{ marginLeft: '6px', fontSize: '0.6rem' }}>Target Met</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>CO5 Learning Algorithms &amp; Perceptron (10M Max)</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Bloom's Level K4 • 58 students computed</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--warning)' }}>68.2%</span>
                    <span className="badge badge-inprogress" style={{ marginLeft: '6px', fontSize: '0.6rem' }}>Close (Delta -1.8%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            Statutory Audit Note: Marks require final endorsement by the Department Head before unlocking Direct CO-PO Matrix Calculation Engine.
          </div>
          <div>
            Ref ID: CFMS-NBA-CS504-2026-II
          </div>
        </div>
      </div>

      {/* Floating Action Bottom Bar */}
      <div style={{ position: 'sticky', bottom: '1rem', background: '#1e1b4b', color: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-xl)', zIndex: 30, flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ background: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
            {unsavedCount} Unsaved Student Marks
          </span>
          {hasValidationError && (
            <span style={{ fontSize: '0.8rem', color: '#fca5a5', fontWeight: 600 }}>
              ⚠️ 1 Validation Error Detected in Row 4 (Roll: 24DCSE104) — Fix before final commit
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => setStudents(initialStudents)}>
            Cancel Changes
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSaveAll} id="btn-save-validate">
            <span>Save &amp; Validate Records</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default MarksAssessmentManagement;
