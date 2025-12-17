import { validateSession } from '@/config/api-validation';
import prisma from '@/prisma/index';
import Papa from 'papaparse';
import slugify from 'slugify';
import crypto from 'crypto';
import { sendMail } from '@/lib/server/mail';
import {
  html as accountHtml,
  text as accountText,
} from '@/config/email-templates/account-created';
import {
  html as enrollmentHtml,
  text as enrollmentText,
} from '@/config/email-templates/enrollment-received';
import { getUserWithGuardianInfo, createGuardianUser, createGuardianInformation } from '@/prisma/services/user';
import { createStudentRecord } from '@/prisma/services/student-record';
import { createWorkspaceWithSlug } from '@/prisma/services/workspace';
import { STUDENT_STATUS } from '@/utils/constants';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    try {
      const session = await validateSession(req, res);
      const { csvData } = req.body;

      if (!csvData) {
        return res.status(400).json({ error: 'CSV data is required' });
      }

      // Parse CSV
      const parsed = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });

      if (parsed.errors.length > 0) {
        return res.status(400).json({
          error: 'CSV parsing failed',
          details: parsed.errors,
        });
      }

      const rows = parsed.data;
      const results = {
        imported: 0,
        skipped: 0,
        failed: 0,
      };
      const details = [];

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 1;

        try {
          // Quick validation
          if (!row['First Name']?.trim() || !row['Last Name']?.trim() || !row['Account Email']?.trim()) {
            results.failed++;
            details.push({
              row: rowNumber,
              status: 'failed',
              email: row['Account Email'] || 'N/A',
              error: 'Missing required fields',
            });
            continue;
          }

          // Check for duplicates
          const existingStudent = await prisma.studentRecord.findFirst({
            where: {
              firstName: {
                equals: row['First Name'].trim(),
                mode: 'insensitive',
              },
              middleName: {
                equals: row['Middle Name']?.trim() || null,
                mode: 'insensitive',
              },
              lastName: {
                equals: row['Last Name'].trim(),
                mode: 'insensitive',
              },
              schoolYear: row['School Year']?.trim(),
              incomingGradeLevel: row['Grade Level']?.toUpperCase(),
              deletedAt: null,
            },
          });

          if (existingStudent) {
            results.skipped++;
            details.push({
              row: rowNumber,
              status: 'skipped',
              email: row['Account Email'],
              error: 'Duplicate student',
            });
            continue;
          }

          // Process student import in a transaction
          await prisma.$transaction(async (tx) => {
            // Check if user exists
            let user = await getUserWithGuardianInfo(row['Account Email'].trim());
            let isNewAccount = false;

            if (!user) {
              // Create new user account
              user = await createGuardianUser(
                row['Account Email'].trim(),
                row['Primary Guardian Name']?.trim() || 'Guardian'
              );
              isNewAccount = true;

              // Create guardian information
              await createGuardianInformation(user.id, {
                primaryGuardianName: row['Primary Guardian Name']?.trim(),
                primaryGuardianOccupation: row['Primary Guardian Occupation']?.trim(),
                primaryGuardianType: row['Primary Guardian Type']?.toUpperCase(),
                primaryGuardianProfile: row['Primary Guardian Profile']?.trim(),
                secondaryGuardianName: row['Secondary Guardian Name']?.trim(),
                secondaryGuardianOccupation: row['Secondary Guardian Occupation']?.trim(),
                secondaryGuardianType: row['Secondary Guardian Type']?.toUpperCase(),
                secondaryGuardianProfile: row['Secondary Guardian Profile']?.trim(),
                mobileNumber: row['Mobile Number']?.trim(),
                telephoneNumber: row['Telephone Number']?.trim(),
                anotherEmail: row['Another Email']?.trim(),
                address1: row['Address Line 1']?.trim(),
                address2: row['Address Line 2']?.trim(),
              });
            }

            // Create workspace (student record container)
            const firstName = row['First Name'].trim();
            const lastName = row['Last Name'].trim();
            const schoolYear = row['School Year']?.trim();

            const slug = slugify(
              `${firstName.toLowerCase()} ${lastName.toLowerCase()} ${schoolYear} ${crypto
                .createHash('md5')
                .update(`${firstName} ${lastName} ${schoolYear} ${Date.now()}`)
                .digest('hex')
                .substring(0, 6)}`,
              { lower: true, strict: true }
            );

            const workspace = await createWorkspaceWithSlug(
              user.id,
              user.email,
              `${firstName} ${lastName} ${schoolYear}`,
              slug
            );

            // Create student record
            await createStudentRecord(
              workspace.id,
              firstName,
              row['Middle Name']?.trim() || null,
              lastName,
              new Date(row['Birth Date'].trim()),
              row['Gender']?.toUpperCase(),
              row['Religion']?.toUpperCase(),
              row['Grade Level']?.toUpperCase(),
              row['Enrollment Type']?.toUpperCase(),
              row['Program']?.toUpperCase(),
              row['Cottage Type']?.toUpperCase() || null,
              row['Accreditation']?.toUpperCase(),
              schoolYear,
              row['Reason']?.trim(),
              row['Former School Name']?.trim(),
              row['Former School Address']?.trim(),
              null, // image
              null, // liveBirthCertificate
              null, // reportCard
              null, // discount
              row['Primary Teacher Name']?.trim(),
              row['Primary Teacher Age']?.trim(),
              row['Primary Teacher Relationship']?.trim(),
              row['Primary Teacher Education']?.trim(),
              row['Primary Teacher Profile']?.trim(),
              STUDENT_STATUS.PENDING,
              null, // signature
              row['Special Needs']?.trim(),
              row['Special Needs']?.trim() === 'YES' ? row['Special Needs Specific']?.trim() : null,
              row['Former Registrar']?.trim() || null,
              row['Former Registrar Email']?.trim() || null,
              row['Former Registrar Number']?.trim() || null,
              row['Student Address 1']?.trim() || row['Address Line 1']?.trim(),
              row['Student Address 2']?.trim() || row['Address Line 2']?.trim()
            );

            // Send emails
            if (isNewAccount) {
              await sendMail({
                html: accountHtml({
                  guardianName: row['Primary Guardian Name']?.trim() || 'Guardian',
                  studentName: `${firstName} ${lastName}`,
                }),
                subject: `[Living Pupil Homeschool] Welcome! Your Account Has Been Created`,
                text: accountText({
                  guardianName: row['Primary Guardian Name']?.trim() || 'Guardian',
                  studentName: `${firstName} ${lastName}`,
                }),
                to: [user.email],
              });
            }

            // Send enrollment confirmation
            const getParentName = (str) => {
              str = str?.trim() || '';
              if (str === '') return '';
              const words = str.split(/\s+/);
              const lastWord = words[words.length - 1];
              return lastWord.replace(/[.,?!;:]$/, '');
            };

            await sendMail({
              html: enrollmentHtml({
                parentName: getParentName(row['Primary Guardian Name']),
                firstName: firstName,
              }),
              subject: `Enrollment Form Received - Verification in Progress!`,
              text: enrollmentText({
                parentName: getParentName(row['Primary Guardian Name']),
                firstName: firstName,
              }),
              to: [user.email],
            });

            results.imported++;
            details.push({
              row: rowNumber,
              status: 'success',
              email: user.email,
              studentName: `${firstName} ${lastName}`,
            });
          });
        } catch (error) {
          console.error(`Error processing row ${rowNumber}:`, error);
          results.failed++;
          details.push({
            row: rowNumber,
            status: 'failed',
            email: row['Account Email'] || 'N/A',
            error: error.message || 'Unknown error',
          });
        }
      }

      return res.status(200).json({
        success: true,
        results,
        details,
      });
    } catch (error) {
      console.error('Import processing error:', error);
      return res.status(500).json({ error: 'Failed to process import' });
    }
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
