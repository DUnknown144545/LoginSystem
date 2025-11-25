import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'node:crypto';
import { ensureAuthenticated, ensureGuest } from '../middleware/auth.js';

const router = Router();

router.get('/login', ensureGuest, (req, res) => {
  res.render('login', { errors: [], values: { username: '' } });
});

router.post(
  '/login',
  ensureGuest,
  [
    body('username').trim().isLength({ min: 1, max: 100 }).withMessage('Username is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('login', {
        errors: errors.array(),
        values: { username: req.body.username || '' },
      });
    }

    const fixed = process.env.FIXED_PASSWORD || 'change-this-password';
    const input = String(req.body.password);
    const match =
      fixed.length === input.length &&
      crypto.timingSafeEqual(Buffer.from(fixed), Buffer.from(input));

    if (!match) {
      return res.status(401).render('login', {
        errors: [{ msg: 'Invalid username or password' }],
        values: { username: req.body.username || '' },
      });
    }

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).send('Unable to create session');
      }
      req.session.user = { id: 'fixed', username: req.body.username };
      res.redirect('/dashboard');
    });
  }
);

router.get('/register', ensureGuest, (req, res) => {
  res.render('register', { errors: [], values: { username: '' } });
});

router.post('/register', ensureGuest, (req, res) => {
  return res.status(501).render('register', {
    errors: [{ msg: 'Registration is not available yet (no database connection).' }],
    values: { username: req.body?.username || '' },
  });
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard');
});

router.post('/logout', ensureAuthenticated, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.redirect('/');
  });
});

export { router };
