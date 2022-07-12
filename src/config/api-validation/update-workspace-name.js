import { check } from 'express-validator';
import initMiddleware from '@/lib/server/init-middleware';
import validate from '@/lib/server/validate';

const rules = [
  check('name')
    .isLength({ min: 1, max: 64 })
    .withMessage('Name must be provided and must not exceed 64 characters'),
];

const validateUpdateWorkspaceName = initMiddleware(validate(rules));

export default validateUpdateWorkspaceName;
