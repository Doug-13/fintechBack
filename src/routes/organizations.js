import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Organization } from '../models/Organization.js';
import { Membership } from '../models/Membership.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/',
  auth,
  body('name').isString().isLength({ min: 2 }),
  body('slug').isSlug(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, slug } = req.body;
      const org = await Organization.create({ name, slug });
      // creator gets membership with all modules read/write by default
      await Membership.create({
        organizationId: org._id,
        userId: req.user._id,
        modules: ['core','billing','library'],
        permissions: new Map([
          ['core', { read: true, write: true }],
          ['billing', { read: true, write: true }],
          ['library', { read: true, write: true }]
        ])
      });
      res.status(201).json(org);
    } catch (e) { next(e); }
  }
);

router.get('/', auth, async (req, res, next) => {
  try {
    const memberships = await Membership.find({ userId: req.user._id, active: true }).lean();
    const orgIds = memberships.map(m => m.organizationId);
    const orgs = await Organization.find({ _id: { $in: orgIds } });
    res.json(orgs);
  } catch (e) { next(e); }
});

router.patch('/:id',
  auth,
  param('id').isMongoId(),
  body('name').optional().isString(),
  body('logoUrl').optional().isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const org = await Organization.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
      if (!org) return res.status(404).json({ error: 'Organização não encontrada' });
      res.json(org);
    } catch (e) { next(e); }
  }
);

export default router;
