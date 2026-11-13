const express = require('express');
const router = express.Router();
const { runQuery, getQuery, allQuery } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(checkRole(['REVIEWER', 'HOD', 'ADMIN']));

// 1. Get Reviewer dashboard (list courses assigned to reviewer)
router.get('/dashboard', async (req, res) => {
  try {
    const query = `
      SELECT fc.id as faculty_course_id, fc.status, fc.reviewer_comments, fc.last_submitted_at,
             fc.role_title, fc.dossier_deadline, fc.verified_items, fc.total_items,
             c.code, c.name, c.department, c.semester, c.academic_year, c.credits, c.ltp, c.section, c.course_type,
             u.name as faculty_name, u.email as faculty_email
      FROM faculty_courses fc
      JOIN courses c ON fc.course_id = c.id
      JOIN users u ON fc.faculty_id = u.id
      WHERE (fc.reviewer_id = ? OR ? = 1)
      ORDER BY 
        CASE fc.status 
          WHEN 'SUBMITTED' THEN 1 
          WHEN 'UNDER_REVIEW' THEN 2 
          WHEN 'CORRECTION_REQUIRED' THEN 3 
          ELSE 4 
        END,
        c.code ASC
    `;
    const courses = await allQuery(query, [req.userId, req.userBaseRole === 'ADMIN' ? 1 : 0]);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching reviewer dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. Submit Review Decision (Approve / Request Corrections)
router.post('/review/:id', async (req, res) => {
  const facultyCourseId = req.params.id;
  const { status, comments } = req.body; // status: APPROVED or CORRECTION_REQUIRED

  if (!status || !['APPROVED', 'CORRECTION_REQUIRED'].includes(status)) {
    return res.status(400).json({ message: 'Valid status (APPROVED or CORRECTION_REQUIRED) is required' });
  }

  try {
    // Verify assignment belongs to this reviewer (or admin)
    const assignment = await getQuery(
      'SELECT fc.*, c.code FROM faculty_courses fc JOIN courses c ON fc.course_id = c.id WHERE fc.id = ? AND (fc.reviewer_id = ? OR ? = 1)',
      [facultyCourseId, req.userId, req.userBaseRole === 'ADMIN' ? 1 : 0]
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Course file assignment not found or access denied' });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Update status in mapping
    await runQuery(
      'UPDATE faculty_courses SET status = ?, reviewer_comments = ?, hod_note = ? WHERE id = ?',
      [status, comments || '', status === 'CORRECTION_REQUIRED' ? (comments || 'Corrections requested') : null, facultyCourseId]
    );

    // Insert review audit trail log
    await runQuery(`
      INSERT INTO reviews (faculty_course_id, reviewer_id, status, comments, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, [facultyCourseId, req.userId, status, comments || '', now]);

    // Send notification to the faculty member!
    const notifTitle = status === 'APPROVED' ? `Course File Approved (${assignment.code})` : `Correction Required (${assignment.code})`;
    const notifType = status === 'APPROVED' ? 'APPROVAL' : 'CORRECTION';
    await runQuery(`
      INSERT INTO notifications (user_id, title, message, course_code, type, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `, [assignment.faculty_id, notifTitle, comments || `Review decision updated to ${status}`, assignment.code, notifType, now]);

    res.json({ message: `Course file marked as ${status}` });
  } catch (error) {
    console.error('Error recording review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. Get complete review history for a course file
router.get('/review-history/:id', async (req, res) => {
  try {
    const history = await allQuery(`
      SELECT r.*, u.name as reviewer_name
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.faculty_course_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.id]);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 4. Get detailed checklist & statutory matrix of a course file for Reviewer
router.get('/course/:id', async (req, res) => {
  const facultyCourseId = req.params.id;

  try {
    const courseInfo = await getQuery(`
      SELECT fc.id as faculty_course_id, fc.status, fc.reviewer_comments, fc.hod_note,
             fc.role_title, fc.dossier_deadline, fc.verified_items, fc.total_items, fc.last_submitted_at,
             c.id as course_id, c.code, c.name, c.department, c.semester, c.academic_year, c.credits, c.ltp, c.section, c.course_type,
             u.name as faculty_name, u.email as faculty_email
      FROM faculty_courses fc
      JOIN courses c ON fc.course_id = c.id
      JOIN users u ON fc.faculty_id = u.id
      WHERE fc.id = ? AND (fc.reviewer_id = ? OR ? = 1)
    `, [facultyCourseId, req.userId, req.userBaseRole === 'ADMIN' ? 1 : 0]);

    if (!courseInfo) {
      return res.status(404).json({ message: 'Course assignment not found or access denied' });
    }

    // Fetch the 15 statutory components
    const components = await allQuery(`
      SELECT cc.*, d.filename as doc_filename, d.filepath as doc_filepath
      FROM course_components cc
      LEFT JOIN documents d ON cc.document_id = d.id
      WHERE cc.faculty_course_id = ?
      ORDER BY cc.section_number ASC, cc.item_index ASC
    `, [facultyCourseId]);

    // Fetch documents
    const documents = await allQuery(`
      SELECT d.*, u.name as uploader_name
      FROM documents d
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.faculty_course_id = ?
      ORDER BY d.category, d.filename
    `, [facultyCourseId]);

    // Review history
    const history = await allQuery(`
      SELECT r.*, u.name as reviewer_name
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.faculty_course_id = ?
      ORDER BY r.created_at DESC
    `, [facultyCourseId]);

    res.json({
      courseInfo,
      components,
      documents,
      history
    });
  } catch (error) {
    console.error('Error fetching course workspace for reviewer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
