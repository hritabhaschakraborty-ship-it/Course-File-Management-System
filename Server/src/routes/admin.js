const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { runQuery, getQuery, allQuery } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Secure all admin routes with verifyToken and checkRole(['ADMIN'])
router.use(verifyToken);
router.use(checkRole(['ADMIN']));

// Get Admin dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const stats = {
      totalCourses: 0,
      completedCourses: 0,
      activeCourses: 0,
      awaitingReview: 0,
      facultyCount: 0,
      reviewerCount: 0
    };

    // Count courses by status
    const courseStats = await allQuery(`
      SELECT status, COUNT(*) as count 
      FROM faculty_courses 
      GROUP BY status
    `);
    
    // Total courses defined in systemic master
    const totalCoursesMaster = await getQuery(`SELECT COUNT(*) as count FROM courses`);
    stats.totalCourses = totalCoursesMaster.count;

    courseStats.forEach(item => {
      if (item.status === 'APPROVED' || item.status === 'ARCHIVED') {
        stats.completedCourses += item.count;
      } else if (item.status === 'READY_FOR_REVIEW' || item.status === 'UNDER_REVIEW') {
        stats.awaitingReview += item.count;
        stats.activeCourses += item.count;
      } else {
        stats.activeCourses += item.count;
      }
    });

    // Counts of faculty and reviewers
    const userStats = await allQuery(`
      SELECT r.name as role, COUNT(*) as count 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      GROUP BY r.name
    `);

    userStats.forEach(item => {
      if (item.role === 'FACULTY') {
        stats.facultyCount = item.count;
      } else if (item.role === 'REVIEWER' || item.role === 'HOD') {
        stats.reviewerCount = item.count;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// List all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await allQuery(`
      SELECT c.*, fc.status, u1.name as faculty_name, u2.name as reviewer_name, fc.id as faculty_course_id
      FROM courses c
      LEFT JOIN faculty_courses fc ON c.id = fc.course_id
      LEFT JOIN users u1 ON fc.faculty_id = u1.id
      LEFT JOIN users u2 ON fc.reviewer_id = u2.id
    `);
    res.json(courses);
  } catch (error) {
    console.error('Error listing courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new course
router.post('/courses', async (req, res) => {
  const { code, name, department, semester, academic_year, credits, ltp, section, course_type, regulation } = req.body;

  if (!code || !name || !department || !semester || !academic_year || !credits || !ltp) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const query = `
      INSERT INTO courses (code, name, department, semester, academic_year, credits, ltp, section, course_type, regulation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await runQuery(query, [
      code, name, department, semester, academic_year, credits, ltp,
      section || 'Sec A', course_type || 'Core Theory', regulation || 'R-2022'
    ]);
    res.status(201).json({ message: 'Course created successfully' });
  } catch (error) {
    console.error('Error creating course:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// List users (Faculty & Reviewers)
router.get('/users', async (req, res) => {
  try {
    const users = await allQuery(`
      SELECT u.id, u.name, u.email, r.name as role 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('ADMIN', 'FACULTY', 'REVIEWER', 'HOD')
    `);
    res.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/account-requests', async (req, res) => {
  try {
    const requests = await allQuery(`
      SELECT id, name, email, requested_at
      FROM admin_signup_requests
      WHERE status = 'PENDING'
      ORDER BY requested_at ASC
    `);
    res.json(requests);
  } catch (error) {
    console.error('Error listing administrator account requests:', error);
    res.status(500).json({ message: 'Unable to load administrator account requests.' });
  }
});

router.post('/account-requests/:id/approve', async (req, res) => {
  const requestId = Number(req.params.id);
  if (!Number.isInteger(requestId) || requestId < 1) {
    return res.status(400).json({ message: 'Invalid account request.' });
  }

  try {
    await runQuery('BEGIN IMMEDIATE TRANSACTION');
    const accountRequest = await getQuery(`
      SELECT id, name, email, password_hash
      FROM admin_signup_requests
      WHERE id = ? AND status = 'PENDING'
    `, [requestId]);

    if (!accountRequest) {
      await runQuery('ROLLBACK');
      return res.status(404).json({ message: 'This request is no longer pending.' });
    }

    const role = await getQuery("SELECT id FROM roles WHERE name = 'ADMIN'");
    if (!role) {
      await runQuery('ROLLBACK');
      return res.status(500).json({ message: 'Administrator role is not configured.' });
    }

    await runQuery(
      'INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
      [accountRequest.name, accountRequest.email, accountRequest.password_hash, role.id]
    );
    await runQuery(`
      UPDATE admin_signup_requests
      SET status = 'APPROVED', password_hash = '', reviewed_at = datetime('now'), reviewed_by = ?
      WHERE id = ? AND status = 'PENDING'
    `, [req.userId, requestId]);
    await runQuery('COMMIT');

    res.json({ message: `Main Administrator account for ${accountRequest.name} was approved. They can now sign in.` });
  } catch (error) {
    await runQuery('ROLLBACK');
    console.error('Error approving administrator account request:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'An account already exists for this email. The request was not approved.' });
    }
    res.status(500).json({ message: 'Unable to approve the administrator account request.' });
  }
});

router.post('/account-requests/:id/reject', async (req, res) => {
  const requestId = Number(req.params.id);
  if (!Number.isInteger(requestId) || requestId < 1) {
    return res.status(400).json({ message: 'Invalid account request.' });
  }

  try {
    const result = await runQuery(`
      UPDATE admin_signup_requests
      SET status = 'REJECTED', password_hash = '', reviewed_at = datetime('now'), reviewed_by = ?
      WHERE id = ? AND status = 'PENDING'
    `, [req.userId, requestId]);

    if (result.changes !== 1) {
      return res.status(404).json({ message: 'This request is no longer pending.' });
    }
    res.json({ message: 'Administrator account request rejected.' });
  } catch (error) {
    console.error('Error rejecting administrator account request:', error);
    res.status(500).json({ message: 'Unable to reject the administrator account request.' });
  }
});

// Create a faculty account; Reviewer and HOD use Main Administrator workspaces.
router.post('/users', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (
    typeof name !== 'string' || typeof email !== 'string' ||
    typeof password !== 'string' || typeof role !== 'string' ||
    !name.trim() || !email.trim() || !password || !role.trim()
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.toLowerCase().trim();
  const cleanRole = role.toUpperCase().trim();

  if (!cleanName) {
    return res.status(400).json({ message: 'Name is required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ message: 'Please enter a valid institutional email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  if (!['FACULTY', 'ADMIN'].includes(cleanRole)) {
    return res.status(400).json({ message: 'Only Faculty and Main Administrator accounts can be created here. Reviewer and HOD are Main Administrator workspaces.' });
  }

  try {
    // Get role ID
    const roleRow = await getQuery('SELECT id FROM roles WHERE name = ?', [cleanRole]);
    if (!roleRow) {
      return res.status(400).json({ message: 'Role does not exist' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const query = `
      INSERT INTO users (name, email, password_hash, role_id)
      VALUES (?, ?, ?, ?)
    `;
    const result = await runQuery(query, [cleanName, cleanEmail, passwordHash, roleRow.id]);
    res.status(201).json({
      message: cleanRole === 'ADMIN' ? 'Main Administrator account created successfully. The new user can now sign in.' : 'Faculty account created successfully.',
      user: { id: result.lastID, name: cleanName, email: cleanEmail, role: cleanRole }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign course to faculty and reviewer
router.post('/assign-course', async (req, res) => {
  const { course_id, faculty_id, reviewer_id } = req.body;

  if (!course_id || !faculty_id || !reviewer_id) {
    return res.status(400).json({ message: 'Course, Faculty, and Reviewer are required' });
  }

  try {
    // Check if mapping already exists
    const existing = await getQuery('SELECT id FROM faculty_courses WHERE course_id = ?', [course_id]);
    
    if (existing) {
      // Update existing mapping
      const updateQuery = `
        UPDATE faculty_courses 
        SET faculty_id = ?, reviewer_id = ?, status = 'DRAFT'
        WHERE course_id = ?
      `;
      await runQuery(updateQuery, [faculty_id, reviewer_id, course_id]);
      return res.json({ message: 'Course assignment updated successfully' });
    }

    // Insert new mapping
    const insertQuery = `
      INSERT INTO faculty_courses (faculty_id, course_id, reviewer_id, status)
      VALUES (?, ?, ?, 'DRAFT')
    `;
    await runQuery(insertQuery, [faculty_id, course_id, reviewer_id]);
    res.status(201).json({ message: 'Course assigned successfully' });
  } catch (error) {
    console.error('Error assigning course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
