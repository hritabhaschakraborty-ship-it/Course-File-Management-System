import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import {
  ArrowLeft, Download, RefreshCw, Edit3, CheckCircle2,
  AlertTriangle, FileText, BarChart3, Award, Check
} from 'lucide-react';

export const CopoAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id || 4;

  const [isEditing, setIsEditing] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [recalcSuccess, setRecalcSuccess] = useState(false);

  // Initial Matrix Data matching Screenshot 3
  const initialCoRows = [
    {
      code: 'CO1',
      desc: 'Understand foundational principles of AI & uninformed/informed search...',
      bloom: 'K2 (Understand)',
      mappings: { PO1: 3, PO2: 2, PO3: 1, PO4: null, PO5: null, PO6: null, PO7: null, PO8: 1, PO9: null, PO10: null, PO11: null, PO12: 2, PSO1: 2, PSO2: 1 },
      direct: 78.2,
      target: 70.0,
      cia: 81.0,
      assgn: 84.5,
      endsem: 75.2
    },
    {
      code: 'CO2',
      desc: 'Formulate heuristic state-space search algorithms (A*, IDA+, Game)...',
      bloom: 'K3 (Apply)',
      mappings: { PO1: 3, PO2: 3, PO3: 2, PO4: 2, PO5: null, PO6: null, PO7: null, PO8: null, PO9: null, PO10: null, PO11: null, PO12: 3, PSO1: 2, PSO2: 1 },
      direct: 73.5,
      target: 70.0,
      cia: 74.5,
      assgn: 78.0,
      endsem: 70.0
    },
    {
      code: 'CO3',
      desc: 'Model complex domain knowledge using first-order logic & Bayesian...',
      bloom: 'K4 (Analyze)',
      mappings: { PO1: 3, PO2: 3, PO3: 3, PO4: 2, PO5: null, PO6: null, PO7: null, PO8: 1, PO9: null, PO10: null, PO11: null, PO12: null, PSO1: 3, PSO2: 2 },
      direct: 76.4,
      target: 70.0,
      cia: 79.0,
      assgn: 82.0,
      endsem: 73.7
    },
    {
      code: 'CO4',
      desc: 'Implement probabilistic inference and exact/approximate belief...',
      bloom: 'K4 (Analyze)',
      mappings: { PO1: 3, PO2: 3, PO3: 2, PO4: 2, PO5: null, PO6: null, PO7: null, PO8: null, PO9: 2, PO10: null, PO11: null, PO12: null, PSO1: 3, PSO2: 2 },
      direct: 72.8,
      target: 70.0,
      cia: 75.5,
      assgn: 75.0,
      endsem: 69.5
    },
    {
      code: 'CO5',
      desc: 'Design and evaluate supervised & unsupervised learning models on...',
      bloom: 'K5 (Evaluate)',
      mappings: { PO1: 3, PO2: 3, PO3: 3, PO4: 3, PO5: 3, PO6: null, PO7: null, PO8: 1, PO9: 2, PO10: 1, PO11: null, PO12: null, PSO1: 3, PSO2: 3 },
      direct: 68.2, // Below 70% threshold!
      target: 70.0,
      cia: 68.5,
      assgn: 73.0,
      endsem: 66.0
    },
    {
      code: 'CO6',
      desc: 'Formulate Markov Decision Processes and Reinforcement...',
      bloom: 'K4 (Analyze)',
      mappings: { PO1: 3, PO2: 3, PO3: 2, PO4: 2, PO5: null, PO6: null, PO7: null, PO8: null, PO9: null, PO10: null, PO11: null, PO12: 2, PSO1: 3, PSO2: 2 },
      direct: 77.0,
      target: 70.0,
      cia: 80.5,
      assgn: 83.0,
      endsem: 73.4
    }
  ];

  const [coRows, setCoRows] = useState(initialCoRows);

  const pos = ['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12', 'PSO1', 'PSO2'];

  const handleCellChange = (coIndex, po, val) => {
    const num = parseInt(val);
    const updated = [...coRows];
    updated[coIndex].mappings[po] = isNaN(num) || num === 0 ? null : Math.min(3, Math.max(1, num));
    setCoRows(updated);
  };

  const handleRecalculate = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
      setRecalcSuccess(true);
      setTimeout(() => setRecalcSuccess(false), 3000);
    }, 600);
  };

  // Compute PO column averages
  const poAverages = {};
  pos.forEach(po => {
    const values = coRows.map(r => r.mappings[po]).filter(v => v !== null);
    if (values.length > 0) {
      poAverages[po] = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    } else {
      poAverages[po] = '—';
    }
  });

  const breadcrumbs = [
    { label: 'Academic Operations', path: '/faculty' },
    { label: 'Faculty Workspace', path: '/faculty' },
    { label: 'CS504: Artificial Intelligence', path: `/faculty/course/${courseId}` },
    { label: 'Assessments & Marks', path: `/faculty/course/${courseId}/assessments` },
    { label: 'CO–PO Mapping & Attainment', path: `/faculty/course/${courseId}/copo` }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {/* Back button & SAR reference */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/faculty/course/${courseId}`)}
          id="btn-back-to-course"
        >
          <ArrowLeft size={14} />
          <span>Back to Course Workspace (CS504)</span>
        </button>

        <span className="badge badge-approved" style={{ fontSize: '0.75rem' }}>
          NBA Self-Assessment Report (SAR) Tier-I • Criterion 3 Compliant
        </span>
      </div>

      {/* Title & Actions */}
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <div className="page-title-row">
            <h1 className="page-title">CO–PO Mapping &amp; Attainment Analytics</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">OBE Framework v2.4</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>CS504: Artificial Intelligence</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Core Theory • 4.0 Credits • Sec A</span>
            <span className="badge badge-neutral">Semester V (Active)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NBA Tier-I Accredited / Outcome Based Education (OBE)</span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setIsEditing(!isEditing)}
            id="btn-edit-mapping"
          >
            <Edit3 size={14} />
            <span>{isEditing ? 'Done Editing' : 'Edit Mapping Matrix'}</span>
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={handleRecalculate}
            disabled={recalculating}
            id="btn-recalculate-attainment"
          >
            <RefreshCw size={14} className={recalculating ? 'spin' : ''} />
            <span>{recalculating ? 'Computing...' : 'Recalculate Attainment'}</span>
          </button>

          <button className="btn btn-primary btn-sm" onClick={() => alert('Exporting SAR Tier-I Attainment Report (PDF/Excel)...')}>
            <Download size={14} />
            <span>Export Attainment Report (PDF/Excel)</span>
          </button>
        </div>
      </div>

      {recalcSuccess && (
        <div className="alert-banner success" style={{ marginBottom: '1rem' }}>
          <CheckCircle2 size={16} />
          <span>Attainment matrices re-computed across all 6 Course Outcomes. Composite index verified: 75.1%.</span>
        </div>
      )}

      {/* 5 KPI Metric Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.25rem' }}>
        <div className="metric-card indigo">
          <div className="metric-header"><span className="metric-label">Course Outcomes</span></div>
          <div className="metric-val-row"><span className="metric-val">6 Defined</span></div>
          <div className="metric-desc">CO1 to CO6 • Bloom's R1-K5</div>
        </div>

        <div className="metric-card purple">
          <div className="metric-header"><span className="metric-label">Target Outcomes</span></div>
          <div className="metric-val-row"><span className="metric-val">12 PO + 2 PSO</span></div>
          <div className="metric-desc">NBA Graduate Attributes</div>
        </div>

        <div className="metric-card green">
          <div className="metric-header"><span className="metric-label">Direct Attainment</span></div>
          <div className="metric-val-row"><span className="metric-val" style={{ color: 'var(--success)' }}>74.2%</span></div>
          <div className="metric-desc" style={{ color: 'var(--success)' }}>5 of 6 COs Threshold Met</div>
        </div>

        <div className="metric-card blue">
          <div className="metric-header"><span className="metric-label">Indirect Attainment</span></div>
          <div className="metric-val-row"><span className="metric-val" style={{ color: 'var(--info)' }}>78.5%</span></div>
          <div className="metric-desc">Course Exit + Alumni Survey</div>
        </div>

        <div className="metric-card green">
          <div className="metric-header"><span className="metric-label">Composite Attainment</span></div>
          <div className="metric-val-row">
            <span className="metric-val" style={{ color: 'var(--success)' }}>75.1%</span>
            <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>TARGET MET</span>
          </div>
          <div className="metric-desc">80% Direct + 20% Indirect</div>
        </div>

        <div className="metric-card indigo">
          <div className="metric-header"><span className="metric-label">Statutory Status</span></div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
            ✓ Approved by BoS
          </div>
          <div className="metric-desc" style={{ marginTop: 'auto' }}>Audited for NBA Criterion 3</div>
        </div>
      </div>

      {/* Mapping Correlation Scale Legend */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Mapping Correlation Scale:</strong>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ background: 'var(--primary)', color: '#fff', width: '18px', height: '18px', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem' }}>3</span> Substantial / High (***)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ background: '#818cf8', color: '#fff', width: '18px', height: '18px', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem' }}>2</span> Moderate / Medium (**)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ background: '#c7d2fe', color: '#1e1b4b', width: '18px', height: '18px', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem' }}>1</span> Slight / Low (*)
          </span>
          <span style={{ color: 'var(--text-muted)' }}>—: No Correlation</span>
        </div>

        <div style={{ color: 'var(--text-muted)' }}>
          Direct Threshold: <strong>70.0%</strong> • Matrix Status: <strong style={{ color: 'var(--success)' }}>Locked &amp; Signed</strong>
        </div>
      </div>

      {/* Table 3.1: CO-PO-PSO Articulation Matrix */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header" style={{ padding: '0.85rem 1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              Table 3.1: CO–PO–PSO Articulation Matrix <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>NBA Criterion 3.1</span>
            </h3>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th style={{ minWidth: '220px' }}>Course Outcome (CO) &amp; Description</th>
                {pos.map(po => (
                  <th key={po} style={{ textAlign: 'center', width: '38px', padding: '0.5rem 0.25rem', color: po.startsWith('PSO') ? 'var(--primary)' : 'inherit' }}>
                    {po}
                  </th>
                ))}
                <th style={{ textAlign: 'right', minWidth: '90px' }}>Direct Attainment</th>
              </tr>
            </thead>
            <tbody>
              {coRows.map((co, cIdx) => {
                const isMet = co.direct >= co.target;

                return (
                  <tr key={co.code}>
                    {/* CO Description */}
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{co.code}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{co.desc}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '2px' }}>Bloom: {co.bloom}</div>
                      </div>
                    </td>

                    {/* Matrix Cells */}
                    {pos.map(po => {
                      const val = co.mappings[po];

                      return (
                        <td key={po} style={{ textAlign: 'center', padding: '0.5rem 0.25rem' }}>
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="3"
                              value={val !== null ? val : ''}
                              onChange={(e) => handleCellChange(cIdx, po, e.target.value)}
                              style={{ width: '28px', textAlign: 'center', border: '1px solid var(--border-light)', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 700 }}
                            />
                          ) : val === 3 ? (
                            <span style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: 4, background: 'var(--primary)', color: '#fff', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>3</span>
                          ) : val === 2 ? (
                            <span style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: 4, background: '#818cf8', color: '#fff', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>2</span>
                          ) : val === 1 ? (
                            <span style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: 4, background: '#e0e7ff', color: 'var(--primary)', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>1</span>
                          ) : (
                            <span style={{ color: 'var(--text-light)' }}>—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Direct Attainment Column */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: isMet ? 'var(--success)' : 'var(--danger)' }}>
                        {co.direct}%
                      </div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: isMet ? 'var(--success)' : 'var(--danger)' }}>
                        {isMet ? 'MET (>=70%)' : 'NOT MET (-1.8%)'}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Summary Average Row */}
              <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                <td>Average CO Mapping Correlation (1-3)</td>
                {pos.map(po => (
                  <td key={po} style={{ textAlign: 'center', fontSize: '0.75rem', color: poAverages[po] !== '—' ? 'var(--primary)' : 'var(--text-light)' }}>
                    {poAverages[po]}
                  </td>
                ))}
                <td style={{ textAlign: 'right', fontWeight: 800 }}>Avg: 74.2%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Bottom Layout: Continuous Assessment Breakdown + Target vs Achieved Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left: Continuous Assessment Breakdown Table */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header" style={{ padding: '0.85rem 1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Continuous Assessment Breakdown (Direct)</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Weights: CIA (30%) + Assgn (20%) + EndSem (50%)</span>
          </div>

          <div className="table-responsive">
            <table className="data-table" style={{ fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th>Course Outcome</th>
                  <th>Target</th>
                  <th>CIA-I/II (30%)</th>
                  <th>Assignments (20%)</th>
                  <th>End-Sem / Lab (50%)</th>
                  <th>Final Direct</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {coRows.map(co => (
                  <tr key={co.code}>
                    <td style={{ fontWeight: 600 }}>{co.code}: {co.desc.substring(0, 18)}...</td>
                    <td>{co.target}%</td>
                    <td>{co.cia}%</td>
                    <td>{co.assgn}%</td>
                    <td>{co.endsem}%</td>
                    <td style={{ fontWeight: 800, color: co.direct >= co.target ? 'var(--success)' : 'var(--danger)' }}>
                      {co.direct}%
                    </td>
                    <td>
                      <span className={`badge ${co.direct >= co.target ? 'badge-approved' : 'badge-returned'}`} style={{ fontSize: '0.65rem' }}>
                        {co.direct >= co.target ? 'Target Met' : 'Remedial Action'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Target vs Achieved Direct Attainment Chart */}
        <div className="card" style={{ marginBottom: 0, padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Target vs. Achieved Direct Attainment</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Benchmark: <strong>70.0%</strong></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {coRows.map(co => {
              const isMet = co.direct >= co.target;

              return (
                <div key={co.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600 }}>{co.code}: {co.desc.substring(0, 22)}...</span>
                    <strong style={{ color: isMet ? 'var(--primary)' : 'var(--danger)' }}>{co.direct}%</strong>
                  </div>
                  <div className="progress-track" style={{ height: '8px', position: 'relative' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${co.direct}%`,
                        backgroundColor: isMet ? 'var(--primary)' : 'var(--danger)'
                      }}
                    ></div>
                    {/* 70% threshold mark */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '70%',
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        backgroundColor: '#0f172a',
                        zIndex: 2
                      }}
                      title="Threshold: 70%"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1rem', padding: '0.65rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            ✓ Department criteria satisfied: Minimum 80% of course outcomes achieved target attainment index.
          </div>
        </div>
      </div>

      {/* Statutory Endorsement & Footers */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Calculation Methodology &amp; Statutory Framework Note
        </h4>
        <p style={{ lineHeight: 1.5, color: 'var(--text-muted)' }}>
          CO attainment computation adheres strictly to the AICTE / National Board of Accreditation (NBA) Examination Reform Guidelines, under Criterion 3. Direct attainment is calculated from Internal Continuous Assessment (CIA-I, CIA-II, and continuous practical rubrics with 50% aggregate weightage) alongside Semester End Examinations (50% weightage). The departmental attainment threshold is codified at 70% of registered students scoring &gt;=60% core composite marks.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            Signed by: <strong>Dr. Aris Thorne</strong> (Course Instructor) • HOD Verification: <strong>Prof. M. R. Varma, Ph.D.</strong> • Date: Oct 24, 2026
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline btn-sm" onClick={() => alert('Attainment Dossier downloaded.')}>
              <Download size={13} />
              <span>Download Attainment Dossier (.pdf)</span>
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => alert('NBA Criterion 3 Excel Sheet exported.')}>
              <Download size={13} />
              <span>Export NBA Criterion 3 Excel Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CopoAnalytics;
