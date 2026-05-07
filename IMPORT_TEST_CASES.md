# Student Import Test Cases

This document describes the test cases included in `student_import_test.csv`.

## Test Data Overview

The CSV file contains 15 rows with different validation scenarios:

### ✅ Valid Students (Rows 1-5)

1. **Juan Cruz Dela Cruz** - Valid NEW enrollment, HOMESCHOOL_PROGRAM, Grade 1
   - Tests: Complete valid data with all required fields
   - Enrollment Type: NEW (includes Former Registrar info)
   - Program: HOMESCHOOL_PROGRAM
   - Special Needs: NO

2. **Ana Marie Santos** - Valid CONTINUING enrollment, HOMESCHOOL_COTTAGE, K2
   - Tests: CONTINUING enrollment (no Former Registrar required)
   - Program: HOMESCHOOL_COTTAGE with Cottage Type
   - Special Needs: YES with specification (ADHD)
   - Former school fields: N/A (as expected for CONTINUING)

3. **Pedro Luis Garcia** - Valid NEW enrollment, INTERNATIONAL accreditation, Grade 3
   - Tests: International accreditation
   - School Year: 2025-2026 (different year)
   - Religion: MUSLIM

4. **Maria Isabel Rodriguez** - Valid NEW enrollment, DUAL accreditation, Grade 4
   - Tests: DUAL accreditation
   - Program: HOMESCHOOL_COTTAGE (FIVE_DAYS_A_WEEK)
   - Religion: IGLESIA_NI_CRISTO

5. **Carlos Miguel Reyes** - Valid CONTINUING enrollment, Grade 6
   - Tests: Higher grade level
   - Age: 42 (teacher age validation)

### ❌ Validation Errors (Rows 6-11)

6. **Missing First and Middle Name** (Row 6)
   - **Error:** Missing First Name (required field)
   - **Error:** Missing Middle Name is OK (optional)
   - Last Name: Lopez
   - Expected Error: "First Name is required"

7. **Invalid Birth Date** - Sofia Grace Martinez (Row 7)
   - **Error:** Birth Date = "INVALID-DATE" (not a valid date format)
   - Expected Error: "Birth Date must be a valid date (YYYY-MM-DD)"

8. **Invalid Gender** - Miguel Angelo Hernandez (Row 8)
   - **Error:** Gender = "INVALID_GENDER" (must be MALE or FEMALE)
   - Expected Error: "Gender must be MALE or FEMALE"

9. **Invalid Grade Level** - Isabella Rose Torres (Row 9)
   - **Error:** Grade Level = "INVALID_GRADE" (not in valid list)
   - Expected Error: "Invalid Grade Level"

10. **Missing Former Registrar Info** - Gabriel James Ramirez (Row 10)
    - **Error:** Enrollment Type = NEW but missing Former Registrar and Former Registrar Email
    - Expected Errors:
      - "Former Registrar is required for NEW enrollment"
      - "Former Registrar Email is required for NEW enrollment"

11. **Invalid Email Format** - Daniel Joseph Flores (Row 11)
    - **Error:** Former Registrar Email = "invalid-email" (not valid email format)
    - Expected Error: "Invalid Former Registrar Email format"

### ⚠️ Duplicate Student (Row 12)

12. **Juan Cruz Dela Cruz (Duplicate)** (Row 12)
    - **Warning:** Exact duplicate of Row 1
    - Same: First Name, Middle Name, Last Name, School Year (2024-2025), Grade Level (GRADE_1)
    - Expected Status: DUPLICATE with warning
    - Should be skipped during import

### ❌ Missing Cottage Type (Row 13)

13. **Emma Joy Castro** (Row 13)
    - **Error:** Program = HOMESCHOOL_COTTAGE but Cottage Type is empty
    - Expected Error: "Cottage Type is required for HOMESCHOOL_COTTAGE program"

### ✅ Additional Valid Students (Rows 14-15)

14. **Lucas Emmanuel Bautista** - Valid NEW enrollment, School Year 2025-2026
    - Tests: Different school year (2025-2026)
    - Religion: SEVENT_DAY_ADVENTIST
    - Location: Laguna Province

15. **Sophia Angela Aquino** - Valid NEW enrollment, INTERNATIONAL accreditation
    - Tests: LATTER_DAY_SAINTS_MORMONS religion
    - Grade 5 student
    - Different contact numbers (Rizal area code)

## Expected Validation Results

When you upload this CSV:

- **Total Rows:** 15
- **Valid:** 6 students (rows 1-5, 14-15)
- **Errors:** 8 students (rows 6-11, 13)
- **Duplicates:** 1 student (row 12)

## Testing Checklist

### Import Process Tests:
- [ ] Upload CSV file successfully
- [ ] Validation completes without crashes
- [ ] Preview table shows all 15 rows
- [ ] Statistics panel shows correct counts
- [ ] Error messages appear for invalid rows
- [ ] Duplicate warning appears for row 12
- [ ] Import button is disabled when errors exist

### Data Grid Tests:
- [ ] Status column shows correct colors (green/red/yellow)
- [ ] Error messages display in last column
- [ ] All columns are readable
- [ ] Can scroll through all rows

### Import Execution Tests (fix errors first):
1. Remove or fix rows 6-11 and 13
2. Click "Import Students"
3. Verify:
   - [ ] 6 students imported successfully
   - [ ] 1 duplicate skipped
   - [ ] New accounts created for new emails
   - [ ] Welcome emails sent for new accounts
   - [ ] Enrollment confirmation emails sent
   - [ ] Students appear in Students List
   - [ ] Workspaces created correctly
   - [ ] GuardianInformation populated

### Edge Cases Tested:
- ✅ NEW vs CONTINUING enrollment
- ✅ Different school years (2024-2025, 2025-2026)
- ✅ All grade levels (PRESCHOOL, K1, K2, GRADE_1-6)
- ✅ Both programs (HOMESCHOOL_PROGRAM, HOMESCHOOL_COTTAGE)
- ✅ All accreditations (LOCAL, INTERNATIONAL, DUAL)
- ✅ Multiple religions
- ✅ Special needs YES/NO
- ✅ Guardian types (MOTHER, FATHER)
- ✅ Missing optional fields (Middle Name)
- ✅ Duplicate detection
- ✅ Email validation
- ✅ Date validation
- ✅ Enum validation

## How to Fix Errors for Successful Import

To test successful import, edit the CSV and fix these rows:

**Row 6:** Add First Name (e.g., "TestName")
**Row 7:** Change Birth Date to valid format (e.g., "2015-06-15")
**Row 8:** Change Gender to "MALE" or "FEMALE"
**Row 9:** Change Grade Level to valid value (e.g., "GRADE_2")
**Row 10:** Add Former Registrar and Former Registrar Email
**Row 11:** Fix Former Registrar Email format (e.g., "admin@school.com")
**Row 12:** Either delete this row or change name/year/grade to make it unique
**Row 13:** Add Cottage Type (e.g., "THREE_DAYS_A_WEEK")

After fixing, you should have 14 valid students ready for import!

























