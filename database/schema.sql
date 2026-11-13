-- Relational Database Schema for Course File Management & Academic Documentation Automation System

-- Enable foreign keys support in SQLite
PRAGMA foreign_keys = ON;

-- 1. Roles Table (Admin, Faculty, Reviewer, HOD, Student)
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- 2. Users Table (Admin, Faculty, Reviewer)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS admin_signup_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    requested_at TEXT NOT NULL DEFAULT (datetime('now')),
    reviewed_at TEXT,
    reviewed_by INTEGER,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    semester TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    credits REAL NOT NULL,
    ltp TEXT NOT NULL, -- Format: L-T-P (e.g. 3-1-0)
    section TEXT DEFAULT 'Sec A',
    course_type TEXT DEFAULT 'Core Theory',
    regulation TEXT DEFAULT 'R-2022'
);

-- 4. Faculty-Course Mappings (The Course Workspace assignment)
CREATE TABLE IF NOT EXISTS faculty_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, IN_PROGRESS, READY_FOR_REVIEW, UNDER_REVIEW, CORRECTION_REQUIRED, APPROVED, ARCHIVED
    last_submitted_at TEXT,
    reviewer_comments TEXT,
    hod_note TEXT,
    role_title TEXT DEFAULT 'Primary Instructor',
    dossier_deadline TEXT DEFAULT 'Nov 10, 2026',
    verified_items INTEGER DEFAULT 11,
    total_items INTEGER DEFAULT 15,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE(faculty_id, course_id)
);

-- 5. Syllabus Table (Versioned)
CREATE TABLE IF NOT EXISTS syllabus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_course_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    version INTEGER NOT NULL,
    uploaded_at TEXT NOT NULL,
    uploaded_by INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (faculty_course_id) REFERENCES faculty_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- 6. Lesson Plans Table
CREATE TABLE IF NOT EXISTS lesson_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_course_id INTEGER NOT NULL UNIQUE,
    total_units INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    weekly_days TEXT NOT NULL, -- JSON array of weekdays, e.g. ["Monday", "Wednesday"]
    FOREIGN KEY (faculty_course_id) REFERENCES faculty_courses(id) ON DELETE CASCADE
);

-- 7. Lectures Table (Lesson Plan Items)
CREATE TABLE IF NOT EXISTS lectures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_course_id INTEGER NOT NULL,
    unit TEXT NOT NULL,
    topic TEXT NOT NULL,
    planned_date TEXT NOT NULL,
    actual_date TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, RESCHEDULED, CANCELLED
    FOREIGN KEY (faculty_course_id) REFERENCES faculty_courses(id) ON DELETE CASCADE
);

-- 8. Students Table
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roll_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- 9. Student Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(student_id, course_id)
);

-- 10. Attendance Records
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL,
    lecture_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PRESENT', -- PRESENT, ABSENT
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE,
    UNIQUE(enrollment_id, lecture_id)
);

-- 11. Internal Marks Table
CREATE TABLE IF NOT EXISTS marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL UNIQUE,
    midterm REAL DEFAULT 0,
    assignment REAL DEFAULT 0,
    quiz REAL DEFAULT 0,
    attendance_score REAL DEFAULT 0,
    performance_score REAL DEFAULT 0,
    total REAL DEFAULT 0,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- 12. Remedial Classes
CREATE TABLE IF NOT EXISTS remedial_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_course_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    topic TEXT NOT NULL,
    student_id INTEGER NOT NULL,
    attendance TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PRESENT, ABSENT
    outcome TEXT,
    FOREIGN KEY (faculty_course_id) REFERENCES faculty_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 13. CO-PO Mappings
CREATE TABLE IF NOT EXISTS co_po_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_course_id INTEGER NOT NULL,
    co_code TEXT NOT NULL, -- CO1, CO2, etc.
    po_code TEXT NOT NULL, -- PO1, PO2, etc.
    level INTEGER NOT NULL, -- 0 (None), 1 (Low), 2 (Medium), 3 (High)
    FOREIGN KEY (faculty_course_id) REFERENCES faculty_courses(id) ON DELETE CASCADE,
    UNIQUE(faculty_course_id, co_code, po_code)
);

-- 14. Review History / Digital Audit Trail
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_course_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    comments TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (faculty_course_id) REFERENCES faculty_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 15. Compliance Documents Repository
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_course_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    filepath TEXT NOT NULL,
    filesize INTEGER NOT NULL,
    filetype TEXT NOT NULL,
    category TEXT NOT NULL, -- Syllabus, Lesson Plan, Lecture Notes, Question Papers, Sample Answers, Attendance, Assessment Records, Assignments, Feedback
    review_status TEXT NOT NULL DEFAULT 'Approved', -- Approved, Under Review, Correction Required
    sha256_hash TEXT,
    uploaded_by INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (faculty_course_id) REFERENCES faculty_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- 16. Statutory Course File Matrix Components (15 Statutory Items)
CREATE TABLE IF NOT EXISTS course_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_course_id INTEGER NOT NULL,
    section_number INTEGER NOT NULL,
    section_name TEXT NOT NULL,
    item_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'MANDATORY', -- MANDATORY, STATUTORY, INSTITUTIONAL
    status TEXT NOT NULL DEFAULT 'Approved', -- Approved, In Progress, Correction Required, Not Started, Pending Window
    verification_percentage INTEGER DEFAULT 100,
    review_date TEXT,
    action_type TEXT NOT NULL DEFAULT 'view_replace', -- view_replace, view_edit, view_update, upload, enter_marks, generate, recalculate
    action_label TEXT NOT NULL DEFAULT 'View',
    document_id INTEGER,
    notes TEXT,
    FOREIGN KEY (faculty_course_id) REFERENCES faculty_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
    UNIQUE(faculty_course_id, item_index)
);

-- 17. Actionable Pending Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    faculty_course_id INTEGER,
    course_code TEXT,
    title TEXT NOT NULL,
    due_date TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal', -- High, Medium, Normal
    action_label TEXT NOT NULL, -- Upload Artifact, Update Attendance, Configure Matrix
    action_path TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_course_id) REFERENCES faculty_courses(id) ON DELETE CASCADE
);

-- 18. Institutional In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    course_code TEXT,
    type TEXT NOT NULL DEFAULT 'SYSTEM', -- SUBMISSION, APPROVAL, CORRECTION, SYSTEM
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
