import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';
import { Download, Search } from 'lucide-react';

const categories = [
  'All',
  'Syllabus',
  'Lesson Plan',
  'Lecture Notes',
  'Question Papers',
  'Sample Answers',
  'Attendance',
  'Assessment Records',
  'Feedback',
  'Assignments'
];

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [courseCode, setCourseCode] = useState('');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/student/courses')
      .then(data => setCourses(data.courses || []))
      .catch(err => setError(err.message || 'Could not load enrolled courses.'));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (courseCode) params.set('course_code', courseCode);
    if (category !== 'All') params.set('category', category);
    if (search.trim()) params.set('search', search.trim());

    api.get(`/api/student/documents?${params.toString()}`)
      .then(data => {
        if (active) setDocuments(data.documents || []);
      })
      .catch(err => {
        if (active) setError(err.message || 'Could not load course files.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [courseCode, category, search]);

  return (
    <AppLayout breadcrumbs={[{ label: 'My Course Files' }]}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 className="page-title">My Course Files</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Browse files shared by faculty for courses you are enrolled in.
        </p>
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '220px' }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              type="search"
              placeholder="Search files, courses, or categories"
              value={search}
              onChange={event => setSearch(event.target.value)}
              aria-label="Search course files"
            />
          </div>
          <select
            className="form-select"
            value={courseCode}
            onChange={event => setCourseCode(event.target.value)}
            aria-label="Filter by course"
          >
            <option value="">All enrolled courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.code}>{course.code} — {course.name}</option>
            ))}
          </select>
          <select
            className="form-select"
            value={category}
            onChange={event => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            {categories.map(item => <option key={item} value={item}>{item === 'All' ? 'All categories' : item}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="card" role="alert" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading course files...</p>
        ) : documents.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No files found for these filters.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Uploaded</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(document => (
                  <tr key={document.id}>
                    <td>{document.original_name}</td>
                    <td>{document.course_code} — {document.course_name}</td>
                    <td>{document.category}</td>
                    <td>{document.created_at}</td>
                    <td>
                      <a className="btn btn-outline btn-sm" href={document.filepath} download={document.original_name}>
                        <Download size={14} /> Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;
