import {
  Accreditation,
  CottageType,
  EnrollmentTypeV2,
  GradeLevel,
  Program,
} from '@prisma/client';
import { check } from 'express-validator';

import initMiddleware from '@/lib/server/init-middleware';
import validate from '@/lib/server/validate';
import { SCHOOL_YEAR } from '@/utils/constants';

const enrollmentTypes = Object.values(EnrollmentTypeV2);
const gradeLevels = Object.values(GradeLevel);
const programs = Object.values(Program);
const cottageTypes = Object.values(CottageType);
const schoolYearLabels = Object.values(SCHOOL_YEAR);
/** Same options as `enrollment.js` step “Select an Accreditation”. */
const homeschoolAccreditations = [
  Accreditation.LOCAL,
  Accreditation.INTERNATIONAL,
  Accreditation.DUAL,
];

const rules = [
  check('schoolYear')
    .isIn(schoolYearLabels)
    .withMessage('School year is not valid'),
  check('enrollmentType')
    .isIn(enrollmentTypes)
    .withMessage('Enrollment type is not valid'),
  check('gradeLevel')
    .isIn(gradeLevels)
    .withMessage('Grade level is not valid'),
  check('program').isIn(programs).withMessage('Program is not valid'),
  check('program').custom((value, { req }) => {
    if (
      value === Program.HOMESCHOOL_COTTAGE &&
      req.body.gradeLevel === GradeLevel.PRESCHOOL
    ) {
      throw new Error('Homeschool Cottage is not available for Preschool');
    }
    return true;
  }),
  check('cottageType')
    .optional({ values: 'falsy' })
    .isIn(cottageTypes)
    .withMessage('Cottage type is not valid'),
  check('cottageType').custom((value, { req }) => {
    if (req.body.program === Program.HOMESCHOOL_COTTAGE) {
      if (!value || !cottageTypes.includes(value)) {
        throw new Error('Cottage schedule is required for Homeschool Cottage');
      }
    }
    return true;
  }),
  check('accreditation')
    .isIn(homeschoolAccreditations)
    .withMessage('Accreditation is not valid'),
  check('accreditation').custom((value, { req }) => {
    const gl = req.body.gradeLevel;
    if (
      (gl === GradeLevel.PRESCHOOL || gl === GradeLevel.K1) &&
      (value === Accreditation.INTERNATIONAL || value === Accreditation.DUAL)
    ) {
      throw new Error(
        'International and dual accreditation are not available for this grade level'
      );
    }
    return true;
  }),
  check('formerSchoolName')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Former school name is required'),
  check('formerSchoolAddress')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Former school address is required'),
  check('formerRegistrar')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 200 }),
  check('formerRegistrarEmail')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 200 }),
  check('formerRegistrarNumber')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 80 }),
  check('formerRegistrar').custom((value, { req }) => {
    if (req.body.enrollmentType === EnrollmentTypeV2.NEW) {
      if (!String(value || '').trim()) {
        throw new Error('Former registrar full name is required for new students');
      }
    }
    return true;
  }),
  check('formerRegistrarEmail').custom((value, { req }) => {
    if (req.body.enrollmentType === EnrollmentTypeV2.NEW) {
      if (!String(value || '').trim()) {
        throw new Error('Former registrar email is required for new students');
      }
    }
    return true;
  }),
  check('formerRegistrarNumber').custom((value, { req }) => {
    if (req.body.enrollmentType === EnrollmentTypeV2.NEW) {
      if (!String(value || '').trim()) {
        throw new Error(
          'Former registrar contact number is required for new students'
        );
      }
    }
    return true;
  }),
  check('reportCard')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 2048 }),
  check('signature')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 2048 }),
  check('policyAgreement')
    .isBoolean()
    .withMessage('Policy agreement is required')
    .custom((v) => v === true)
    .withMessage('You must agree to the enrollment policies'),
];

const validateParentEnrollmentV2 = initMiddleware(validate(rules));

export default validateParentEnrollmentV2;
