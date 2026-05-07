/**
 * Student identity + address + optional documents (same core fields as enrollment step 1).
 * Program / grade / school year for a year stay on `EnrollmentV2` when completing full enrollment.
 */
import { check } from 'express-validator';
import { Gender, Religion } from '@prisma/client';
import initMiddleware from '@/lib/server/init-middleware';
import validate from '@/lib/server/validate';

const religions = Object.values(Religion);
const genders = Object.values(Gender);

const rules = [
  check('name')
    .isLength({ min: 1, max: 128 })
    .withMessage('Name must be provided and must not exceed 128 characters'),
  check('firstName')
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('First name is required'),
  check('middleName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 120 })
    .withMessage('Middle name is too long'),
  check('lastName')
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Last name is required'),
  check('birthDate')
    .isISO8601()
    .withMessage('Valid birth date is required'),
  check('gender')
    .isIn(genders)
    .withMessage('Gender is not valid'),
  check('religion')
    .isIn(religions)
    .withMessage('Religion is not valid'),
  check('reason')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Reason for homeschooling is required'),
  check('specialRadio')
    .isIn(['YES', 'NO'])
    .withMessage('Special needs selection is required'),
  check('specialNeeds')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 2000 }),
  check('specialNeeds').custom((value, { req }) => {
    if (req.body.specialRadio === 'YES') {
      return String(value || '').trim().length > 0;
    }
    return true;
  }).withMessage('Please specify special needs'),
  check('address1')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Street address is required'),
  check('address2')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Complete address (province / city / barangay) is required'),
  check('internationAddress')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 }),
  check('pictureLink')
    .optional({ values: 'falsy' })
    .isLength({ max: 2048 }),
  check('birthCertificateLink')
    .optional({ values: 'falsy' })
    .isLength({ max: 2048 }),
  check('reportCardLink')
    .optional({ values: 'falsy' })
    .isLength({ max: 2048 }),
];

const validateCreateWorkspaceWithStudent = initMiddleware(validate(rules));

export default validateCreateWorkspaceWithStudent;
