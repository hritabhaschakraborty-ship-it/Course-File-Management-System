-- Seed Data for Course File Management & Academic Documentation Automation System

-- 1. Insert Roles
INSERT OR IGNORE INTO roles (id, name) VALUES 
(1, 'ADMIN'),
(2, 'FACULTY'),
(3, 'REVIEWER'),
(4, 'STUDENT'),
(5, 'HOD');

-- 2. Insert Users (Password is 'password123' for all: bcrypt hash is '$2b$10$n4OQ4r91bL/iA1uF/bW4qOuFkU5e06vJbZly.3J.rY8rQcW8nSzeq')
INSERT OR IGNORE INTO users (id, name, email, password_hash, role_id) VALUES
(1, 'System Administrator', 'admin@cfms.edu', '$2b$10$n4OQ4r91bL/iA1uF/bW4qOuFkU5e06vJbZly.3J.rY8rQcW8nSzeq', 1),
(2, 'Dr. Aris Thorne (Faculty A)', 'faculty.a@cfms.edu', '$2b$10$n4OQ4r91bL/iA1uF/bW4qOuFkU5e06vJbZly.3J.rY8rQcW8nSzeq', 2),
(3, 'Prof. Clara Vance (Faculty B)', 'faculty.b@cfms.edu', '$2b$10$n4OQ4r91bL/iA1uF/bW4qOuFkU5e06vJbZly.3J.rY8rQcW8nSzeq', 2),
(4, 'Dr. Marcus Sterling (Reviewer X)', 'reviewer.x@cfms.edu', '$2b$10$n4OQ4r91bL/iA1uF/bW4qOuFkU5e06vJbZly.3J.rY8rQcW8nSzeq', 3),
(6, 'Dr. Rajesh Kulkarni (HOD CSE)', 'hod.cse@cfms.edu', '$2b$10$n4OQ4r91bL/iA1uF/bW4qOuFkU5e06vJbZly.3J.rY8rQcW8nSzeq', 5);

-- 3. Insert Courses
INSERT OR IGNORE INTO courses (id, code, name, department, semester, academic_year, credits, ltp) VALUES
(1, 'CS301', 'Computer Networks', 'Computer Science & Engineering', 'Semester V', '2026-27', 4, '3-1-0'),
(2, 'CS302', 'Software Engineering', 'Computer Science & Engineering', 'Semester V', '2026-27', 3, '3-0-0'),
(3, 'CS303', 'Artificial Intelligence', 'Computer Science & Engineering', 'Semester V', '2026-27', 4, '3-0-2');

-- 4. Assign Courses to Faculty & Reviewers
-- Assign CS301 (Computer Networks) to Faculty A (user 2), Reviewer X (user 4)
INSERT OR IGNORE INTO faculty_courses (id, faculty_id, course_id, reviewer_id, status) VALUES
(1, 2, 1, 4, 'IN_PROGRESS'),
-- Assign CS302 (Software Engineering) to Faculty B (user 3), Reviewer X (user 4)
(2, 3, 2, 4, 'DRAFT');

-- Sample CS301 course files for search, course/category filters, and student notifications.
INSERT OR IGNORE INTO documents
(id, faculty_course_id, filename, original_name, filepath, filesize, filetype, category, review_status, uploaded_by, created_at, updated_at)
VALUES
(12, 1, 'Unit1_Notes.pdf', 'Unit1_Notes.pdf', '/uploads/Unit1_Notes.pdf', 102400, 'PDF', 'Lecture Notes', 'Approved', 2, '2026-10-24 09:00:00', '2026-10-24 09:00:00'),
(13, 1, 'CS301_Assignment_1.pdf', 'CS301_Assignment_1.pdf', '/uploads/CS301_Assignment_1.pdf', 81920, 'PDF', 'Assignments', 'Approved', 2, '2026-10-25 09:00:00', '2026-10-25 09:00:00');

-- 5. Insert Students
INSERT OR IGNORE INTO students (id, roll_number, name, email) VALUES
(1, 'CS26B1001', 'Rahul Sharma', 'rahul.sharma@bmu.edu.in'),
(2, 'CS26B1002', 'Amit Patel', 'amit.patel@bmu.edu.in'),
(3, 'CS26B1003', 'Priya Singh', 'priya.singh@bmu.edu.in'),
(4, 'CS26B1004', 'Vikram Rao', 'vikram.rao@bmu.edu.in'),
(5, 'CS26B1005', 'Neha Gupta', 'neha.gupta@bmu.edu.in');

-- Student login accounts use the same demo password as the other seeded accounts.
INSERT OR IGNORE INTO users (name, email, password_hash, role_id)
SELECT name, email, '$2b$10$n4OQ4r91bL/iA1uF/bW4qOuFkU5e06vJbZly.3J.rY8rQcW8nSzeq', 4
FROM students;

-- 6. Enroll Students in Courses
-- Enroll all in CS301 (Course 1)
INSERT OR IGNORE INTO enrollments (id, student_id, course_id) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 1),
(4, 4, 1),
(5, 5, 1),
-- Enroll all in CS302 (Course 2)
(6, 1, 2),
(7, 2, 2),
(8, 3, 2),
(9, 4, 2),
(10, 5, 2);

-- 7. Pre-populate marks templates for enrollments
-- Midterm out of 30, Assignment out of 10, Quiz out of 10, Attendance out of 5, Performance out of 5. Total out of 60.
-- Let's add some marks for CS301
INSERT OR IGNORE INTO marks (enrollment_id, midterm, assignment, quiz, attendance_score, performance_score, total) VALUES
(1, 18.0, 6.0, 7.0, 3.0, 4.0, 38.0), -- Rahul (38/60) -> Risk Student (<40% or low attendance)
(2, 22.0, 8.0, 8.5, 4.0, 4.5, 47.0), -- Amit
(3, 27.0, 9.0, 9.0, 5.0, 4.5, 54.5), -- Priya
(4, 20.0, 7.5, 7.0, 3.5, 4.0, 42.0), -- Vikram
(5, 25.0, 8.5, 8.0, 4.5, 4.5, 50.5); -- Neha

-- Let's add some marks for CS302 (DRAFT state, mostly empty or zero to show active entry)
INSERT OR IGNORE INTO marks (enrollment_id, midterm, assignment, quiz, attendance_score, performance_score, total) VALUES
(6, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0),
(7, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0),
(8, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0),
(9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0),
(10, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);

-- 8. Setup syllabus records for CS301 (Faculty A uploaded version 1)
INSERT OR IGNORE INTO syllabus (id, faculty_course_id, filename, filepath, version, uploaded_at, uploaded_by, is_active) VALUES
(1, 1, 'CS301_Syllabus_v1.pdf', '/uploads/CS301_Syllabus_v1.pdf', 1, '2026-08-10 10:30:00', 2, 1);

-- 9. Setup lesson plan metadata for CS301
INSERT OR IGNORE INTO lesson_plans (id, faculty_course_id, total_units, start_date, end_date, weekly_days) VALUES
(1, 1, 5, '2026-08-01', '2026-11-30', '["Monday","Wednesday","Friday"]');

-- 10. Generate some sample lectures for CS301 (Lesson Plan Items)
INSERT OR IGNORE INTO lectures (id, faculty_course_id, unit, topic, planned_date, actual_date, status) VALUES
(1, 1, 'Unit 1', 'Introduction to Computer Networks & Internet', '2026-08-03', '2026-08-03', 'COMPLETED'),
(2, 1, 'Unit 1', 'Network Edge, Core & Packet Switching', '2026-08-05', '2026-08-05', 'COMPLETED'),
(3, 1, 'Unit 1', 'Delay, Loss and Throughput in Packet Networks', '2026-08-07', '2026-08-07', 'COMPLETED'),
(4, 1, 'Unit 2', 'Application Layer: HTTP, SMTP, DNS', '2026-08-10', '2026-08-10', 'COMPLETED'),
(5, 1, 'Unit 2', 'Peer-to-Peer Applications & Socket Programming', '2026-08-12', NULL, 'PENDING'),
(6, 1, 'Unit 3', 'Transport Layer: Multiplexing & UDP', '2026-08-14', NULL, 'PENDING'),
(7, 1, 'Unit 3', 'Reliable Data Transfer Principles', '2026-08-17', NULL, 'PENDING'),
(8, 1, 'Unit 3', 'TCP Connection Management & Congestion Control', '2026-08-19', NULL, 'PENDING');

-- 11. Add some attendance records for the completed classes in CS301
-- Lecture 1
INSERT OR IGNORE INTO attendance (enrollment_id, lecture_id, status) VALUES
(1, 1, 'ABSENT'), -- Rahul was absent
(2, 1, 'PRESENT'),
(3, 1, 'PRESENT'),
(4, 1, 'PRESENT'),
(5, 1, 'PRESENT');

-- Lecture 2
INSERT OR IGNORE INTO attendance (enrollment_id, lecture_id, status) VALUES
(1, 2, 'ABSENT'), -- Rahul was absent
(2, 2, 'PRESENT'),
(3, 2, 'PRESENT'),
(4, 2, 'PRESENT'),
(5, 2, 'PRESENT');

-- Lecture 3
INSERT OR IGNORE INTO attendance (enrollment_id, lecture_id, status) VALUES
(1, 3, 'ABSENT'), -- Rahul was absent
(2, 3, 'PRESENT'),
(3, 3, 'PRESENT'),
(4, 3, 'PRESENT'),
(5, 3, 'PRESENT');

-- Lecture 4
INSERT OR IGNORE INTO attendance (enrollment_id, lecture_id, status) VALUES
(1, 4, 'PRESENT'),
(2, 4, 'PRESENT'),
(3, 4, 'PRESENT'),
(4, 4, 'PRESENT'),
(5, 4, 'PRESENT');
