import slugify from 'slugify';
import {
  Accreditation,
  Enrollment,
  GradeLevel,
  Program,
} from '@prisma/client';

import {
  validateCreateWorkspace,
  validateCreateWorkspaceWithStudent,
  validateSession,
} from '@/config/api-validation/index';
import {
  createWorkspace,
  getSingleWorkspace,
} from '@/prisma/services/workspace';
import { parentHasStudentWithFullName } from '@/prisma/services/parent-students';
import { createStudentRecord } from '@/prisma/services/student-record';
import { ensureV2EnrollmentStackForLegacyWorkspace } from '@/prisma/services/student-v2';
import { STUDENT_STATUS } from '@/utils/constants';

/** Legacy placeholders until the parent completes full enrollment for a school year. */
const LEGACY_FORMER_SCHOOL_NAME = 'N/A — set at enrollment';
const LEGACY_FORMER_SCHOOL_ADDRESS = 'N/A — set at enrollment';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const session = await validateSession(req, res);
    const createWithStudent = Boolean(
      typeof req.body?.firstName === 'string' && req.body.firstName.trim()
    );

    if (createWithStudent) {
      await validateCreateWorkspaceWithStudent(req, res);
    } else {
      await validateCreateWorkspace(req, res);
    }

    if (res.headersSent) return;

    if (createWithStudent) {
      const dup = await parentHasStudentWithFullName(
        session.user.userId,
        session.user.email,
        req.body.firstName,
        req.body.middleName,
        req.body.lastName
      );
      if (dup) {
        return res.status(400).json({
          errors: {
            fullName: {
              msg: 'A student with this full name already exists.',
            },
          },
        });
      }
    }

    const { name } = req.body;
    const slug = slugify(name.toLowerCase());
    const created = await createWorkspace(
      session.user.userId,
      session.user.email,
      name,
      slug
    );
    const workspace = await getSingleWorkspace(
      session.user.userId,
      session.user.email,
      created.slug
    );

    if (createWithStudent) {
      const {
        firstName,
        middleName,
        lastName,
        birthDate,
        gender,
        religion,
        reason,
        specialRadio,
        specialNeeds,
        address1,
        address2,
        internationAddress,
        pictureLink,
        birthCertificateLink,
        reportCardLink,
      } = req.body;

      if (!workspace?.id) {
        return res.status(500).json({
          errors: {
            error: { msg: 'Workspace could not be loaded after create' },
          },
        });
      }

      const specialNeedSpecific =
        specialRadio === 'YES' ? String(specialNeeds || '').trim() : '';

      await createStudentRecord(
        workspace.id,
        firstName,
        (middleName || '').trim(),
        lastName,
        new Date(birthDate),
        gender,
        religion,
        GradeLevel.PRESCHOOL,
        Enrollment.NEW,
        Program.HOMESCHOOL_PROGRAM,
        null,
        Accreditation.LOCAL,
        null,
        reason?.trim() || null,
        LEGACY_FORMER_SCHOOL_NAME,
        LEGACY_FORMER_SCHOOL_ADDRESS,
        pictureLink || null,
        birthCertificateLink || null,
        reportCardLink || null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        STUDENT_STATUS.PENDING,
        null,
        specialRadio,
        specialNeedSpecific || null,
        null,
        null,
        null,
        address1?.trim() || null,
        address2?.trim() || null,
        internationAddress?.trim() || null
      );

      ensureV2EnrollmentStackForLegacyWorkspace(workspace.id).catch(() => {});
    }

    res.status(200).json({
      data: { name, slug: created.slug, workspace },
    });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
