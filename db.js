const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Resolve paths
const dbPath = path.resolve(__dirname, '../../', process.env.DB_PATH || '../database/cfms.db');
const dbDir = path.dirname(dbPath);

// Ensure the database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('Connecting to database at:', dbPath);

let resolveDatabaseReady;
let rejectDatabaseReady;
const databaseReady = new Promise((resolve, reject) => {
  resolveDatabaseReady = resolve;
  rejectDatabaseReady = reject;
});

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    rejectDatabaseReady(err);
  } else {
    console.log('Connected to SQLite database.');
    // Enable SQLite foreign keys on EVERY database connection
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('Error enabling foreign keys:', pragmaErr.message);
        rejectDatabaseReady(pragmaErr);
        return;
      }
      console.log('Foreign key enforcement enabled (PRAGMA foreign_keys = ON).');
      initializeDatabase().then(resolveDatabaseReady).catch(rejectDatabaseReady);
    });
  }
});

// Helper wrapper to run SQL commands as promises
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Safe helper to add column if it does not already exist
async function ensureColumnExists(tableName, columnName, columnDefinition) {
  try {
    const tableInfo = await allQuery(`PRAGMA table_info(${tableName})`);
    const exists = tableInfo.some(col => col.name === columnName);
    if (!exists) {
      await runQuery(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
      console.log(`Added column ${columnName} to table ${tableName}`);
    }
  } catch (err) {
    console.error(`Error checking/adding column ${columnName} on ${tableName}:`, err.message);
  }
}

// Ensure dummy files exist in uploads for documents
function ensureUploadSampleFiles() {
  const uploadsDir = path.resolve(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const sampleFiles = [
    'AI_Course_Syllabus.pdf',
    'Unit_1_Lecture_Notes_State_Space_Search.pdf',
    'Unit_2_Knowledge_Representation.pdf',
    'Unit_3_Probabilistic_Reasoning.pdf',
    'Unit_4_Machine_Learning_Foundations.pdf',
    '45_Lecture_Structured_Lesson_Plan_CS504.docx',
    'CIA_1_Question_Paper_and_Marking_Scheme.pdf',
    'CIA_2_Question_Paper_Draft.docx',
    'Sample_Student_Answers_CIA1_High_Medium_Low.pdf',
    'Attendance_Register_Month_1_to_3_Verified.xlsx',
    'CIA_1_Internal_Marks_Assessment_Master.xlsx',
    'CS301_Syllabus_v1.pdf',
    'Unit1_Notes.pdf',
    'CS301_Assignment_1.pdf'
  ];

  sampleFiles.forEach(file => {
    const fullPath = path.join(uploadsDir, file);
    if (!fs.existsSync(fullPath)) {
      const sampleText = `%PDF-1.4\n% CFMS Verified Institutional Document: ${file}\n% Department of Computer Science & Engineering\n% Statutory Audit & Compliance Academic Year 2026-27\nEOF`;
      fs.writeFileSync(fullPath, sampleText, 'utf8');
    }
  });
}

// Run migrations and seed data
async function initializeDatabase() {
  try {
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaRaw = fs.readFileSync(schemaPath, 'utf8');
      // Strip SQL line comments
      const schemaClean = schemaRaw.replace(/--.*$/gm, '');
      const schemaStatements = schemaClean
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      for (const statement of schemaStatements) {
        try {
          await runQuery(statement);
        } catch (err) {
          if (!err.message.includes('already exists')) {
            console.error('Schema statement error:', err.message, '\nStatement:', statement);
          }
        }
      }
    }

    // Ensure extra columns on courses & faculty_courses
    await ensureColumnExists('courses', 'section', "TEXT DEFAULT 'Sec A'");
    await ensureColumnExists('courses', 'course_type', "TEXT DEFAULT 'Core Theory'");
    await ensureColumnExists('courses', 'regulation', "TEXT DEFAULT 'R-2022'");

    await ensureColumnExists('faculty_courses', 'hod_note', 'TEXT');
    await ensureColumnExists('faculty_courses', 'role_title', "TEXT DEFAULT 'Primary Instructor'");
    await ensureColumnExists('faculty_courses', 'dossier_deadline', "TEXT DEFAULT 'Nov 10, 2026'");
    await ensureColumnExists('faculty_courses', 'verified_items', 'INTEGER DEFAULT 11');
    await ensureColumnExists('faculty_courses', 'total_items', 'INTEGER DEFAULT 15');

    // Run seed synchronization
    await seedInstitutionalData();

    // Ensure uploads directory and sample files exist
    ensureUploadSampleFiles();

    console.log('Database schema & seed synchronization complete.');
  } catch (error) {
    console.error('Error in initializeDatabase:', error);
    throw error;
  }
}

async function seedInstitutionalData() {
  try {
    // 1. Roles
    await runQuery(`INSERT OR IGNORE INTO roles (id, name) VALUES (1, 'ADMIN'), (2, 'FACULTY'), (3, 'REVIEWER'), (4, 'STUDENT'), (5, 'HOD')`);

    // 2. Users (Password is 'password123' for all)
    const passHash = '$2a$10$wFaSJ6sR01c2B9i5F1H62OCPp/bpf/zJXpebRkJFPvW5Wp1uXgPue';
    await runQuery(`
      INSERT OR IGNORE INTO users (id, name, email, password_hash, role_id) VALUES
      (1, 'System Administrator', 'admin@cfms.edu', '${passHash}', 1),
      (2, 'Dr. Aris Thorne', 'faculty.a@cfms.edu', '${passHash}', 2),
      (3, 'Prof. Clara Vance', 'faculty.b@cfms.edu', '${passHash}', 2),
      (4, 'Dr. Marcus Sterling (HOD CSE)', 'reviewer.x@cfms.edu', '${passHash}', 3),
      (5, 'Dr. Aris Thorne', 'dr.thorne@university.edu', '${passHash}', 2),
      (6, 'Dr. Rajesh Kulkarni (HOD CSE)', 'hod.cse@cfms.edu', '${passHash}', 5)
    `);
    await runQuery(`
      UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'HOD')
      WHERE lower(email) = 'hod.cse@cfms.edu'
    `);

    // 3. Courses (Matching Figma Catalog and existing courses)
    const courseInserts = [
      [1, 'CS301', 'Computer Networks', 'Computer Science & Engineering', 'Semester V', '2026-27', 4, '3-1-0', 'Sec A', 'Core Theory', 'R-2022'],
      [2, 'CS302', 'Software Engineering', 'Computer Science & Engineering', 'Semester V', '2026-27', 3, '3-0-0', 'Sec B', 'Core Theory', 'R-2022'],
      [3, 'CS303', 'Artificial Intelligence', 'Computer Science & Engineering', 'Semester V', '2026-27', 4, '3-0-2', 'Sec A', 'Core Theory', 'R-2022'],
      [4, 'CS504', 'Artificial Intelligence', 'Computer Science & Engineering', 'Semester V', '2026-27', 4, '3-1-0', 'Sec A', 'Core Theory', 'R-2022'],
      [5, 'CS507', 'Machine Learning', 'Computer Science & Engineering', 'Semester V', '2026-27', 3, '3-0-0', 'Sec B', 'Professional Elective', 'R-2022'],
      [6, 'CS502', 'Computer Networks', 'Computer Science & Engineering', 'Semester V', '2026-27', 4, '3-1-0', 'Sec A', 'Core Theory', 'R-2022'],
      [7, 'CS506', 'Software Engineering', 'Computer Science & Engineering', 'Semester V', '2026-27', 3, '3-0-0', 'Sec A & B', 'Core Theory', 'R-2022'],
      [8, 'CS508', 'Database Systems & SQL Lab', 'Computer Science & Engineering', 'Semester V', '2026-27', 1.5, '0-0-3', 'Batch A1/A2', 'Laboratory', 'R-2022'],
      [9, 'CS511', 'Advanced Algorithm Design', 'Computer Science & Engineering', 'Semester V', '2026-27', 3, '3-0-0', 'Modular Track', 'Elective', 'R-2022'],
      [10, 'CS501', 'Database Management Systems', 'Computer Science & Engineering', 'Semester V', '2026-27', 4, '3-1-0', 'Sec A', 'Core Theory', 'R-2022'],
      [11, 'CS503', 'Operating System Internals', 'Computer Science & Engineering', 'Semester V', '2026-27', 4, '3-1-0', 'Sec B', 'Core Theory', 'R-2022']
    ];

    for (const c of courseInserts) {
      await runQuery(`
        INSERT OR IGNORE INTO courses (id, code, name, department, semester, academic_year, credits, ltp, section, course_type, regulation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, c);
    }

    const studentRecords = [
      [1, 'CS26B1001', 'Rahul Sharma', 'rahul.sharma@bmu.edu.in'],
      [2, 'CS26B1002', 'Amit Patel', 'amit.patel@bmu.edu.in'],
      [3, 'CS26B1003', 'Priya Singh', 'priya.singh@bmu.edu.in'],
      [4, 'CS26B1004', 'Vikram Rao', 'vikram.rao@bmu.edu.in'],
      [5, 'CS26B1005', 'Neha Gupta', 'neha.gupta@bmu.edu.in']
    ];
    for (const student of studentRecords) {
      const existingStudent = await getQuery('SELECT email FROM students WHERE roll_number = ?', [student[1]]);
      if (existingStudent && existingStudent.email.toLowerCase() !== student[3].toLowerCase()) {
        await runQuery(`
          UPDATE users SET email = ?
          WHERE lower(email) = lower(?)
            AND NOT EXISTS (
              SELECT 1 FROM users AS existing
              WHERE lower(existing.email) = lower(?)
                AND lower(existing.email) != lower(?)
            )
        `, [student[3], existingStudent.email, student[3], existingStudent.email]);
        await runQuery(`
          UPDATE students SET name = ?, email = ?
          WHERE roll_number = ?
            AND NOT EXISTS (
              SELECT 1 FROM students AS existing
              WHERE lower(existing.email) = lower(?)
                AND existing.roll_number != ?
            )
        `, [student[2], student[3], student[1], student[3], student[1]]);
      }

      await runQuery(
        'INSERT OR IGNORE INTO students (id, roll_number, name, email) VALUES (?, ?, ?, ?)',
        student
      );
      await runQuery(
        'INSERT OR IGNORE INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, 4)',
        [student[2], student[3], bcrypt.hashSync('password123', 10)]
      );
    }

    await runQuery(`
      INSERT OR IGNORE INTO enrollments (id, student_id, course_id) VALUES
      (1, 1, 1), (2, 2, 1), (3, 3, 1), (4, 4, 1), (5, 5, 1),
      (6, 1, 2), (7, 2, 2), (8, 3, 2), (9, 4, 2), (10, 5, 2)
    `);

    // 4. Faculty Courses Mappings (Assign courses to Dr. Aris Thorne user 2 and 5)
    // Target user id 2 (Dr. Aris Thorne)
    const facultyCoursesInserts = [
      [1, 2, 1, 4, 'IN_PROGRESS', null, null, null, 'Primary Instructor', 'Nov 30, 2026', 3, 14],
      // CS504 - Submitted, 92%
      [4, 2, 4, 4, 'SUBMITTED', '2026-10-26 14:30:00', 'Submitted to HOD, pending sign-off', null, 'Primary Instructor', 'Nov 10, 2026', 13, 14],
      // CS507 - In Progress, 64%
      [5, 2, 5, 4, 'IN_PROGRESS', null, null, null, 'Primary Instructor', 'Nov 15, 2026', 9, 14],
      // CS502 - Correction Required, 78%
      [6, 2, 6, 4, 'CORRECTION_REQUIRED', '2026-10-25 11:20:00', 'Update Unit IV Bloom mapping and recalculate attainment', 'HOD note: Update Unit IV Bloom\'s mapping', 'Course Coordinator', 'Nov 05, 2026', 11, 14],
      // CS506 - Approved, 100%
      [7, 2, 7, 4, 'APPROVED', '2026-10-20 09:00:00', 'Audited and approved for NBA SSR criterion 2', null, 'Primary Instructor', 'Oct 22, 2026', 14, 14],
      // CS508 - Approved, 100%
      [8, 2, 8, 4, 'APPROVED', '2026-10-18 16:45:00', 'Audited and finalized for Statutory Audit', null, 'Lab Faculty Lead', 'Oct 18, 2026', 14, 14],
      // CS511 - Draft (Not Started), 0%
      [9, 2, 9, 4, 'DRAFT', null, null, null, 'Assigned Co-Faculty', 'Nov 30, 2026', 0, 14],
      // CS501 - Submitted, 92%
      [10, 2, 10, 4, 'SUBMITTED', '2026-10-26 12:00:00', 'Submitted to HOD, awaiting review', null, 'Primary Instructor', 'Nov 10, 2026', 13, 14],
      // CS503 - In Progress, 65%
      [11, 2, 11, 4, 'IN_PROGRESS', null, null, null, 'Primary Instructor', 'Nov 12, 2026', 9, 14]
    ];

    for (const fc of facultyCoursesInserts) {
      await runQuery(`
        INSERT OR IGNORE INTO faculty_courses (id, faculty_id, course_id, reviewer_id, status, last_submitted_at, reviewer_comments, hod_note, role_title, dossier_deadline, verified_items, total_items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, fc);
    }

    // Also map user 5 (dr.thorne@university.edu) to the same assignments if user logs in via university email
    for (const fc of facultyCoursesInserts) {
      await runQuery(`
        INSERT OR IGNORE INTO faculty_courses (faculty_id, course_id, reviewer_id, status, last_submitted_at, reviewer_comments, hod_note, role_title, dossier_deadline, verified_items, total_items)
        VALUES (5, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [fc[2], fc[3], fc[4], fc[5], fc[6], fc[7], fc[8], fc[9], fc[10], fc[11]]);
    }

    // 5. Seed Documents for CS504 (matching input_file_4.png)
    const docsCS504 = [
      [1, 4, 'AI_Course_Syllabus.pdf', 'AI_Course_Syllabus.pdf', '/uploads/AI_Course_Syllabus.pdf', 2202009, 'PDF', 'Syllabus', 'Approved', '2f8a...SHA256', 2, '2026-10-26 11:30:00', '2026-10-26 11:30:00'],
      [2, 4, 'Unit_1_Lecture_Notes_State_Space_Search.pdf', 'Unit_1_Lecture_Notes_State_Space_Search.pdf', '/uploads/Unit_1_Lecture_Notes_State_Space_Search.pdf', 3565158, 'PDF', 'Lecture Notes', 'Approved', '9e1b...SHA256', 2, '2026-10-21 09:15:00', '2026-10-21 09:15:00'],
      [3, 4, 'Unit_2_Knowledge_Representation.pdf', 'Unit_2_Knowledge_Representation.pdf', '/uploads/Unit_2_Knowledge_Representation.pdf', 5033164, 'PDF', 'Lecture Notes', 'Approved', '7d4c...SHA256', 2, '2026-10-22 10:40:00', '2026-10-22 10:40:00'],
      [4, 4, 'Unit_3_Probabilistic_Reasoning.pdf', 'Unit_3_Probabilistic_Reasoning.pdf', '/uploads/Unit_3_Probabilistic_Reasoning.pdf', 6396313, 'PDF', 'Lecture Notes', 'Approved', '3c8e...SHA256', 2, '2026-10-23 14:50:00', '2026-10-23 14:50:00'],
      [5, 4, 'Unit_4_Machine_Learning_Foundations.pdf', 'Unit_4_Machine_Learning_Foundations.pdf', '/uploads/Unit_4_Machine_Learning_Foundations.pdf', 8598323, 'PDF', 'Lecture Notes', 'Approved', '5b9a...SHA256', 2, '2026-10-24 16:35:00', '2026-10-24 16:35:00'],
      [6, 4, '45_Lecture_Structured_Lesson_Plan_CS504.docx', '45_Lecture_Structured_Lesson_Plan_CS504.docx', '/uploads/45_Lecture_Structured_Lesson_Plan_CS504.docx', 696320, 'DOCX', 'Lesson Plan', 'Approved', '1a8f...SHA256', 2, '2026-10-19 09:45:00', '2026-10-19 09:45:00'],
      [7, 4, 'CIA_1_Question_Paper_and_Marking_Scheme.pdf', 'CIA_1_Question_Paper_and_Marking_Scheme.pdf', '/uploads/CIA_1_Question_Paper_and_Marking_Scheme.pdf', 1258291, 'PDF', 'Question Papers', 'Approved', '8c2d...SHA256', 2, '2026-10-16 10:10:00', '2026-10-16 10:10:00'],
      [8, 4, 'CIA_2_Question_Paper_Draft.docx', 'CIA_2_Question_Paper_Draft.docx', '/uploads/CIA_2_Question_Paper_Draft.docx', 1677721, 'DOCX', 'Question Papers', 'Under Review', '4f9e...SHA256', 2, '2026-10-25 15:22:00', '2026-10-25 15:22:00'],
      [9, 4, 'Sample_Student_Answers_CIA1_High_Medium_Low.pdf', 'Sample_Student_Answers_CIA1_High_Medium_Low.pdf', '/uploads/Sample_Student_Answers_CIA1_High_Medium_Low.pdf', 9122611, 'PDF', 'Sample Answers', 'Approved', '6e1a...SHA256', 2, '2026-10-25 08:10:00', '2026-10-25 08:10:00'],
      [10, 4, 'Attendance_Register_Month_1_to_3_Verified.xlsx', 'Attendance_Register_Month_1_to_3_Verified.xlsx', '/uploads/Attendance_Register_Month_1_to_3_Verified.xlsx', 440320, 'XLSX', 'Attendance', 'Approved', '9a3c...SHA256', 2, '2026-10-14 11:00:00', '2026-10-14 11:00:00'],
      [11, 4, 'CIA_1_Internal_Marks_Assessment_Master.xlsx', 'CIA_1_Internal_Marks_Assessment_Master.xlsx', '/uploads/CIA_1_Internal_Marks_Assessment_Master.xlsx', 911360, 'XLSX', 'Assessment Records', 'Under Review', '7d5b...SHA256', 2, '2026-10-26 09:30:00', '2026-10-26 09:30:00']
    ];

    for (const d of docsCS504) {
      await runQuery(`
        INSERT OR IGNORE INTO documents (id, faculty_course_id, filename, original_name, filepath, filesize, filetype, category, review_status, sha256_hash, uploaded_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, d);
    }

    const docsCS301 = [
      [12, 1, 'Unit1_Notes.pdf', 'Unit1_Notes.pdf', '/uploads/Unit1_Notes.pdf', 102400, 'PDF', 'Lecture Notes', 'Approved', null, 2, '2026-10-24 09:00:00', '2026-10-24 09:00:00'],
      [13, 1, 'CS301_Assignment_1.pdf', 'CS301_Assignment_1.pdf', '/uploads/CS301_Assignment_1.pdf', 81920, 'PDF', 'Assignments', 'Approved', null, 2, '2026-10-25 09:00:00', '2026-10-25 09:00:00']
    ];
    for (const document of docsCS301) {
      await runQuery(`
        INSERT OR IGNORE INTO documents (id, faculty_course_id, filename, original_name, filepath, filesize, filetype, category, review_status, sha256_hash, uploaded_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, document);
    }

    // 6. Seed the 15 Statutory Course Matrix Components for CS504 (matching input_file_3.png)
    const matrixItemsCS504 = [
      // 1. Course Information and Syllabus
      [1, 4, 1, 'Course Information and Syllabus', 1, 'University Approved Syllabus & Curriculum', 'MANDATORY', 'Approved', 100, 'Oct 12, 2026', 'view_replace', 'View', 1, 'Affiliated university Gazette copy • Rev. 2022 v3 • Signed by BoS Chair'],
      [2, 4, 1, 'Course Information and Syllabus', 2, 'Course Prerequisites & Prescribed References', 'STATUTORY', 'Approved', 100, 'Oct 14, 2026', 'view_edit', 'View', null, 'Russell & Norvig 4th Ed; Rich & Knight • NPTEL Video Resource Index'],
      // 2. Course Outcomes and Lesson Plan
      [3, 4, 2, 'Course Outcomes and Lesson Plan', 3, "Course Outcomes (COs) with Bloom's Taxonomy", 'MANDATORY', 'Approved', 100, 'Oct 16, 2026', 'view_edit', 'View', null, "6 Defined COs (CO1-CO6) mapped against cognitive levels R1 to K5"],
      [4, 4, 2, 'Course Outcomes and Lesson Plan', 4, '45-Lecture Structured Lesson Plan & Schedule', 'MANDATORY', 'Approved', 100, 'Oct 19, 2026', 'view_update', 'View', 6, 'Unit-wise lecture breakups, planned vs actual lecture audit alignment'],
      // 3. Teaching Materials and Handouts
      [5, 4, 3, 'Teaching Materials and Handouts', 5, 'Lecture Notes, Slide Decks & Modules', 'MANDATORY', 'In Progress', 72, 'Oct 24, 2026', 'upload', 'Upload Unit 5', 2, 'Units 1, 2, 3 & 4 verified • Unit 5 Reinforcement Learning missing'],
      [6, 4, 3, 'Teaching Materials and Handouts', 6, 'Laboratory Manual & Practical Protocols', 'INSTITUTIONAL', 'Approved', 100, 'Oct 20, 2026', 'view_replace', 'View', null, '8 Python/Prolog AI Lab assignments with rubric sheets'],
      // 4. Assignments and Question Papers
      [7, 4, 4, 'Assignments and Question Papers', 7, 'CIA-I & CIA-II Question Papers with Scheme', 'MANDATORY', 'Approved', 100, 'Oct 22, 2026', 'view_replace', 'View', 7, 'Complete answer keys, scheme of marking, and CO-mapping tags verified'],
      [8, 4, 4, 'Assignments and Question Papers', 8, 'Model Question Paper & Previous 3-Year University', 'STATUTORY', 'Approved', 100, 'Oct 20, 2026', 'view_replace', 'View', null, 'End-semester model paper prepared under R-2022 format'],
      [9, 4, 4, 'Assignments and Question Papers', 9, 'Sample Evaluated Student Answer Scripts', 'MANDATORY', 'In Progress', 66, 'Oct 25, 2026', 'upload', 'Upload Script', 9, 'CS504 High & Low scripts scanned • Awaiting Medium score sample'],
      // 5. Attendance and Assessment Marks
      [10, 4, 5, 'Attendance and Assessment Marks', 10, 'Verified Student Attendance Register', 'MANDATORY', 'Approved', 100, 'Oct 26, 2026', 'view_replace', 'View Register', 10, '62 students enrolled • Overall average: 86.4% • 3 students flagged under 75%'],
      [11, 4, 5, 'Attendance and Assessment Marks', 11, 'CIA Internal Assessment Consolidated Marks', 'MANDATORY', 'In Progress', 50, 'Oct 27, 2026', 'enter_marks', 'Enter Marks', 11, 'CIA-1 marks entered • CIA-2 entry pending (45/62 submitted)'],
      // 6. Result Analysis and Feedback
      [12, 4, 6, 'Result Analysis and Feedback', 12, 'Internal Exam Result Analysis & Bell Curve', 'MANDATORY', 'Not Started', 0, null, 'generate', 'Generate', null, 'Statistical pass percentage, mean & standard deviation charts (locked pending CIA-II)'],
      [13, 4, 6, 'Result Analysis and Feedback', 13, 'Student Course Feedback & Indirect Survey', 'STATUTORY', 'Pending Window', 0, null, 'view_replace', 'Attach Survey', null, 'End-course indirect feedback survey opens Nov 08, 2026'],
      // 7. CO-PO Mapping and Attainment
      [14, 4, 7, 'CO-PO Mapping and Attainment', 14, 'CO-PO & CO-PSO Articulation Matrix with Weightages', 'MANDATORY', 'Approved', 100, 'Oct 19, 2026', 'view_edit', 'View Matrix', null, '12 Program Outcomes + 2 PSOs fully correlated with weighted rationales'],
      [15, 4, 7, 'CO-PO Mapping and Attainment', 15, 'Direct & Indirect CO Attainment Computation', 'MANDATORY', 'In Progress', 65, 'Oct 28, 2026', 'recalculate', 'Recalculate', null, 'Direct attainment derived at 60% target • Partial calculation (pending CIA-II marks)']
    ];

    for (const item of matrixItemsCS504) {
      await runQuery(`
        INSERT OR IGNORE INTO course_components (id, faculty_course_id, section_number, section_name, item_index, title, type, status, verification_percentage, review_date, action_type, action_label, document_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, item);
    }

    // 7. Seed Pending Tasks (matching input_file_1.png)
    const sampleTasks = [
      [1, 2, 11, 'CS503', 'Upload Mid-Term Exam Question Paper & Evaluation Scheme', 'Oct 28, 2026', 'High', 'Upload Artifact', '/faculty/course/11/documents', 'PENDING', '2026-10-24 10:00:00'],
      [2, 2, 10, 'CS501', 'Reconcile Student Attendance Shortfall Records (Month 2)', 'Nov 02, 2026', 'Medium', 'Update Attendance', '/faculty/course/10', 'PENDING', '2026-10-25 11:30:00'],
      [3, 2, 11, 'CS503', "Complete Unit IV Bloom's Taxonomy CO-PO Direct Attainment Mapping", 'Nov 08, 2026', 'Normal', 'Configure Matrix', '/faculty/course/11', 'PENDING', '2026-10-26 14:00:00']
    ];

    for (const t of sampleTasks) {
      await runQuery(`
        INSERT OR IGNORE INTO tasks (id, user_id, faculty_course_id, course_code, title, due_date, priority, action_label, action_path, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, t);
    }

    // Also replicate tasks for user 5 if needed
    for (const t of sampleTasks) {
      await runQuery(`
        INSERT OR IGNORE INTO tasks (user_id, faculty_course_id, course_code, title, due_date, priority, action_label, action_path, status, created_at)
        VALUES (5, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10]]);
    }

    // 8. Seed Notifications (matching badge 3 and audit events)
    const sampleNotifications = [
      [1, 2, 'Lesson Plan Submitted', 'Submitted revised Lesson Plan & Delivery Schedule for Unit 3', 'CS501', 'SUBMISSION', 0, '2026-10-26 12:30:00'],
      [2, 2, 'CIA-I Approved', 'HOD Dr. R. Kulkarni approved CIA-I Assessment Rubrics & Sample Papers', 'CS508 Lab', 'APPROVAL', 0, '2026-10-25 16:15:00'],
      [3, 2, 'Returned for Correction', 'Please update CIA-II marks bell curve analysis', 'CS502', 'CORRECTION', 0, '2026-10-24 10:00:00']
    ];

    for (const n of sampleNotifications) {
      await runQuery(`
        INSERT OR IGNORE INTO notifications (id, user_id, title, message, course_code, type, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, n);
    }

    for (const n of sampleNotifications) {
      await runQuery(`
        INSERT OR IGNORE INTO notifications (user_id, title, message, course_code, type, is_read, created_at)
        VALUES (5, ?, ?, ?, ?, ?, ?)
      `, [n[2], n[3], n[4], n[5], n[6], n[7]]);
    }

    // 9. Seed Review History
    await runQuery(`
      INSERT OR IGNORE INTO reviews (id, faculty_course_id, reviewer_id, status, comments, created_at)
      VALUES
      (1, 4, 4, 'UNDER_REVIEW', 'Course file received for mid-semester verification', '2026-10-26 14:35:00'),
      (2, 6, 4, 'CORRECTION_REQUIRED', 'Please update Unit IV Bloom cognitive levels and reconcile CO attainment targets before final audit submission.', '2026-10-25 11:25:00'),
      (3, 7, 4, 'APPROVED', 'All 14 statutory components verified and aligned with NBA Tier-I standards.', '2026-10-20 09:15:00'),
      (4, 8, 4, 'APPROVED', 'Continuous internal assessment rubrics and lab records signed off.', '2026-10-18 16:50:00')
    `);

  } catch (err) {
    console.error('Error seeding institutional data:', err);
    throw err;
  }
}

module.exports = {
  db,
  databaseReady,
  runQuery,
  getQuery,
  allQuery
};
