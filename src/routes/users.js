import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = Router();

router.get('/me', auth, async (req, res, next) => {
  try { res.json(req.user); } catch (e) { next(e); }
});

router.patch('/me',
  auth,
  body('name').optional().isString().isLength({ min: 2 }),
  body('photoUrl').optional().isString(),
  body('preferences.theme').optional().isIn(['light','dark','system']),
  body('preferences.language').optional().isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const updated = await User.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true });
      res.json(updated);
    } catch (e) { next(e); }
  }
);

export default router;
