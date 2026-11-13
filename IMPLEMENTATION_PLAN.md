# COURSE FILE MANAGEMENT SYSTEM (CFMS) — IMPLEMENTATION PLAN

## 1. Existing Architecture & Codebase Review

### 1.1 Architecture Overview
The Course File Management System (CFMS) is structured as a decoupled full-stack web application designed for academic compliance, portfolio tracking, and NBA/NAAC statutory audits:
- **Client (`Client/`)**: React 18, Vite 5, React Router v6, Lucide React icons.
- **Server (`Server/`)**: Express 4, Node.js, SQLite3 (`sqlite3`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, and `dotenv`.
- **Database (`database/`)**: SQLite database (`database/cfms.db`), initialized via `database/schema.sql` and seeded via `database/seed.sql`.
- **Storage (`Server/uploads/`)**: Local file storage for uploaded course-file artifacts and documents.

### 1.2 Technology Preservation
- Preserving Vite + React 18 frontend.
- Preserving Express + Node.js backend.
- Preserving SQLite database with foreign key support.
- Enhancing backend with `multer` for secure multipart file handling.

---

## 2. Findings & Gap Analysis

### 2.1 Visual & UI Gaps Against Supplied Figma Designs
1. **Theme & Palette Discrepancy**:
   - Existing UI used a dark neon theme (`#0b0f19`) that did not align with the provided Figma designs.
   - The Figma designs feature an **academic-enterprise light design system**: crisp off-white/slate backgrounds (`#f8fafc`, `#ffffff`), deep indigo branding (`#4338ca`, `#4f46e5`), subtle borders (`#e2e8f0`), rounded cards, color-coded badges (Approved, In Progress, Submitted, Returned, Not Started), and distinct typography hierarchy.
2. **Missing Screens & Incomplete Layouts**:
   - **Login Page (`input_file_0.png`)**: Needs split hero layout with institutional compliance badges, 3 feature overview cards, Statutory Academic Lifecycle 4-step stepper, security policy alert, password reveal toggle, SSO option, and quick sign-in demo accounts.
   - **Faculty Dashboard (`input_file_1.png`)**: Needs shared sidebar with ERP node status, top navigation with breadcrumbs, AY selector (`AY 2026-27`), notification bell with unread badge, profile badge; 4 metric stat cards; My Courses table; Pending Actionable Tasks; and Recent Audited Activity timeline.
   - **My Courses Page (`input_file_2.png`)**: Dedicated portfolio listing with search, semester filter, status filter, stat summary chips, course code badges, instructor details, completion progress bars, and actions (Open Course File, Review Feedback, Initialize File).
   - **Course File Workspace (`input_file_3.png`)**: Dedicated course workspace with 5 metadata banner cards, 15-item Course File Statutory Matrix across 7 collapsible sections, Readiness Audit panel, Immediate Next Step prompt, Review Governance card, and Workspace Utilities.
   - **Compliance Repository / Documents (`input_file_4.png`)**: Dedicated file management screen with drag-and-drop uploader, file category tabs, search & filters, file table with SHA-256 badges, preview, download, replace, and delete actions.
   - **Consolidated Course File Preview (`Screen 6`)**: Consolidated printable/downloadable course dossier preview.

### 2.2 Security Deficiencies & Vulnerabilities
1. **Foreign Key Enforcement**: SQLite requires `PRAGMA foreign_keys = ON;` executed on every open database connection. `Server/src/config/db.js` failed to execute this pragma.
2. **Missing Course Ownership Authorization**: Endpoints in `Server/src/routes/faculty.js` accepted `facultyCourseId` without checking whether `fc.faculty_id = req.userId`. A faculty member could access and tamper with other instructors' courses simply by altering URL parameters.
3. **Unrestricted Uploads & Missing Storage Architecture**: The existing codebase only had a `syllabus` table without a generalized `documents` table. Uploads lacked MIME-type validation, size limits (25MB cap required by IQAC), and sanitized file naming.
4. **JWT Expiration & Inactive Session Termination**: Token handling needed inactive session termination policy support (45-minute inactivity warning matching Figma header banner).

### 2.3 Database & Schema Deficiencies
1. **Missing `documents` Table**: Existing schema only had `syllabus`. A unified `documents` table is required to track all statutory artifacts across categories (Syllabus, Lesson Plan, Lecture Notes, Question Papers, Sample Answers, Attendance, Assessment Records, Feedback).
2. **Missing `course_components` / Statutory Matrix**: The 15 statutory compliance items displayed in Figma require persistent status, mandatory flags, review notes, and verification tracking.
3. **Missing `notifications` Table**: Top navigation badge and notification drawers require backend persistence.
4. **Missing `tasks` Table**: Pending actionable tasks displayed on the dashboard require structured tracking with due dates, priorities, and action links.
5. **Course Metadata**: Courses table needs `section`, `course_type`, and `regulation` columns to match the academic catalog cards.

---

## 3. Screen-by-Screen Implementation Plan

### Screen 1: Institutional Authentication Portal (`/login`)
- Exact Figma layout from `input_file_0.png`.
- Left panel: University Academic Compliance & Governance pill, "Simplify Your Course File Management" hero, 3 feature cards, Statutory Academic Lifecycle steps (01. Assemble, 02. Track, 03. Compute, 04. Review), IQAC and NAAC Criterion 2.6 footer.
- Right card: Session policy alert banner, institutional login form, password visibility toggle, remember me, "Sign In to CFMS ->", SSO button, and quick-login demo accounts for Admin, Faculty A (Dr. Aris Thorne), Faculty B, and Reviewer X (HOD).

### Screen 2: Faculty Dashboard (`/faculty` or `/faculty/dashboard`)
- Exact Figma layout from `input_file_1.png`.
- Shared application layout (Sidebar + Top Navigation Bar).
- Top bar with breadcrumbs, AY 2026-27 selector, notifications bell (badge 3), user avatar (Dr. Aris Thorne).
- 4 stat metric cards: Assigned Courses, In Progress, Awaiting Review, Approved.
- My Courses table with progress bars, status pills, and "Open" navigation.
- 2-column bottom section: Pending Tasks (3 actionable items with action triggers) & Recent Activity timeline.

### Screen 3: My Courses Portfolio Page (`/faculty/courses`)
- Exact Figma layout from `input_file_2.png`.
- Course portfolio directory with status counts, search filter, semester filter, status filter, clear filter, and active filter chips.
- Interactive table with course badges (Core Theory, Lab, Elective), instructor details, completion progress bars, and quick actions ("Open Course File", "Review Feedback", "Initialize File").
- Compact "No Match Pattern" state when search produces no results.

### Screen 4: Course File Statutory Workspace (`/faculty/course/:id`)
- Exact Figma layout from `input_file_3.png`.
- Top breadcrumbs, course title, status badge ("In Progress • 73% Verified"), top action buttons ("Preview Consolidated File", "Index", "Submit for Review").
- 5 Header Metadata Cards: Catalog & Cohort, Personnel, Accreditation Base, Dossier Deadline, Readiness.
- Accordion 15-Item Statutory Matrix across 7 categories:
  1. Course Information and Syllabus
  2. Course Outcomes and Lesson Plan
  3. Teaching Materials and Handouts
  4. Assignments and Question Papers
  5. Attendance and Assessment Marks
  6. Result Analysis and Feedback
  7. CO-PO Mapping and Attainment
- Interactive drawers/modals for Lesson Plan Generation, Attendance Register, Internal Marks Register, and CO-PO Articulation Matrix.
- Right Sidebar: Readiness Audit breakdown, Pending Action items, Immediate Next Step card, Review & Audit Governance card, Workspace Utilities (Download Draft Dossier PDF, Batch Upload ZIP), and Workspace Activity log.

### Screen 5: Compliance Repository / Course Documents (`/faculty/course/:id/documents`)
- Exact Figma layout from `input_file_4.png`.
- Course info badge and compliance repository breadcrumbs.
- Drag-and-drop document uploader with category selector, 25MB validation, and active upload sync pipeline progress widget.
- Category tabs (All Categories, Syllabus, Lesson Plan, Lecture Notes, Question Papers, Sample Answers, Attendance, Assessment Records, Feedback).
- Document search, file type filter, review status filter, and sorting.
- Documents table with SHA-256 verification badges, preview modal, download link, replace action, and delete action with confirmation.

### Screen 6: Consolidated Course File Dossier Preview & Generation (`/faculty/course/:id/preview`)
- Complete audit-ready consolidated course file dossier preview.
- Includes course syllabus, approved lesson plan, verified attendance summary, CIA internal assessment marks distribution, Bell Curve analysis, and CO-PO Direct Attainment matrix.
- Export as PDF and printable view with institutional headers.

### Screen 7: HOD & Reviewer Audit Consoles (`/hod`, `/reviewer`)
- Separate HOD department-audit and reviewer review-console entry points, with submitted courses awaiting audit.
- Component-level audit verification, approval, and return for correction with comments.
- Digital audit log and review history trail.

### Screen 8: Administrator Management Console (`/admin`)
- Department course catalog management, faculty-course assignments, reviewer assignments, user role management, and audit compliance reports.

---

## 4. Execution Sequence & Recommended Implementation Order

1. **Foundational Security & Database Modernization**:
   - Enforce `PRAGMA foreign_keys = ON;` in `db.js`.
   - Migrate database schema to add `documents`, `notifications`, `tasks`, `course_components`, and updated course metadata.
   - Seed complete institutional dataset reflecting Dr. Aris Thorne's courses from the Figma designs (`CS504`, `CS507`, `CS502`, `CS506`, `CS508`, `CS511`, etc.).
2. **Backend API Enhancements**:
   - Implement ownership validation middleware on faculty routes.
   - Implement `multer` upload endpoints with validation and safe filename generation.
   - Implement Documents API (`/api/faculty/course/:id/documents`).
   - Implement Notifications API (`/api/notifications`).
   - Implement Tasks API and Recent Activity trail.
   - Implement Consolidated Dossier generation endpoint.
3. **Frontend Design System & Layout Foundation**:
   - Re-architect `index.css` to match the Figma academic-enterprise light design system (slate, indigo, clean cards, crisp borders, responsive grid).
   - Build reusable components: `AppLayout`, `Sidebar`, `TopBar`, `StatusBadge`, `StatCard`, `DataTable`, `ConfirmModal`.
4. **Implement Screens Matching Figma Designs**:
   - **Screen 1**: Modernize `Login.jsx` to match `input_file_0.png`.
   - **Screen 2**: Modernize `FacultyDashboard.jsx` to match `input_file_1.png`.
   - **Screen 3**: Implement `MyCourses.jsx` to match `input_file_2.png`.
   - **Screen 4**: Refactor `CourseWorkspace.jsx` to match `input_file_3.png` with 15-item statutory matrix and working modules.
   - **Screen 5**: Implement `CourseDocuments.jsx` / Compliance Repository matching `input_file_4.png`.
   - **Screen 6**: Implement `ConsolidatedDossierPreview.jsx` for course file preview and PDF download.
   - **Screen 7 & 8**: Polish Reviewer and Admin dashboards to match the design system.
5. **End-to-End Verification**:
   - Test login, role authorization, course listing, file uploads, lesson plan generation, marks entry, CO-PO mapping, review submission, approval/return cycle, and PDF generation.
