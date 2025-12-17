import { validateSession } from '@/config/api-validation';
import prisma from '@/prisma/index';
import Papa from 'papaparse';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    try {
      await validateSession(req, res);
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
      const validatedRows = [];
      let validCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;

      // Validate each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 1;
        const errors = [];
        const warnings = [];

        // Required fields validation
        if (!row['First Name']?.trim()) errors.push('First Name is required');
        if (!row['Last Name']?.trim()) errors.push('Last Name is required');
        if (!row['Birth Date']?.trim()) errors.push('Birth Date is required');
        if (!row['Gender']?.trim()) errors.push('Gender is required');
        if (!row['Religion']?.trim()) errors.push('Religion is required');
        if (!row['Reason']?.trim()) errors.push('Homeschooling Reason is required');
        if (!row['Special Needs']?.trim()) errors.push('Special Needs is required');
        if (!row['School Year']?.trim()) errors.push('School Year is required');
        if (!row['Grade Level']?.trim()) errors.push('Grade Level is required');
        if (!row['Enrollment Type']?.trim()) errors.push('Enrollment Type is required');
        if (!row['Former School Name']?.trim()) errors.push('Former School Name is required');
        if (!row['Former School Address']?.trim()) errors.push('Former School Address is required');
        if (!row['Program']?.trim()) errors.push('Program is required');
        if (!row['Accreditation']?.trim()) errors.push('Accreditation is required');
        if (!row['Account Email']?.trim()) errors.push('Account Email is required');

        // Guardian Information
        if (!row['Primary Guardian Name']?.trim()) errors.push('Primary Guardian Name is required');
        if (!row['Primary Guardian Occupation']?.trim()) errors.push('Primary Guardian Occupation is required');
        if (!row['Primary Guardian Type']?.trim()) errors.push('Primary Guardian Type is required');
        if (!row['Primary Guardian Profile']?.trim()) errors.push('Primary Guardian Profile is required');
        if (!row['Secondary Guardian Name']?.trim()) errors.push('Secondary Guardian Name is required');
        if (!row['Secondary Guardian Occupation']?.trim()) errors.push('Secondary Guardian Occupation is required');
        if (!row['Secondary Guardian Type']?.trim()) errors.push('Secondary Guardian Type is required');
        if (!row['Secondary Guardian Profile']?.trim()) errors.push('Secondary Guardian Profile is required');
        if (!row['Mobile Number']?.trim()) errors.push('Mobile Number is required');
        if (!row['Telephone Number']?.trim()) errors.push('Telephone Number is required');
        if (!row['Another Email']?.trim()) errors.push('Another Email is required');
        if (!row['Address Line 1']?.trim()) errors.push('Address Line 1 is required');
        if (!row['Address Line 2']?.trim()) errors.push('Address Line 2 is required');

        // Teacher Information
        if (!row['Primary Teacher Name']?.trim()) errors.push('Primary Teacher Name is required');
        if (!row['Primary Teacher Age']?.trim()) errors.push('Primary Teacher Age is required');
        if (!row['Primary Teacher Relationship']?.trim()) errors.push('Primary Teacher Relationship is required');
        if (!row['Primary Teacher Profile']?.trim()) errors.push('Primary Teacher Profile is required');
        if (!row['Primary Teacher Education']?.trim()) errors.push('Primary Teacher Education is required');

        // Enrollment Type specific validation
        if (row['Enrollment Type']?.trim() === 'NEW') {
          if (!row['Former Registrar']?.trim()) errors.push('Former Registrar is required for NEW enrollment');
          if (!row['Former Registrar Email']?.trim()) errors.push('Former Registrar Email is required for NEW enrollment');
          if (!row['Former Registrar Number']?.trim()) errors.push('Former Registrar Number is required for NEW enrollment');
        }

        // Data type validation
        if (row['Birth Date']?.trim()) {
          const date = new Date(row['Birth Date']);
          if (isNaN(date.getTime())) {
            errors.push('Birth Date must be a valid date (YYYY-MM-DD)');
          }
        }

        // Gender validation
        const validGenders = ['MALE', 'FEMALE'];
        if (row['Gender']?.trim() && !validGenders.includes(row['Gender'].toUpperCase())) {
          errors.push('Gender must be MALE or FEMALE');
        }

        // Grade Level validation
        const validGradeLevels = ['PRESCHOOL', 'K1', 'K2', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12'];
        if (row['Grade Level']?.trim() && !validGradeLevels.includes(row['Grade Level'].toUpperCase())) {
          errors.push('Invalid Grade Level');
        }

        // Enrollment Type validation
        const validEnrollmentTypes = ['NEW', 'CONTINUING'];
        if (row['Enrollment Type']?.trim() && !validEnrollmentTypes.includes(row['Enrollment Type'].toUpperCase())) {
          errors.push('Enrollment Type must be NEW or CONTINUING');
        }

        // Program validation
        const validPrograms = ['HOMESCHOOL_PROGRAM', 'HOMESCHOOL_COTTAGE'];
        if (row['Program']?.trim() && !validPrograms.includes(row['Program'].toUpperCase())) {
          errors.push('Program must be HOMESCHOOL_PROGRAM or HOMESCHOOL_COTTAGE');
        }

        // Cottage Type validation
        if (row['Program']?.toUpperCase() === 'HOMESCHOOL_COTTAGE') {
          if (!row['Cottage Type']?.trim()) {
            errors.push('Cottage Type is required for HOMESCHOOL_COTTAGE program');
          }
        }

        // Accreditation validation
        const validAccreditations = ['LOCAL', 'INTERNATIONAL', 'DUAL', 'FORM_ONE', 'FORM_TWO', 'FORM_THREE'];
        if (row['Accreditation']?.trim() && !validAccreditations.includes(row['Accreditation'].toUpperCase())) {
          errors.push('Invalid Accreditation type');
        }

        // Religion validation
        const validReligions = ['ROMAN_CATHOLIC', 'MUSLIM', 'BORN_AGAIN_CHRISTIAN', 'SEVENT_DAY_ADVENTIST', 'IGLESIA_NI_CRISTO', 'LATTER_DAY_SAINTS_MORMONS', 'OTHERS'];
        if (row['Religion']?.trim() && !validReligions.includes(row['Religion'].toUpperCase())) {
          errors.push('Invalid Religion type');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (row['Account Email']?.trim() && !emailRegex.test(row['Account Email'])) {
          errors.push('Invalid Account Email format');
        }
        if (row['Another Email']?.trim() && !emailRegex.test(row['Another Email'])) {
          errors.push('Invalid Another Email format');
        }
        if (row['Former Registrar Email']?.trim() && !emailRegex.test(row['Former Registrar Email'])) {
          errors.push('Invalid Former Registrar Email format');
        }

        // Duplicate detection
        let isDuplicate = false;
        if (errors.length === 0) {
          try {
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
                schoolYear: row['School Year'].trim(),
                incomingGradeLevel: row['Grade Level'].toUpperCase(),
                deletedAt: null,
              },
            });

            if (existingStudent) {
              isDuplicate = true;
              warnings.push('Student already exists with same name, school year, and grade level - will be skipped');
              duplicateCount++;
            }
          } catch (error) {
            console.error('Error checking for duplicates:', error);
          }
        }

        // Determine status
        let status = 'valid';
        if (errors.length > 0) {
          status = 'error';
          errorCount++;
        } else if (isDuplicate) {
          status = 'duplicate';
        } else {
          validCount++;
        }

        validatedRows.push({
          rowNumber,
          status,
          data: row,
          errors,
          warnings,
        });
      }

      return res.status(200).json({
        valid: errorCount === 0,
        rows: validatedRows,
        summary: {
          total: rows.length,
          valid: validCount,
          errors: errorCount,
          duplicates: duplicateCount,
        },
      });
    } catch (error) {
      console.error('Validation error:', error);
      return res.status(500).json({ error: 'Failed to validate CSV data' });
    }
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
