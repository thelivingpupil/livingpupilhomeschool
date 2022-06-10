import { check } from 'express-validator';
import initMiddleware from '@/lib/server/init-middleware';
import validate from '@/lib/server/validate';

const rules = [
  check('name')
    .isLength({ min: 1, max: 32 })
    .withMessage('Name must be provided and must not exceed 32 characters'),
  check('email').isEmail().withMessage('Email must be valid'),
  check('subject')
    .isLength({ min: 1, max: 32 })
    .withMessage('Subject must not be empty'),
  check('message')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Message must be at least 5 characters long'),
];

const validateCreateInquiry = initMiddleware(validate(rules));

export default validateCreateInquiry;
