const express = require('express');
const router = express.Router();
const { allQuery } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken, checkRole(['STUDENT']));

router.get('/courses', async (req, res) => {
  try {
    const courses = await allQuery(`
      SELECT c.id, c.code, c.name, c.semester, c.academic_year
      FROM enrollments e
      JOIN students s ON s.id = e.student_id
      JOIN courses c ON c.id = e.course_id
      JOIN users u ON lower(u.email) = lower(s.email)
      WHERE u.id = ?
      ORDER BY c.code
    `, [req.userId]);

    res.json({ courses });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/documents', async (req, res) => {
  const { course_code: courseCode, category, search } = req.query;

  try {
    let sql = `
      SELECT d.id, d.original_name, d.filepath, d.filesize, d.filetype, d.category,
             d.created_at, c.code AS course_code, c.name AS course_name
      FROM documents d
      JOIN faculty_courses fc ON fc.id = d.faculty_course_id
      JOIN courses c ON c.id = fc.course_id
      JOIN enrollments e ON e.course_id = c.id
      JOIN students s ON s.id = e.student_id
      JOIN users u ON lower(u.email) = lower(s.email)
      WHERE u.id = ?
    `;
    const params = [req.userId];

    if (courseCode) {
      sql += ' AND c.code = ?';
      params.push(courseCode);
    }
    if (category && category !== 'All') {
      sql += ' AND d.category = ?';
      params.push(category);
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ' AND (d.original_name LIKE ? OR d.filename LIKE ? OR d.category LIKE ? OR c.code LIKE ? OR c.name LIKE ?)';
      params.push(term, term, term, term, term);
    }

    sql += ' ORDER BY d.created_at DESC';
    const documents = await allQuery(sql, params);
    res.json({ documents });
  } catch (error) {
    console.error('Error searching enrolled course documents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
