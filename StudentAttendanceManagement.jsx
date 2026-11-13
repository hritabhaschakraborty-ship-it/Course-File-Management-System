import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import {
  ArrowLeft, Download, Upload, Search, Filter, Lock, Unlock,
  CheckCircle2, AlertTriangle, Clock, ShieldCheck, Mail, Send
} from 'lucide-react';

export const StudentAttendanceManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id || 4;

  const [activeTab, setActiveTab] = useState('daily');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  // 10 sample students matching Screenshot 4
  const initialAttendance = [
    {
      rollNo: '24DCSE101',
      name: 'Aarav Sharma',
      univId: 'UK-2024-CSE-0910',
      status: 'Present',
      source: '10:11 AM (LH-302 Sensor A)',
      attended: 29,
      held: 31,
      pct: 93.5,
      band: 'Safe Zone',
      seeEligible: true
    },
    {
      rollNo: '24DCSE102',
      name: 'Ananya S. Iyer',
      univId: 'UK-2024-CSE-0914',
      status: 'Present',
      source: '10:09 AM (LH-302 Sensor B)',
      attended: 28,
      held: 31,
      pct: 90.3,
      band: 'Safe Zone',
      seeEligible: true
    },
    {
      rollNo: '24DCSE103',
      name: 'Rohan Deshmukh',
      univId: 'UK-2024-CSE-0922',
      status: 'Present',
      source: '10:14 AM (LH-302 Sensor A)',
      attended: 26,
      held: 31,
      pct: 83.9,
      band: 'Compliant',
      seeEligible: true
    },
    {
      rollNo: '24DCSE104',
      name: 'Priyanshi Nair',
      univId: 'UK-2024-CSE-0931',
      status: 'Absent',
      source: 'Unexcused Absence',
      attended: 21,
      held: 31,
      pct: 67.7,
      band: 'Shortage',
      seeEligible: false
    },
    {
      rollNo: '24DCSE105',
      name: 'Devendra K. Rathore',
      univId: 'UK-2024-CSE-0938',
      status: 'OD',
      source: 'Appr HOD-402 (Duty)',
      attended: 25,
      held: 31,
      pct: 80.6,
      band: 'Compliant',
      seeEligible: true
    },
    {
      rollNo: '24DCSE106',
      name: 'Tanvi Gandhi',
      univId: 'UK-2024-CSE-0945 • Medical',
      status: 'Absent',
      source: 'Med Slip #MED-101',
      attended: 22,
      held: 31,
      pct: 70.9,
      band: 'Condonable',
      seeEligible: false
    },
    {
      rollNo: '24DCSE107',
      name: 'Vikramaditya Rao',
      univId: 'UK-2024-CSE-0952',
      status: 'Present',
      source: '10:13 AM (LH-302 Sensor B)',
      attended: 23,
      held: 31,
      pct: 74.2,
      band: 'Borderline',
      seeEligible: false
    },
    {
      rollNo: '24DCSE108',
      name: 'Sneha Venkatesh',
      univId: 'UK-2024-CSE-0959',
      status: 'Present',
      source: '10:05 AM (LH-302 Sensor A)',
      attended: 31,
      held: 31,
      pct: 100.0,
      band: 'PERFECT',
      seeEligible: true
    },
    {
      rollNo: '24DCSE109',
      name: 'Karthik Subramanian',
      univId: 'UK-2024-CSE-0966',
      status: 'Present',
      source: '10:12 AM (LH-302 Sensor A)',
      attended: 27,
      held: 31,
      pct: 87.1,
      band: 'Safe Zone',
      seeEligible: true
    },
    {
      rollNo: '24DCSE110',
      name: 'Zoya Fatima',
      univId: 'UK-2024-CSE-0973',
      status: 'Present',
      source: '10:08 AM (LH-302 Sensor A)',
      attended: 28,
      held: 31,
      pct: 90.3,
      band: 'Safe Zone',
      seeEligible: true
    }
  ];

  const [records, setRecords] = useState(initialAttendance);

  const handleStatusChange = (rollNo, newStatus) => {
    if (isLocked) {
      alert('Attendance is currently locked and digitally signed by faculty. Click "Unlock for Correction" to edit.');
      return;
    }
    setRecords(prev =>
      prev.map(r => r.rollNo === rollNo ? { ...r, status: newStatus } : r)
    );
  };

  const handleMarkAllPresent = () => {
    if (isLocked) {
      alert('Attendance is locked. Unlock first.');
      return;
    }
    setRecords(prev => prev.map(r => ({ ...r, status: 'Present' })));
  };

  const handleClearAll = () => {
    if (isLocked) {
      alert('Attendance is locked. Unlock first.');
      return;
    }
    setRecords(prev => prev.map(r => ({ ...r, status: 'Absent' })));
  };

  const handleSaveAttendance = () => {
    setIsLocked(true);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 4000);
  };

  const breadcrumbs = [
    { label: 'Academic Operations', path: '/faculty' },
    { label: 'Faculty Workspace', path: '/faculty' },
    { label: 'CS504: Artificial Intelligence', path: `/faculty/course/${courseId}` },
    { label: 'Student Attendance Management', path: `/faculty/course/${courseId}/attendance` }
  ];

  const filteredRecords = records.filter(r => {
    const matchesSearch = !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rollNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === 'All' ||
      (filterType === 'Present' && r.status === 'Present') ||
      (filterType === 'Absent' && r.status === 'Absent') ||
      (filterType === 'OD' && r.status === 'OD') ||
      (filterType === 'Shortage' && r.pct < 75.0);

    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {/* Back button & Statutory Rule pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/faculty/course/${courseId}`)}
          id="btn-back-to-course"
        >
          <ArrowLeft size={14} />
          <span>Back to Course Workspace (CS504) • Section A Cohort • Term Week 9</span>
        </button>

        <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
          Statutory: UGC &amp; AICTE Min. 75.0% Mandatory Attendance Rule (Clause 8.2)
        </span>
      </div>

      {/* Title & Actions */}
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <div className="page-title-row">
            <h1 className="page-title">Student Attendance Management</h1>
            <span className="badge badge-neutral" style={{ fontWeight: 700 }}>CS504</span>
            <span className="badge badge-indigo">Semester V (Active)</span>
            <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>● Biometric Link Synced</span>
          </div>
          <p className="page-subtitle">
            Core Theory • 4.0 Credits • Section A (62 Enrolled) • Classroom LH-302 • Academic Session 2026–27
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => alert('Import Biometric/RFID log synced: 54 logs parsed.')}>
            <Upload size={14} />
            <span>Import Biometric / RFID Log</span>
          </button>

          <button className="btn btn-outline btn-sm" onClick={() => alert('Attendance Register exported (Excel/PDF Form A-3).')}>
            <Download size={14} />
            <span>Export Register (Excel/PDF)</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => { setIsLocked(false); alert('Attendance unlocked for daily entry.'); }}
            id="btn-record-attendance"
          >
            <span>Record Today's Attendance</span>
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="alert-banner success" style={{ marginBottom: '1rem' }}>
          <CheckCircle2 size={16} />
          <span>Attendance register saved, encrypted, and synchronized with Academic Dean dashboard.</span>
        </div>
      )}

      {/* 6 Metric KPI Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: '1rem' }}>
        <div className="metric-card indigo">
          <div className="metric-header"><span className="metric-label">TOTAL ENROLLED</span></div>
          <div className="metric-val-row"><span className="metric-val">62</span><span className="metric-unit">Students</span></div>
          <div className="metric-desc">100% Cohort verified</div>
        </div>

        <div className="metric-card green">
          <div className="metric-header"><span className="metric-label">TODAY'S PRESENT</span></div>
          <div className="metric-val-row"><span className="metric-val" style={{ color: 'var(--success)' }}>56</span><span className="metric-unit" style={{ color: 'var(--success)' }}>90.3%</span></div>
          <div className="metric-desc">54 RFID + 2 Manual</div>
        </div>

        <div className="metric-card red">
          <div className="metric-header"><span className="metric-label">UNEXCUSED ABSENT</span></div>
          <div className="metric-val-row"><span className="metric-val" style={{ color: 'var(--danger)' }}>04</span><span className="metric-unit" style={{ color: 'var(--danger)' }}>6.5%</span></div>
          <div className="metric-desc" style={{ color: 'var(--danger)' }}>Parents notified via SMS</div>
        </div>

        <div className="metric-card orange">
          <div className="metric-header"><span className="metric-label">ON-DUTY / MEDICAL</span></div>
          <div className="metric-val-row"><span className="metric-val" style={{ color: 'var(--warning)' }}>02</span><span className="metric-unit">3.2%</span></div>
          <div className="metric-desc">Approved Dean Waiver</div>
        </div>

        <div className="metric-card blue">
          <div className="metric-header"><span className="metric-label">COHORT CUMUL. AVG</span></div>
          <div className="metric-val-row"><span className="metric-val">84.6%</span><span className="metric-unit" style={{ color: 'var(--success)', fontSize: '0.75rem' }}>+0.8%</span></div>
          <div className="metric-desc">31 of 44 Total Lectures</div>
        </div>

        <div className="metric-card red">
          <div className="metric-header"><span className="metric-label">SHORTAGE RISK (&lt;75%)</span></div>
          <div className="metric-val-row"><span className="metric-val" style={{ color: 'var(--danger)' }}>05</span><span className="metric-unit" style={{ color: 'var(--danger)' }}>8.1% Cohort</span></div>
          <div className="metric-desc" style={{ color: 'var(--danger)' }}>Immediate Notice Active</div>
        </div>
      </div>

      {/* De-barment / Attendance Shortfall Warning Notice Banner */}
      <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <AlertTriangle size={20} style={{ color: '#9f1239', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9f1239' }}>
              De-barment / Attendance Shortfall Warning Notice <span className="badge badge-returned" style={{ fontSize: '0.65rem', marginLeft: '6px' }}>AY 2026-27 Rule 14.1</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#881337', marginTop: '3px', lineHeight: 1.4 }}>
              5 students currently fall strictly below the mandatory <strong>75.0% university eligibility threshold</strong> for Semester End Examination (SEE). Automated SMS/Email notices dispatched to official student and guardian contacts on Oct 20, 2026. Condonation hearings close on Nov 05, 2026.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button className="btn btn-outline btn-sm" style={{ background: '#ffffff', color: '#881337', borderColor: '#fecdd3' }} onClick={() => alert('Dispatched Notices log: 5 SMS + 5 Emails sent to guardians.')}>
            View Dispatched Notices
          </button>
          <button className="btn btn-primary btn-sm" style={{ background: '#9f1239', borderColor: '#9f1239' }} onClick={() => alert('Escalated to Academic Dean for condonation review.')}>
            Escalate to Academic Dean
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav" style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
        <button className={`tab-nav-btn ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>
          Daily / Lecture-wise Entry
        </button>
        <button className={`tab-nav-btn ${activeTab === 'cumulative' ? 'active' : ''}`} onClick={() => setActiveTab('cumulative')}>
          Cumulative Register &amp; Shortage List
        </button>
        <button className={`tab-nav-btn ${activeTab === 'medical' ? 'active' : ''}`} onClick={() => setActiveTab('medical')}>
          Medical / Exemption Leave Requests (2)
        </button>
        <button className={`tab-nav-btn ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab('monthly')}>
          Monthly Analysis &amp; CO-Correlation
        </button>
      </div>

      {/* Session Selector Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Class Attendance Lock:</span>
              {isLocked ? (
                <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                  <Lock size={12} />
                  <span>Faculty Signed &amp; Locked</span>
                </span>
              ) : (
                <span className="badge badge-returned" style={{ fontSize: '0.7rem' }}>
                  <Unlock size={12} />
                  <span>Unlocked for Editing</span>
                </span>
              )}
            </div>

            <button
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
              onClick={() => setIsLocked(!isLocked)}
              id="btn-toggle-lock"
            >
              {isLocked ? 'Unlock for Correction' : 'Lock & Sign'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-sm" onClick={() => alert('RFID biometric cache reloaded')}>
              Default Biometric (54 Detected)
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleMarkAllPresent}>
              Mark All Present
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleClearAll}>
              Clear All
            </button>
            {!isLocked && (
              <button className="btn btn-primary btn-sm" onClick={handleSaveAttendance} id="btn-save-attendance">
                Save &amp; Commit
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SELECT LECTURE SESSION:</label>
            <select className="form-select" style={{ width: 'auto', minWidth: '320px', fontSize: '0.8rem' }}>
              <option>Lecture 31: Oct 25, 2026 • 10:15 AM - 11:15 AM (Hall LH-302)</option>
              <option>Lecture 30: Oct 22, 2026 • 10:15 AM - 11:15 AM (Hall LH-302)</option>
              <option>Lecture 29: Oct 20, 2026 • 10:15 AM - 11:15 AM (Hall LH-302)</option>
            </select>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            MAPPED SYLLABUS UNIT: <strong>Unit IV: Bayesian Belief Networks — Exact Inference via Variable Elimination</strong> <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>CO4 Mapped</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '220px' }}>
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search student name, roll number, or university ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="pill-tabs">
            <button className={`pill-tab ${filterType === 'All' ? 'active' : ''}`} onClick={() => setFilterType('All')}>
              All Students (62)
            </button>
            <button className={`pill-tab ${filterType === 'Present' ? 'active' : ''}`} onClick={() => setFilterType('Present')}>
              Present (56)
            </button>
            <button className={`pill-tab ${filterType === 'Absent' ? 'active' : ''}`} onClick={() => setFilterType('Absent')}>
              Absent (4)
            </button>
            <button className={`pill-tab ${filterType === 'OD' ? 'active' : ''}`} onClick={() => setFilterType('OD')}>
              On-Duty (2)
            </button>
            <button className={`pill-tab ${filterType === 'Shortage' ? 'active' : ''}`} onClick={() => setFilterType('Shortage')} style={{ borderColor: '#fca5a5', color: '#b91c1c' }}>
              Shortage Risk &lt;75% (5)
            </button>
          </div>

          <button className="btn btn-outline btn-sm" onClick={() => alert('Automated email / SMS notices dispatched to shortlisted parents.')}>
            <Mail size={14} />
            <span>Send Shortage Notice</span>
          </button>
        </div>
      </div>

      {/* Attendance Student Table */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '36px' }}><input type="checkbox" /></th>
                <th>ROLL NUMBER</th>
                <th>STUDENT NAME &amp; UNIV ID</th>
                <th style={{ minWidth: '190px' }}>TODAY'S ATTENDANCE STATUS (OCT 25)</th>
                <th>BIOMETRIC TIME-IN / SOURCE</th>
                <th>ATTENDED / HELD</th>
                <th style={{ width: '160px' }}>CUMULATIVE %</th>
                <th style={{ textAlign: 'center' }}>SEE</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(r => (
                <tr key={r.rollNo}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{r.rollNo}</span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.univId}</div>
                    </div>
                  </td>
                  {/* Status Toggle Buttons */}
                  <td>
                    <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(r.rollNo, 'Present')}
                        style={{
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: isLocked ? 'default' : 'pointer',
                          background: r.status === 'Present' ? 'var(--success)' : '#ffffff',
                          color: r.status === 'Present' ? '#ffffff' : 'var(--text-secondary)'
                        }}
                      >
                        ✓ Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(r.rollNo, 'Absent')}
                        style={{
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: isLocked ? 'default' : 'pointer',
                          background: r.status === 'Absent' ? 'var(--danger)' : '#ffffff',
                          color: r.status === 'Absent' ? '#ffffff' : 'var(--text-secondary)'
                        }}
                      >
                        ● Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(r.rollNo, 'OD')}
                        style={{
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: isLocked ? 'default' : 'pointer',
                          background: r.status === 'OD' ? 'var(--warning)' : '#ffffff',
                          color: r.status === 'OD' ? '#ffffff' : 'var(--text-secondary)'
                        }}
                      >
                        OD
                      </button>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', color: r.status === 'Absent' ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      {r.source}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {r.attended} / {r.held}
                  </td>
                  <td>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 800, color: r.pct < 75.0 ? 'var(--danger)' : 'inherit' }}>
                          {r.pct}%
                        </span>
                        <span style={{ fontSize: '0.65rem', color: r.pct < 75.0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                          {r.band}
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${r.pct >= 90 ? 'green' : r.pct >= 75 ? 'indigo' : 'red'}`}
                          style={{ width: `${r.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {r.seeEligible ? (
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} title="SEE Exam Clearance Granted" />
                    ) : (
                      <AlertTriangle size={16} style={{ color: 'var(--danger)' }} title="SEE Exam Shortage Warning" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div>
            Showing <strong>1–10</strong> of <strong>62 Students</strong> • Selected: 0 rows
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button className="btn btn-outline btn-sm">&lt;</button>
            <button className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>1</button>
            <button className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem' }}>2</button>
            <button className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem' }}>3</button>
            <button className="btn btn-outline btn-sm">&gt;</button>
          </div>
        </div>
      </div>

      {/* Two Column Bottom Grid: Distribution & Statutory Regulations Endorsement */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left: Cumulative Attendance Distribution & Band Breakdown */}
        <div className="card" style={{ marginBottom: 0, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Cumulative Attendance Distribution &amp; Band Breakdown</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Performance clustering after Lecture 31 against the mandatory 75% AICTE threshold.</p>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>62 Enrolled Total</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>■ Excellent Cohort (&gt;= 90.0%)</span>
                <strong>34 Students (54.8%)</strong>
              </div>
              <div className="progress-track"><div className="progress-fill green" style={{ width: '54.8%' }}></div></div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                <span style={{ color: 'var(--info)', fontWeight: 600 }}>■ Good Standing (80.0% – 89.9%)</span>
                <strong>17 Students (27.4%)</strong>
              </div>
              <div className="progress-track"><div className="progress-fill blue" style={{ width: '27.4%' }}></div></div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>■ Borderline Safe (75.0% – 79.9%)</span>
                <strong>06 Students (9.7%)</strong>
              </div>
              <div className="progress-track"><div className="progress-fill orange" style={{ width: '9.7%' }}></div></div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>■ Critical Shortage / At Risk (&lt; 75.0%)</span>
                <strong style={{ color: 'var(--danger)' }}>05 Students (8.1%)</strong>
              </div>
              <div className="progress-track"><div className="progress-fill red" style={{ width: '8.1%' }}></div></div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>Target Min Threshold: <strong>75.0% Mandatory</strong></span>
            <span>Class Clearance Ratio: <strong style={{ color: 'var(--success)' }}>91.9%</strong></span>
          </div>
        </div>

        {/* Right: Statutory Regulations & Faculty Endorsement */}
        <div className="card" style={{ marginBottom: 0, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Statutory Regulations &amp; Faculty Endorsement</h3>
            <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>NBA Criterion 2.1 Compliant</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              University Academic Ordinance Clause 8.2:
            </div>
            <p style={{ lineHeight: 1.4 }}>
              A student must maintain minimum 75.0% attendance in lectures to be granted examination hall clearance for Semester End Examinations (SEE). Condonation is permitted up to a maximum ceiling of 10% strictly upon submission of verified medical hospitalization certificates or official Dean deputation letters for varsity events.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
            <span>Digitally Certified by: <strong>Dr. Aris Thorne</strong> (Faculty In-Charge) • Oct 25, 2026 • TCID: 517</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-sm" onClick={() => alert('Register Form A-3 (.pdf) generated.')}>
              <Download size={13} />
              <span>Register Form A-3 (.pdf)</span>
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => alert('Notified Proctor / Mentors.')}>
              <span>Notify Proctor / Mentors</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => alert('Fortnightly Report submitted to HOD.')}>
              <span>Submit Fortnightly Report</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentAttendanceManagement;
