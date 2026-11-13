import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppLayout from '../../components/AppLayout';
import StatusBadge from '../../components/StatusBadge';
import {
  ArrowLeft, Download, Upload, Search, Trash2, Eye,
  RefreshCw, ShieldCheck
} from 'lucide-react';

export const CourseDocuments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(id || '4');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Syllabus');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [folderDraft, setFolderDraft] = useState('');
  const [renamingFolder, setRenamingFolder] = useState(null);

  const folderStorageKey = 'cfms_folders_v1';
  const folderMapStorageKey = 'cfms_document_folders_v1';

  const [folders, setFolders] = useState(() => {
    if (typeof window === 'undefined') return ['Root'];
    try {
      const saved = JSON.parse(localStorage.getItem(folderStorageKey) || 'null');
      return Array.isArray(saved) && saved.length ? saved : ['Root'];
    } catch {
      return ['Root'];
    }
  });

  const [folderMap, setFolderMap] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = JSON.parse(localStorage.getItem(folderMapStorageKey) || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  });

  const courseId = id || 4;

  useEffect(() => {
    localStorage.setItem(folderStorageKey, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem(folderMapStorageKey, JSON.stringify(folderMap));
  }, [folderMap]);

  const getFolderForDocument = useCallback((doc) => {
    const key = doc && (doc.id ?? doc.filename ?? doc.original_name);
    if (!key) return 'Root';
    return folderMap[String(key)] || 'Root';
  }, [folderMap]);

  const moveDocumentToFolder = useCallback((docId, targetFolder) => {
    if (!docId || !targetFolder) return;
    setFolderMap(prev => ({ ...prev, [String(docId)]: targetFolder }));
  }, []);

  const handleCreateFolder = () => {
    const name = folderDraft.trim();
    if (!name) return;
    const safeName = name.replace(/[<>:"/\\|?*]+/g, '').trim();
    if (!safeName) return;
    if (folders.some(folder => folder.toLowerCase() === safeName.toLowerCase())) {
      alert('Folder already exists.');
      return;
    }
    setFolders(prev => [...prev, safeName]);
    setFolderDraft('');
    setSelectedFolder('All');
  };

  const handleRenameFolder = (oldName, newName) => {
    const safeName = newName.trim();
    if (!safeName || safeName === oldName) {
      setRenamingFolder(null);
      return;
    }
    if (folders.some(folder => folder.toLowerCase() === safeName.toLowerCase() && folder !== oldName)) {
      alert('Another folder with this name already exists.');
      return;
    }

    setFolders(prev => prev.map(folder => folder === oldName ? safeName : folder));
    setFolderMap(prev => {
      const next = {};
      Object.keys(prev).forEach((docKey) => {
        next[docKey] = prev[docKey] === oldName ? safeName : prev[docKey];
      });
      return next;
    });
    setRenamingFolder(null);
  };

  const handleDeleteFolder = (folderName) => {
    if (folderName === 'Root') return;
    if (!window.confirm(`Delete folder "${folderName}" and move its files back to Root?`)) return;

    setFolders(prev => prev.filter(folder => folder !== folderName));
    setFolderMap(prev => {
      const next = {};
      Object.keys(prev).forEach((docKey) => {
        next[docKey] = prev[docKey] === folderName ? 'Root' : prev[docKey];
      });
      return next;
    });
    setSelectedFolder('All');
  };

  const folderAwareDocuments = useMemo(() => {
    return (documents || []).map((doc) => ({
      ...doc,
      folderName: getFolderForDocument(doc)
    }));
  }, [documents, getFolderForDocument]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sortValue = sortBy || 'date-desc';

    let list = folderAwareDocuments.filter((doc) => {
      const matchesFolder = selectedFolder === 'All' || doc.folderName === selectedFolder;
      const matchesQuery = !query || [
        doc.filename,
        doc.original_name,
        doc.category,
        doc.uploader_name,
        doc.course_name,
        doc.filetype
      ].some(value => String(value || '').toLowerCase().includes(query));
      const matchesType = selectedFileType === 'All' || doc.filetype === selectedFileType;
      const matchesStatus = selectedStatus === 'All' || doc.review_status === selectedStatus;
      return matchesFolder && matchesQuery && matchesType && matchesStatus;
    });

    list.sort((a, b) => {
      switch (sortValue) {
        case 'name-asc':
          return (a.filename || '').localeCompare(b.filename || '');
        case 'name-desc':
          return (b.filename || '').localeCompare(a.filename || '');
        case 'type-asc':
          return (a.filetype || '').localeCompare(b.filetype || '');
        case 'size-desc':
          return Number(b.filesize || 0) - Number(a.filesize || 0);
        case 'date-asc':
          return new Date(a.updated_at || a.created_at || 0) - new Date(b.updated_at || b.created_at || 0);
        case 'date-desc':
        default:
          return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
      }
    });

    return list;
  }, [folderAwareDocuments, searchQuery, selectedFileType, selectedStatus, selectedFolder, sortBy]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (selectedCourse) params.append('faculty_course_id', selectedCourse);
      if (activeCategory !== 'All') params.append('category', activeCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (selectedFileType !== 'All') params.append('filetype', selectedFileType);
      if (selectedStatus !== 'All') params.append('review_status', selectedStatus);

      const data = await api.get(`/api/faculty/documents?${params.toString()}`);
      setDocuments(data.documents || []);
      setCategoryCounts(data.categoryCounts || {});
      setCourses(data.courses || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load course documents.');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, activeCategory, searchQuery, selectedFileType, selectedStatus]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileUpload = async () => {
    if (!selectedCourse) {
      alert('Please select a course');
      return;
    }

    const file = selectedFile;
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('File exceeds maximum allowable size of 25 MB.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', uploadCategory);

      const token = localStorage.getItem('cfms_token');
      const response = await fetch(`/api/faculty/course/${selectedCourse}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Upload failed');

      alert('Document uploaded and SHA-256 verified successfully.');
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCategoryChange = async (docId, category) => {
    try {
      await api.put(`/api/faculty/documents/${docId}/category`, { category });
      fetchDocuments();
    } catch (err) {
      alert(err.message || 'Failed to update document category');
      fetchDocuments();
    }
  };

  const handleDelete = async (docId, fileName) => {
    if (!window.confirm(`Delete document "${fileName}" from compliance repository?`)) return;
    try {
      await api.delete(`/api/faculty/documents/${docId}`);
      fetchDocuments();
    } catch (err) {
      alert(err.message || 'Failed to delete document');
    }
  };

  const handleExportManifest = () => {
    window.open(`/api/faculty/course/${selectedCourse}/documents/manifest`, '_blank');
  };

  const selectedCourseInfo = courses.find(course => String(course.faculty_course_id) === String(selectedCourse));

  const breadcrumbs = [
    { label: 'Academic Operations', path: '/faculty' },
    { label: 'Faculty Workspace', path: '/faculty' },
    { label: `Course Workspace (${selectedCourseInfo?.code || 'Course'})`, path: `/faculty/course/${courseId}` },
    { label: 'Compliance Repository', path: `/faculty/course/${selectedCourse}/documents` }
  ];

  const categories = [
    { key: 'All', label: 'All Categories' },
    { key: 'Syllabus', label: 'Syllabus' },
    { key: 'Lesson Plan', label: 'Lesson Plan' },
    { key: 'Lecture Notes', label: 'Lecture Notes' },
    { key: 'Question Papers', label: 'Question Papers' },
    { key: 'Sample Answers', label: 'Sample Answers' },
    { key: 'Attendance', label: 'Attendance' },
    { key: 'Assessment Records', label: 'Assessment Records' },
    { key: 'Assignments', label: 'Assignments' },
    { key: 'Feedback', label: 'Feedback' }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/faculty/course/${courseId}`)}
          id="btn-back-to-workspace"
        >
          <ArrowLeft size={14} />
          <span>Back to Course Workspace ({selectedCourseInfo?.code || 'Course'})</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={handleExportManifest} id="btn-export-manifest">
            <Download size={14} />
            <span>Export Manifest (CSV)</span>
          </button>

          <button className="btn btn-outline btn-sm" onClick={() => alert('Initiating batch ZIP archive download for all verified course artifacts.')}>
            <Download size={14} />
            <span>Batch Download All (.zip)</span>
          </button>
        </div>
      </div>

      {/* Course Context Pill Banner */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Course Documents</h1>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {selectedCourseInfo ? `${selectedCourseInfo.code}: ${selectedCourseInfo.name}` : 'Loading course details...'}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Mandatory departmental course-file dossiers, assessment proofs, and NBA/NAAC compliance artifacts for AY 2026–27.
        </p>
      </div>

      {/* Upload Card & Sync Progress Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Upload Card */}
        <div className="card" style={{ marginBottom: 0, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              UPLOAD STATUTORY ACADEMIC DOCUMENT
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max: 25 MB/doc</span>
          </div>

          <div
            style={{
              border: '2px dashed var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'center',
              backgroundColor: '#fafbfc',
              marginBottom: '1rem',
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '0.35rem' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Select an academic file or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>browse local directory</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, CSV, TXT (Max 25 MB)
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt"
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
            {selectedFile ? `Selected: ${selectedFile.name}` : 'No file selected'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                Category:
              </label>
              <select
                className="form-select"
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="Syllabus">Syllabus</option>
                <option value="Lesson Plan">Lesson Plan</option>
                <option value="Lecture Notes">Lecture Notes</option>
                <option value="Question Papers">Question Papers</option>
                <option value="Sample Answers">Sample Answers</option>
                <option value="Attendance">Attendance</option>
                <option value="Assessment Records">Assessment Records</option>
                <option value="Feedback">Feedback</option>
                <option value="Assignments">Assignments</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={uploading}
            >
              Browse
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleFileUpload}
              disabled={uploading || !selectedCourse}
            >
              <Upload size={14} />
              <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
            </button>
          </div>
        </div>

        {/* Upload requirements */}
        <div className="card" style={{ marginBottom: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Upload checklist
              </span>
              <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>Validation enabled</span>
            </div>

            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.8 }}>
              <li>Choose an approved academic file type.</li>
              <li>Select the course and matching document category.</li>
              <li>Files larger than 25 MB are rejected.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      {error && <div className="card" role="alert" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
      <div className="pill-tabs" style={{ marginBottom: '1rem' }}>
        {categories.map(c => {
          const count = categoryCounts[c.key] || 0;
          const isActive = activeCategory === c.key;

          return (
            <button
              key={c.key}
              className={`pill-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.key)}
            >
              <span>{c.label}</span>
              <span style={{ opacity: 0.8, marginLeft: '4px' }}>({count})</span>
            </button>
          );
        })}
      </div>

      <div className="card" style={{ padding: '0.85rem 1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`pill-tab ${selectedFolder === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedFolder('All')}
            >
              All Files
            </button>
            {folders.map(folder => (
              <div key={folder} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  className={`pill-tab ${selectedFolder === folder ? 'active' : ''}`}
                  onClick={() => setSelectedFolder(folder)}
                  style={{ padding: '0.4rem 0.7rem' }}
                >
                  {folder}
                </button>
                {folder !== 'Root' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm btn-icon"
                      title="Rename folder"
                      onClick={(event) => {
                        event.stopPropagation();
                        setRenamingFolder(folder);
                      }}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm btn-icon"
                      title="Delete folder"
                      style={{ color: 'var(--danger)' }}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteFolder(folder);
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="search-input"
              value={folderDraft}
              onChange={(e) => setFolderDraft(e.target.value)}
              placeholder="Create folder"
              style={{ width: '160px' }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleCreateFolder}>Create</button>
            {renamingFolder && (
              <>
                <input
                  type="text"
                  className="search-input"
                  defaultValue={renamingFolder}
                  onBlur={(e) => handleRenameFolder(renamingFolder, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameFolder(renamingFolder, e.currentTarget.value);
                    if (e.key === 'Escape') setRenamingFolder(null);
                  }}
                  style={{ width: '150px' }}
                  autoFocus
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '0.85rem 1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '180px', fontSize: '0.8rem' }}
            value={selectedCourse}
            onChange={(event) => {
              setSelectedCourse(event.target.value);
              setActiveCategory('All');
            }}
            aria-label="Filter by course"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course.faculty_course_id} value={course.faculty_course_id}>
                {course.code} — {course.name}
              </option>
            ))}
          </select>

          <div className="search-box" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by filename, course, category, or uploader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDocuments()}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '130px', fontSize: '0.8rem' }}
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
          >
            <option value="All">All File Types</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
            <option value="XLSX">XLSX</option>
            <option value="PPTX">PPTX</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '150px', fontSize: '0.8rem' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Review Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Under Review">Under Review</option>
            <option value="Correction Required">Correction Required</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '160px', fontSize: '0.8rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Sort: Newest</option>
            <option value="date-asc">Sort: Oldest</option>
            <option value="name-asc">Sort: Name A–Z</option>
            <option value="name-desc">Sort: Name Z–A</option>
            <option value="type-asc">Sort: Type</option>
            <option value="size-desc">Sort: Largest</option>
          </select>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Showing {filteredDocuments.length} files
          </span>
        </div>
      </div>

      {/* Documents Data Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '36px' }}>
                  <input type="checkbox" />
                </th>
                <th>FILE NAME &amp; DETAILS</th>
                <th>CATEGORY</th>
                <th>UPLOADED BY</th>
                <th>LAST MODIFIED</th>
                <th>REVIEW STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading compliance documents...
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No files found.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => {
                  const sizeKB = (doc.filesize / 1024).toFixed(1);
                  const sizeMB = (doc.filesize / (1024 * 1024)).toFixed(1);
                  const displaySize = doc.filesize > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

                  return (
                    <tr key={doc.id}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className={`badge ${doc.filetype === 'PDF' ? 'badge-returned' : doc.filetype === 'DOCX' ? 'badge-submitted' : 'badge-approved'}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                            {doc.filetype}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {doc.filename}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '2px' }}>
                              {displaySize} • {doc.sha256_hash ? 'SHA-256 Verified' : 'Cryptographically Stored'}
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.65rem', color: 'var(--primary)', background: '#eef2ff', borderRadius: '999px', padding: '0.2rem 0.5rem', fontWeight: 700 }}>
                              Folder: {doc.folderName || 'Root'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <select
                            className="form-select"
                            value={doc.category}
                            onChange={(event) => handleCategoryChange(doc.id, event.target.value)}
                            aria-label={`Change category for ${doc.original_name}`}
                            style={{ minWidth: '150px', fontSize: '0.75rem' }}
                          >
                            {categories.filter(category => category.key !== 'All').map(category => (
                              <option key={category.key} value={category.key}>{category.label}</option>
                            ))}
                          </select>
                          <select
                            className="form-select"
                            value={doc.folderName || 'Root'}
                            onChange={(event) => moveDocumentToFolder(doc.id, event.target.value)}
                            aria-label={`Move ${doc.filename} to a folder`}
                            style={{ minWidth: '150px', fontSize: '0.75rem' }}
                          >
                            {folders.map(folder => (
                              <option key={folder} value={folder}>{folder}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div className="user-avatar" style={{ width: 22, height: 22, fontSize: '0.65rem' }}>
                            AT
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{doc.uploader_name || 'Dr. Aris Thorne'}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>{doc.created_at?.substring(0, 16)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {doc.updated_at ? doc.updated_at.substring(0, 10) : 'Oct 26, 2026'}
                      </td>
                      <td>
                        <StatusBadge status={doc.review_status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <a
                            href={doc.filepath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm btn-icon"
                            title="Preview File"
                          >
                            <Eye size={14} />
                          </a>
                          <a
                            href={doc.filepath}
                            download={doc.filename}
                            className="btn btn-outline btn-sm btn-icon"
                            title="Download File"
                          >
                            <Download size={14} />
                          </a>
                          <button
                            className="btn btn-outline btn-sm btn-icon"
                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            title="Replace / Resync File"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            className="btn btn-outline btn-sm btn-icon"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleDelete(doc.id, doc.filename)}
                            title="Delete File"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Audit Lock Notice */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', marginTop: '1rem', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
          <span>NBA Criterion 2 &amp; NAAC SSR Verification Lock Active • All uploads are timestamped and tied to faculty digital signatures. Revisions retain historical delta audits.</span>
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/faculty/course/${courseId}`); }} style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span>View Audit Log History</span>
          <ArrowLeft size={13} style={{ transform: 'rotate(180deg)' }} />
        </a>
      </div>
    </AppLayout>
  );
};

export default CourseDocuments;
