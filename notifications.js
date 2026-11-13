const express = require('express');
const router = express.Router();
const { runQuery, allQuery, getQuery } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const list = await allQuery(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [req.userId]);

    const unreadCountRow = await getQuery(`
      SELECT COUNT(*) as unread_count 
      FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `, [req.userId]);

    res.json({
      notifications: list,
      unreadCount: unreadCountRow ? unreadCountRow.unread_count : 0
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const result = await runQuery(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/read-all', async (req, res) => {
  try {
    await runQuery('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.userId]);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
