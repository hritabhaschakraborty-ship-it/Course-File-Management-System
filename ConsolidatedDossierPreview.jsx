import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppLayout from '../../components/AppLayout';
import {
  ArrowLeft, Printer, Download, CheckCircle2,
  GraduationCap, FileText, Award, Calendar, BookOpen
} from 'lucide-react';

export const ConsolidatedDossierPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id || 4;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/faculty/course/${courseId}/consolidated`);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDossier();
  }, [courseId]);

  const breadcrumbs = [
    { label: 'Academic Operations', path: '/faculty' },
    { label: 'Faculty Workspace', path: '/faculty' },
    { label: 'Course Workspace (CS504)', path: `/faculty/course/${courseId}` },
    { label: 'Consolidated Course File Dossier', path: `/faculty/course/${courseId}/preview` }
  ];

  const handlePrint = () => {
    window.print();
  };

  const meta = data?.metadata || {
    code: 'CS504',
    name: 'Artificial Intelligence',
    department: 'Computer Science & Engineering',
    semester: 'Semester V',
    academic_year: '2026-27',
    credits: 4.0,
    ltp: '3-1-0',
    section: 'Sec A',
    course_type: 'Core Theory',
    regulation: 'R-2022',
    faculty_name: 'Dr. Aris Thorne',
    reviewer_name: 'Dr. Rajesh Kulkarni'
  };

  const components = data?.components || [];
  const marksSummary = data?.marksSummary || { totalStudents: 62, averageScore: 37.4, maxScore: 50 };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {/* Top Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/faculty/course/${courseId}`)}
          id="btn-back-workspace"
        >
          <ArrowLeft size={14} />
          <span>Back to Course Workspace</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={handlePrint} id="btn-print-dossier">
            <Printer size={14} />
            <span>Print Dossier</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint} id="btn-download-pdf">
            <Download size={14} />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Course File Dossier Document View */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          padding: '3rem',
          maxWidth: '960px',
          margin: '0 auto',
          color: '#0f172a'
        }}
      >
        {/* Document Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <GraduationCap size={32} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              University Faculty of Engineering &amp; Technology
            </span>
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.75rem' }}>
            CONSOLIDATED STATUTORY COURSE FILE DOSSIER
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Academic Session: {meta.academic_year} • Semester: {meta.semester} • Regulation {meta.regulation}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="badge badge-approved" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
              NBA Tier-I &amp; NAAC Criterion 2.6 Statutory Compliance
            </span>
          </div>
        </div>

        {/* 1. Course Metadata Table */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
            1. COURSE INFORMATION &amp; FACULTY DETAILS
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700, width: '25%', background: '#f8fafc' }}>Course Code &amp; Title:</td>
                <td style={{ padding: '0.5rem', width: '25%' }}>{meta.code} - {meta.name}</td>
                <td style={{ padding: '0.5rem', fontWeight: 700, width: '25%', background: '#f8fafc' }}>Course Category:</td>
                <td style={{ padding: '0.5rem', width: '25%' }}>{meta.course_type}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f8fafc' }}>Credits &amp; Structure:</td>
                <td style={{ padding: '0.5rem' }}>{meta.credits} Credits (L-T-P: {meta.ltp})</td>
                <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f8fafc' }}>Cohort / Section:</td>
                <td style={{ padding: '0.5rem' }}>Section A (62 Students)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f8fafc' }}>Course Instructor:</td>
                <td style={{ padding: '0.5rem' }}>{meta.faculty_name}</td>
                <td style={{ padding: '0.5rem', fontWeight: 700, background: '#f8fafc' }}>Department HOD / Reviewer:</td>
                <td style={{ padding: '0.5rem' }}>{meta.reviewer_name}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Statutory Components Index */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
            2. STATUTORY COURSE FILE MATRIX INDEX (15 ITEMS)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', width: '40px' }}>#</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Component Title</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', width: '110px' }}>Type</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', width: '110px' }}>Status</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', width: '100px' }}>Review Date</th>
              </tr>
            </thead>
            <tbody>
              {components.map((comp, idx) => (
                <tr key={comp.id || idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.45rem 0.5rem', fontWeight: 700 }}>{comp.item_index || idx + 1}</td>
                  <td style={{ padding: '0.45rem 0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{comp.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{comp.notes}</div>
                  </td>
                  <td style={{ padding: '0.45rem 0.5rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{comp.type}</span>
                  </td>
                  <td style={{ padding: '0.45rem 0.5rem' }}>
                    <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>{comp.status}</span>
                  </td>
                  <td style={{ padding: '0.45rem 0.5rem', color: 'var(--text-muted)' }}>{comp.review_date || 'Oct 2026'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. CIA Assessment & Attendance Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
            3. ASSESSMENT PERFORMANCE &amp; BELL CURVE ANALYSIS
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Students Evaluated</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{marksSummary.totalStudents}</div>
            </div>
            <div style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mean Internal Score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>37.4 / 50.0</div>
            </div>
            <div style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class Clearance Ratio</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>93.1%</div>
            </div>
          </div>
        </div>

        {/* 4. CO-PO Attainment Statement */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
            4. OUTCOME-BASED EDUCATION (OBE) DIRECT ATTAINMENT
          </h3>
          <div style={{ padding: '0.85rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Target Direct Attainment Benchmark: <strong>70.0%</strong></span>
              <span>Composite Cohort Attainment: <strong style={{ color: 'var(--success)' }}>75.1% (TARGET MET)</strong></span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4 }}>
              Direct course attainment computed from Continuous Internal Assessment (30%), practical rubrics (20%), and Semester End Examinations (50%). 5 of 6 Course Outcomes successfully exceeded the target attainment threshold.
            </p>
          </div>
        </div>

        {/* 5. Statutory Signatures Block */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', paddingTop: '2rem', borderTop: '2px solid var(--border-light)', textAlign: 'center', fontSize: '0.8rem' }}>
          <div>
            <div style={{ height: '40px' }}></div>
            <div style={{ fontWeight: 700, borderTop: '1px solid #0f172a', paddingTop: '0.5rem' }}>
              Dr. Aris Thorne
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Course Instructor</div>
          </div>

          <div>
            <div style={{ height: '40px' }}></div>
            <div style={{ fontWeight: 700, borderTop: '1px solid #0f172a', paddingTop: '0.5rem' }}>
              Dr. Rajesh Kulkarni
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HOD / Reviewer</div>
          </div>

          <div>
            <div style={{ height: '40px' }}></div>
            <div style={{ fontWeight: 700, borderTop: '1px solid #0f172a', paddingTop: '0.5rem' }}>
              Director, IQAC
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Institutional Quality Cell</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ConsolidatedDossierPreview;
