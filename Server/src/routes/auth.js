const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getQuery, runQuery, allQuery } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

const isInstitutionalStudentEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const normalized = email.toLowerCase().trim();
  return /^[a-z0-9]+(?:\.[a-z0-9]+)+@bmu\.edu\.in$/.test(normalized);
};

// User Login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    // Get user and their role
    const query = `
      SELECT u.id, u.name, u.email, u.password_hash, r.name as role 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ?
    `;
    const user = await getQuery(query, [cleanEmail]);

    if (!user) {
      const pendingAdminRequest = await getQuery(
        "SELECT id FROM admin_signup_requests WHERE lower(email) = ? AND status = 'PENDING'",
        [cleanEmail]
      );
      if (pendingAdminRequest) {
        return res.status(403).json({ message: 'Your Main Administrator account request is awaiting approval. Please try signing in after an existing administrator approves it.' });
      }
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role === 'REVIEWER' || user.role === 'HOD') {
      return res.status(403).json({ message: 'Reviewer and HOD workspaces are opened from the Main Administrator dashboard.' });
    }

    const roleUpper = role ? role.toUpperCase().trim() : user.role;
    const selectedRole = roleUpper === 'ADMINISTRATOR' ? 'ADMIN' : roleUpper;
    if (selectedRole !== user.role) {
      return res.status(403).json({ message: 'Selected role does not match this account.' });
    }

    const activeRole = selectedRole;

    // Ensure workspace data exists for active role
    if (activeRole === 'FACULTY') {
      const existingFC = await getQuery('SELECT id FROM faculty_courses WHERE faculty_id = ? LIMIT 1', [user.id]);
      if (!existingFC) {
        const availableCourses = await allQuery('SELECT id, code, name FROM courses ORDER BY id ASC LIMIT 2');
        const reviewer = await getQuery("SELECT id FROM users WHERE role_id = 3 LIMIT 1");
        const reviewerId = reviewer ? reviewer.id : 4;
        if (availableCourses && availableCourses.length > 0) {
          for (let i = 0; i < availableCourses.length; i++) {
            const c = availableCourses[i];
            await runQuery(`
              INSERT OR IGNORE INTO faculty_courses 
              (faculty_id, course_id, reviewer_id, status, role_title, dossier_deadline, verified_items, total_items)
              VALUES (?, ?, ?, 'IN_PROGRESS', 'Primary Instructor', 'Nov 30, 2026', 3, 14)
            `, [user.id, c.id, reviewerId]);
          }
        }
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: activeRole, baseRole: user.role },
      process.env.JWT_SECRET || 'super_secret_token_key_1234',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: activeRole,
        baseRole: user.role,
        designation: role || activeRole
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/workspace', verifyToken, async (req, res) => {
  const { role } = req.body;
  const targetRole = typeof role === 'string' ? role.toUpperCase().trim() : '';

  if (!['ADMIN', 'REVIEWER', 'HOD'].includes(targetRole)) {
    return res.status(400).json({ message: 'Choose the Main Administrator, Reviewer, or HOD workspace.' });
  }

  try {
    const user = await getQuery(`
      SELECT u.id, u.name, u.email, r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = ?
    `, [req.userId]);

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only the Main Administrator can switch to these workspaces.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: targetRole, baseRole: 'ADMIN' },
      process.env.JWT_SECRET || 'super_secret_token_key_1234',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: targetRole, baseRole: 'ADMIN' }
    });
  } catch (error) {
    console.error('Workspace switch error:', error);
    res.status(500).json({ message: 'Unable to open the selected workspace.' });
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, r.name as role 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ?
    `;
    const user = await getQuery(query, [req.userId]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ ...user, role: req.userRole, baseRole: req.userBaseRole });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/admin-signup-requests', async (req, res) => {
  const { name, email, password } = req.body;

  if (
    typeof name !== 'string' || typeof email !== 'string' ||
    typeof password !== 'string' || !name.trim() || !email.trim() || !password
  ) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.toLowerCase().trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ message: 'Please provide a valid institutional email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const existingAccount = await getQuery('SELECT id FROM users WHERE lower(email) = ?', [cleanEmail]);
    if (existingAccount) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const previousRequest = await getQuery(
      'SELECT id, status FROM admin_signup_requests WHERE lower(email) = ?',
      [cleanEmail]
    );

    if (previousRequest?.status === 'PENDING') {
      return res.status(409).json({ message: 'A Main Administrator account request for this email is already awaiting approval.' });
    }

    if (previousRequest) {
      await runQuery(`
        UPDATE admin_signup_requests
        SET name = ?, password_hash = ?, status = 'PENDING',
            requested_at = datetime('now'), reviewed_at = NULL, reviewed_by = NULL
        WHERE id = ?
      `, [cleanName, passwordHash, previousRequest.id]);
    } else {
      await runQuery(
        'INSERT INTO admin_signup_requests (name, email, password_hash) VALUES (?, ?, ?)',
        [cleanName, cleanEmail, passwordHash]
      );
    }

    res.status(202).json({
      message: 'Your Main Administrator account request was submitted. You can sign in after an existing administrator approves it.'
    });
  } catch (error) {
    console.error('Main Administrator signup request error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'A request or account already exists for this email.' });
    }
    res.status(500).json({ message: 'Unable to submit the Main Administrator account request.' });
  }
});

// User Registration
router.post('/register', async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (
    typeof name !== 'string' || typeof email !== 'string' ||
    typeof password !== 'string' || typeof role !== 'string' ||
    !name.trim() || !email.trim() || !password || !role.trim()
  ) {
    return res.status(400).json({ message: 'Name, email, password, and role are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name.trim();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ message: 'Please provide a valid institutional email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  // Normalize and resolve role
  const roleUpper = role.toUpperCase().trim();
  let dbRoleName = 'FACULTY';
  let roleTitle = 'Primary Instructor';

  if (roleUpper === 'FACULTY') {
    dbRoleName = 'FACULTY';
    roleTitle = 'Primary Instructor';
  } else if (roleUpper === 'STUDENT') {
    dbRoleName = 'STUDENT';
    roleTitle = 'Student';
  } else {
    return res.status(403).json({ message: 'Only Faculty and Student accounts can be created here. Main Administrator accounts must be created by an existing administrator.' });
  }

  try {
    // Format display name smartly if HOD
    let displayName = cleanName;
    const roleRow = await getQuery('SELECT id, name FROM roles WHERE name = ?', [dbRoleName]);
    if (!roleRow) {
      return res.status(500).json({ message: 'Role configuration error in database.' });
    }

    let studentRecord = null;
    if (dbRoleName === 'STUDENT') {
      if (!isInstitutionalStudentEmail(cleanEmail)) {
        return res.status(403).json({ message: 'Student email must follow the format studentname.lastname@bmu.edu.in.' });
      }

      studentRecord = await getQuery('SELECT id FROM students WHERE lower(email) = ?', [cleanEmail]);
    }

    // Check if email already exists
    const existing = await getQuery(`
      SELECT u.id, u.password_hash, u.name, r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE lower(u.email) = ?
    `, [cleanEmail]);
    let newUserId;

    if (existing) {
      if (existing.role !== dbRoleName) {
        return res.status(403).json({ message: 'This account is already registered with a different role.' });
      }
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }

    if (dbRoleName === 'STUDENT' && !studentRecord) {
      const uniqueRollNumber = `ST${new Date().getFullYear()}${String(Date.now() % 1000000).padStart(6, '0')}`;
      await runQuery(
        'INSERT INTO students (roll_number, name, email) VALUES (?, ?, ?)',
        [uniqueRollNumber, displayName, cleanEmail]
      );
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const insertResult = await runQuery(
      'INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
      [displayName, cleanEmail, passwordHash, roleRow.id]
    );
    newUserId = insertResult.lastID;

    // Smart initial workspace provisioning based on role
    if (dbRoleName === 'FACULTY') {
      // Find 2 courses to assign to new faculty
      const availableCourses = await allQuery('SELECT id, code, name FROM courses ORDER BY id ASC LIMIT 2');
      const reviewer = await getQuery("SELECT id FROM users WHERE role_id = 3 LIMIT 1");
      const reviewerId = reviewer ? reviewer.id : 4;

      if (availableCourses && availableCourses.length > 0) {
        for (let i = 0; i < availableCourses.length; i++) {
          const c = availableCourses[i];
          const status = i === 0 ? 'IN_PROGRESS' : 'DRAFT';
          const verifiedItems = i === 0 ? 3 : 0;
          await runQuery(`
            INSERT OR IGNORE INTO faculty_courses 
            (faculty_id, course_id, reviewer_id, status, role_title, dossier_deadline, verified_items, total_items)
            VALUES (?, ?, ?, ?, ?, 'Nov 30, 2026', ?, 14)
          `, [newUserId, c.id, reviewerId, status, roleTitle, verifiedItems]);
        }

        // Add starter actionable task
        await runQuery(`
          INSERT INTO tasks (user_id, course_code, title, due_date, priority, action_label, action_path, status, created_at)
          VALUES (?, ?, 'Upload Approved Syllabus & Curriculum Matrix', 'Nov 15, 2026', 'High', 'Upload Artifact', '/faculty/courses', 'PENDING', datetime('now'))
        `, [newUserId, availableCourses[0].code]);
      }

      // Add welcome notification
      await runQuery(`
        INSERT INTO notifications (user_id, title, message, course_code, type, is_read, created_at)
        VALUES (?, 'Welcome to CFMS Portal', 'Your faculty account has been activated. Assigned course portfolios are ready in your workspace.', 'CFMS', 'SYSTEM', 0, datetime('now'))
      `, [newUserId]);
    } else if (dbRoleName === 'STUDENT') {
      await runQuery(`
        INSERT INTO notifications (user_id, title, message, course_code, type, is_read, created_at)
        VALUES (?, 'Welcome to CFMS Portal', 'Your student account is active. Course files for your enrolled courses will appear here.', 'CFMS', 'SYSTEM', 0, datetime('now'))
      `, [newUserId]);
    }

    // Generate JWT token for auto-login
    const token = jwt.sign(
      { id: newUserId, email: cleanEmail, role: roleRow.name, baseRole: roleRow.name },
      process.env.JWT_SECRET || 'super_secret_token_key_1234',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUserId,
        name: displayName,
        email: cleanEmail,
        role: roleRow.name,
        baseRole: roleRow.name,
        designation: roleUpper
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }
    res.status(500).json({ message: 'Internal server error during account creation.' });
  }
});

module.exports = router;
