import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppLayout from '../../components/AppLayout';
import {
  ArrowLeft, Plus, Download, Upload, Search, Calendar,
  CheckCircle2, Clock, AlertTriangle, ChevronRight, BookOpen,
  Award, RefreshCw, Send, Check
} from 'lucide-react';

export const LessonPlanCalendar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id || 4;

  const [activeUnit, setActiveUnit] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [quickDelivered, setQuickDelivered] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Lecture Form state
  const [newLecture, setNewLecture] = useState({
    unit: 'Unit V',
    topic: '',
    subtopic: '',
    plannedDate: '',
    outcome: 'CO5 - K4',
    mode: 'Chalk & Board + Interactive Demo'
  });

  const breadcrumbs = [
    { label: 'Academic Operations', path: '/faculty' },
    { label: 'Faculty Workspace', path: '/faculty' },
    { label: 'CS504: Artificial Intelligence', path: `/faculty/course/${courseId}` },
    { label: 'Lesson Plan & Academic Calendar', path: `/faculty/course/${courseId}/lesson-plan` }
  ];

  // 45 Lectures dataset matching the Figma screen
  const initialLectures = [
    {
      no: 'L-29',
      unit: 'Unit IV',
      topic: 'Probabilistic Reasoning: Bayes Rule & Independence',
      subtopic: 'Conditional probability, prior and posterior formulations',
      planned: 'Oct 20, 2026',
      conducted: 'Oct 20, 2026',
      status: 'CONDUCTED',
      outcome: 'CO4 - K4',
      mode: 'Chalk & Board + Formula Sheet'
    },
    {
      no: 'L-30',
      unit: 'Unit IV',
      topic: 'Bayesian Belief Networks: Representation & Semantics',
      subtopic: 'DAG structures, conditional probability tables (CPTs), Markov blanket',
      planned: 'Oct 22, 2026',
      conducted: 'Oct 22, 2026',
      status: 'CONDUCTED',
      outcome: 'CO4 - K4',
      mode: 'Interactive Colab / Diagram Trace'
    },
    {
      no: 'L-31',
      unit: 'Unit IV',
      topic: 'Inference in Bayesian Networks: Exact Elimination',
      subtopic: 'Variable elimination complexity, d-separation principles',
      planned: 'Oct 25, 2026',
      conducted: 'Oct 27, 2026 (Symposium Resched.)',
      status: 'RESCHEDULED',
      outcome: 'CO4 - K4',
      mode: 'Problem Solving + Board Tutorial'
    },
    {
      no: 'L-32',
      unit: 'Unit IV',
      topic: 'Approximate Inference in Bayesian Networks',
      subtopic: 'Sampling algorithms: Prior sampling, Rejection & Likelihood weighting',
      planned: 'Oct 29, 2026',
      conducted: null,
      status: 'UPCOMING',
      isNext: true,
      outcome: 'CO4 - K4',
      mode: 'Live Python / PgmPy Simulation'
    },
    {
      no: 'L-33',
      unit: 'Unit V',
      topic: 'Introduction to Machine Learning: Supervised vs Unsupervised',
      subtopic: 'Taxonomy of learning agents, bias-variance tradeoff, train-test split logic',
      planned: 'Nov 02, 2026',
      conducted: null,
      status: 'PENDING',
      outcome: 'CO5 - K3',
      mode: 'Case Study & Group Discussion'
    },
    {
      no: 'L-34',
      unit: 'Unit V',
      topic: 'Decision Trees: Information Gain & Entropy',
      subtopic: 'ID3 algorithm, Gini impurity, tree pruning, handling continuous attributes',
      planned: 'Nov 05, 2026',
      conducted: null,
      status: 'PENDING',
      outcome: 'CO5 - K4',
      mode: 'Board Workout + Scikit-Learn Demo'
    },
    {
      no: 'L-35',
      unit: 'Unit V',
      topic: 'Neural Networks: Perceptron & Backpropagation Intro',
      subtopic: 'Activation functions, linear separability, multi-layer feedforward setup',
      planned: 'Nov 09, 2026',
      conducted: null,
      status: 'PENDING',
      outcome: 'CO5 - K4',
      mode: 'Interactive Colab / Visual Neural Net'
    },
    {
      no: 'L-36',
      unit: 'Unit V',
      topic: 'Reinforcement Learning & Bellman Equation',
      subtopic: 'Reward signals, Markov Decision Processes, policy vs value iteration',
      planned: 'Nov 12, 2026',
      conducted: null,
      status: 'PENDING',
      outcome: 'CO5 - K4',
      mode: 'Chalk & Board + Simulation Demo'
    }
  ];

  const [lectures, setLectures] = useState(initialLectures);

  const handleQuickLog = () => {
    setQuickDelivered(true);
    setLectures(prev =>
      prev.map(l => l.no === 'L-32' ? { ...l, conducted: 'Today (Oct 28, 2026)', status: 'CONDUCTED', isNext: false } : l)
    );
  };

  const handleAddLecture = (e) => {
    e.preventDefault();
    const newNo = `L-${lectures.length + 29}`;
    const item = {
      no: newNo,
      unit: newLecture.unit,
      topic: newLecture.topic || 'Advanced Topic',
      subtopic: newLecture.subtopic || 'Academic Syllabus Alignment',
      planned: newLecture.plannedDate || 'Nov 16, 2026',
      conducted: null,
      status: 'PENDING',
      outcome: newLecture.outcome,
      mode: newLecture.mode
    };
    setLectures([...lectures, item]);
    setShowAddModal(false);
  };

  const filteredLectures = lectures.filter(l => {
    const matchesUnit = activeUnit === 'All' ||
      (activeUnit === 'Unit IV' && l.unit === 'Unit IV') ||
      (activeUnit === 'Unit V' && l.unit === 'Unit V');

    const matchesSearch = !searchQuery ||
      l.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subtopic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Conducted' && l.status === 'CONDUCTED') ||
      (statusFilter === 'Pending' && (l.status === 'PENDING' || l.status === 'UPCOMING'));

    const matchesOutcome = outcomeFilter === 'All' || l.outcome.includes(outcomeFilter);

    return matchesUnit && matchesSearch && matchesStatus && matchesOutcome;
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {/* Subheader & Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/faculty/course/${courseId}`)}
          id="btn-back-workspace"
        >
          <ArrowLeft size={14} />
          <span>Back to Course Workspace (CS504)</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-approved" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}>
            Syllabus Coverage: 68% (31/45 Lectures)
          </span>
        </div>
      </div>

      {/* Title & Action Buttons */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div className="page-title-row">
            <h1 className="page-title">Lesson Plan &amp; Academic Calendar</h1>
            <span className="badge badge-neutral" style={{ fontWeight: 600 }}>
              CS504: Artificial Intelligence (Core Theory • 4.0 Cr • Sec A)
            </span>
            <span className="badge badge-indigo">Semester V (Active)</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => alert('Import Plan: Upload structured lesson plan CSV/Excel to auto-populate lectures')}>
            <Upload size={14} />
            <span>Import Plan</span>
          </button>

          <button className="btn btn-outline btn-sm" onClick={() => alert('Lesson Plan & Delivery Schedule exported as PDF.')}>
            <Download size={14} />
            <span>Export Plan</span>
          </button>

          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)} id="btn-add-lecture">
            <Plus size={14} />
            <span>+ Add Lecture / Lesson</span>
          </button>
        </div>
      </div>

      {/* 5 Stat Metric Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {/* Planned Volume */}
        <div className="metric-card indigo">
          <div className="metric-header">
            <span className="metric-label">PLANNED VOLUME</span>
            <Calendar size={14} style={{ color: 'var(--text-light)' }} />
          </div>
          <div className="metric-val-row">
            <span className="metric-val">45</span>
            <span className="metric-unit">Lectures</span>
          </div>
          <div className="metric-desc">Mandatory AICTE / UGC guideline</div>
        </div>

        {/* Delivered to Date */}
        <div className="metric-card green">
          <div className="metric-header">
            <span className="metric-label">DELIVERED TO DATE</span>
            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
          </div>
          <div className="metric-val-row">
            <span className="metric-val" style={{ color: 'var(--success)' }}>31</span>
            <span className="metric-unit" style={{ color: 'var(--success)' }}>Conducted</span>
          </div>
          <div className="metric-desc" style={{ color: 'var(--success)' }}>On Schedule (Pacing: 100%)</div>
        </div>

        {/* Remaining Sessions */}
        <div className="metric-card blue">
          <div className="metric-header">
            <span className="metric-label">REMAINING SESSIONS</span>
            <Clock size={14} style={{ color: 'var(--info)' }} />
          </div>
          <div className="metric-val-row">
            <span className="metric-val">14</span>
            <span className="metric-unit">Remaining</span>
          </div>
          <div className="metric-desc">Est. Finish: Nov 28, 2026</div>
        </div>

        {/* Rescheduled / Buffer */}
        <div className="metric-card orange">
          <div className="metric-header">
            <span className="metric-label">RESCHEDULED / BUFFER</span>
            <RefreshCw size={14} style={{ color: 'var(--warning)' }} />
          </div>
          <div className="metric-val-row">
            <span className="metric-val">2</span>
            <span className="metric-unit">Sessions</span>
          </div>
          <div className="metric-desc">Reconciled with Mid-term break</div>
        </div>

        {/* Statutory Verification */}
        <div className="metric-card purple">
          <div className="metric-header">
            <span className="metric-label">STATUTORY VERIFICATION</span>
            <Award size={14} style={{ color: 'var(--purple)' }} />
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
            NBA Criterion 2.2 Compliant
          </div>
          <div className="metric-desc" style={{ marginTop: 'auto' }}>Bloom's Taxonomy mapping verified</div>
        </div>
      </div>

      {/* Main Grid: Left Table & Right Widgets Rail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Left Column: Lesson Plan Matrix */}
        <div>
          {/* Unit Pill Tabs */}
          <div className="pill-tabs" style={{ marginBottom: '1rem' }}>
            <button className={`pill-tab ${activeUnit === 'All' ? 'active' : ''}`} onClick={() => setActiveUnit('All')}>
              All Units (45)
            </button>
            <button className={`pill-tab ${activeUnit === 'Unit I' ? 'active' : ''}`} onClick={() => setActiveUnit('Unit I')}>
              Unit I: Foundations (8)
            </button>
            <button className={`pill-tab ${activeUnit === 'Unit II' ? 'active' : ''}`} onClick={() => setActiveUnit('Unit II')}>
              Unit II: Search (10)
            </button>
            <button className={`pill-tab ${activeUnit === 'Unit III' ? 'active' : ''}`} onClick={() => setActiveUnit('Unit III')}>
              Unit III: Knowledge Rep (9)
            </button>
            <button className={`pill-tab ${activeUnit === 'Unit IV' ? 'active' : ''}`} onClick={() => setActiveUnit('Unit IV')}>
              Unit IV: Probabilistic Reasoning (9)
            </button>
            <button className={`pill-tab ${activeUnit === 'Unit V' ? 'active' : ''}`} onClick={() => setActiveUnit('Unit V')}>
              Unit V: Learning (9)
            </button>
          </div>

          {/* Filter Toolbar */}
          <div className="card" style={{ padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="search-box" style={{ flex: 1, minWidth: '220px' }}>
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '130px', fontSize: '0.8rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Conducted">Conducted</option>
                <option value="Pending">Pending</option>
              </select>

              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '150px', fontSize: '0.8rem' }}
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
              >
                <option value="All">All Outcomes (CO1 - CO5)</option>
                <option value="CO4">CO4 Mapped</option>
                <option value="CO5">CO5 Mapped</option>
              </select>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                Range: <strong>Full Semester (Aug 01 - Dec 10, 2026)</strong>
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '55px' }}>L NO</th>
                    <th style={{ width: '65px' }}>UNIT</th>
                    <th>TOPIC &amp; PEDAGOGICAL FOCUS</th>
                    <th>PLANNED</th>
                    <th>CONDUCTED</th>
                    <th>OUTCOME / BLOOM</th>
                    <th>TEACHING AID / MODE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLectures.map(lec => (
                    <tr key={lec.no}>
                      {/* L No */}
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {lec.no}
                        </span>
                      </td>

                      {/* Unit */}
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {lec.unit}
                        </span>
                      </td>

                      {/* Topic & Pedagogical Focus */}
                      <td>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {lec.topic}
                            </span>
                            {lec.isNext && (
                              <span className="badge badge-indigo" style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem' }}>
                                NEXT
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {lec.subtopic}
                          </div>
                        </div>
                      </td>

                      {/* Planned Date */}
                      <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {lec.planned}
                      </td>

                      {/* Conducted Date */}
                      <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {lec.conducted ? (
                          <span style={{ color: lec.conducted.includes('Resched') ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                            {lec.conducted}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-light)' }}>—</span>
                        )}
                      </td>

                      {/* Outcome / Bloom */}
                      <td>
                        <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                          {lec.outcome}
                        </span>
                      </td>

                      {/* Teaching Aid / Mode */}
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {lec.mode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div>
                Showing <strong>29–38</strong> of <strong>45 Lectures</strong> • Batch: CSE-3A (Morning)
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button className="btn btn-outline btn-sm">&lt; Previous</button>
                <button className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>4/5</button>
                <button className="btn btn-outline btn-sm">Next &gt;</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Upcoming Lectures Widget */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Upcoming Lectures (Next 7 Days)</h3>
              </div>
              <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>2 Scheduled</span>
            </div>

            <div className="card-body" style={{ padding: '1rem' }}>
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  <span>TOMORROW • 10:15 AM</span>
                  <span style={{ color: 'var(--text-muted)' }}>Hall LH-302</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Lecture L-32: Approximate Inference in Bayesian Networks
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Outcome: <strong>CO4 (K4)</strong> • Mode: <strong>PgmPy Live Demo</strong>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '0.75rem' }}
                  onClick={handleQuickLog}
                  disabled={quickDelivered}
                  id="btn-quick-log-delivery"
                >
                  <Check size={14} />
                  <span>{quickDelivered ? 'Delivery Logged!' : '⚡ Quick Log Delivery'}</span>
                </button>
              </div>

              <div style={{ padding: '0.65rem 0.85rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Mon, Nov 02 - 02:00 PM • L-33
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Intro to Machine Learning: Supervised vs Unsupervised
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Unit V • Foundations • CO5 (K3)
                </div>
              </div>
            </div>
          </div>

          {/* Academic Milestones */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ padding: '0.85rem 1rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Academic Milestones</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ODD SEM '26</span>
            </div>
            <div className="card-body" style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '38px', textAlign: 'center', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-sm)', padding: '0.2rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700 }}>OCT</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>30</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>CIA-II Marks Portal Closes</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Continuous Internal Assessment lock</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '38px', textAlign: 'center', background: '#eff6ff', color: '#1e40af', borderRadius: 'var(--radius-sm)', padding: '0.2rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700 }}>NOV</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>05</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Mid-Semester Syllabus Audit</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>IQAC Inspection of Course Files</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '38px', textAlign: 'center', background: '#f5f3ff', color: '#5b21b6', borderRadius: 'var(--radius-sm)', padding: '0.2rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700 }}>NOV</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>20</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Lab Practical Submissions</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Final viva sign-offs</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '38px', textAlign: 'center', background: '#f8fafc', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.2rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700 }}>NOV</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>28</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Last Instructional Day</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Course File Freeze &amp; Sign-off</div>
                </div>
              </div>
            </div>
          </div>

          {/* Syllabus Drift Advisory */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#92400e', fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.35rem' }}>
              <AlertTriangle size={15} />
              <span>Syllabus Drift Advisory</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#78350f', lineHeight: 1.4 }}>
              Lecture <strong>L-31</strong> was rescheduled by +2 days due to the College Symposium. A compensatory buffer lecture slot is open on <strong>Saturday, Nov 08</strong> to ensure parity with Section B.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.72rem' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Parity reconciled with Section B.'); }} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Reconcile with Section B
              </a>
              <span style={{ color: 'var(--text-muted)' }}>Parity: <strong>97.4%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Lecture Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Add New Scheduled Lecture</h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddLecture}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Syllabus Unit</label>
                  <select
                    className="form-select"
                    value={newLecture.unit}
                    onChange={(e) => setNewLecture({ ...newLecture, unit: e.target.value })}
                  >
                    <option value="Unit IV">Unit IV: Probabilistic Reasoning</option>
                    <option value="Unit V">Unit V: Machine Learning</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Topic Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Reinforcement Learning: Q-Learning Algorithm"
                    value={newLecture.topic}
                    onChange={(e) => setNewLecture({ ...newLecture, topic: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pedagogical Subtopics</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. State-action value functions, exploration vs exploitation"
                    value={newLecture.subtopic}
                    onChange={(e) => setNewLecture({ ...newLecture, subtopic: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Planned Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newLecture.plannedDate}
                      onChange={(e) => setNewLecture({ ...newLecture, plannedDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Outcome / Bloom Level</label>
                    <select
                      className="form-select"
                      value={newLecture.outcome}
                      onChange={(e) => setNewLecture({ ...newLecture, outcome: e.target.value })}
                    >
                      <option value="CO4 - K4">CO4 - K4 (Analyze)</option>
                      <option value="CO5 - K3">CO5 - K3 (Apply)</option>
                      <option value="CO5 - K4">CO5 - K4 (Analyze)</option>
                      <option value="CO5 - K5">CO5 - K5 (Evaluate)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Teaching Aid / Mode</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chalk & Board + Interactive Python Colab"
                    value={newLecture.mode}
                    onChange={(e) => setNewLecture({ ...newLecture, mode: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default LessonPlanCalendar;
