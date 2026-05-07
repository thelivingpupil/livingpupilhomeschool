# Marjul's Personal Test File

File: `student_import_marjul_test.csv`

## Purpose
This file is for testing the import feature with your actual account.

## Contents (2 Students)

### 1. Miguel Antonio Mugot
- **Account Email:** marjulmugot@gmail.com (YOUR EXISTING ACCOUNT)
- **Expected Behavior:** 
  - ✅ Will link to your existing account
  - ✅ No new account created
  - ✅ You'll receive enrollment confirmation email
  - ✅ Student will appear under your account
  - ✅ No welcome email (account already exists)
- **Student Details:**
  - Grade: GRADE_1
  - School Year: 2024-2025
  - Enrollment Type: NEW
  - Program: HOMESCHOOL_PROGRAM
  - Guardian: Marjul Louie Mugot (Father)

### 2. Sofia Grace Reyes
- **Account Email:** newparent@example.com (NEW ACCOUNT)
- **Expected Behavior:**
  - ✅ Will create NEW account for newparent@example.com
  - ✅ Welcome email sent to newparent@example.com
  - ✅ Enrollment confirmation email sent
  - ✅ GuardianInformation record created with all details
  - ✅ Can test new account creation flow
- **Student Details:**
  - Grade: K2
  - School Year: 2024-2025
  - Enrollment Type: NEW
  - Program: HOMESCHOOL_PROGRAM
  - Guardian: Grace Reyes (Mother)

## How to Test

1. **Navigate to Import Page:**
   - Go to Admin → Students → Click "Import Students"
   - Or navigate to: `/account/admin/students/students-import`

2. **Upload the File:**
   - Drag and drop `student_import_marjul_test.csv` or click to select
   - Wait for validation to complete

3. **Review Validation:**
   - Should show: 2 total rows, 2 valid, 0 errors, 0 duplicates
   - Both rows should have green "VALID" status
   - Statistics panel: Total: 2, Valid: 2, Duplicates: 0, Errors: 0

4. **Import the Students:**
   - Click "Import 2 Student(s)" button
   - Wait for import to complete
   - Should see success message: "Imported: 2, Skipped: 0, Failed: 0"

5. **Verify Results:**

   **For Miguel (your account):**
   - [ ] Go to Students List
   - [ ] Find "Miguel Antonio Mugot" in the list
   - [ ] Verify it's linked to marjulmugot@gmail.com
   - [ ] Check your email for enrollment confirmation
   - [ ] Should NOT receive welcome email (account exists)

   **For Sofia (new account):**
   - [ ] Go to Students List
   - [ ] Find "Sofia Grace Reyes" in the list
   - [ ] Verify new account created for newparent@example.com
   - [ ] Check database for User with email: newparent@example.com
   - [ ] Check database for GuardianInformation linked to new user
   - [ ] Verify workspace created
   - [ ] Should receive welcome email (if email sending is configured)
   - [ ] Should receive enrollment confirmation email

## Expected Database Changes

After import, you should see:

### For Miguel (Existing Account):
- **Workspace Table:** 1 new workspace record
  - Name: "Miguel Antonio Mugot 2024-2025"
  - CreatorId: Your existing user ID
  - Slug: "miguel-antonio-mugot-2024-2025-xxxxxx"

- **StudentRecord Table:** 1 new record
  - StudentId: (workspace ID)
  - FirstName: "Miguel"
  - LastName: "Mugot"
  - SchoolYear: "2024-2025"
  - IncomingGradeLevel: "GRADE_1"

- **GuardianInformation:** No changes (already exists for your account)

### For Sofia (New Account):
- **User Table:** 1 new user record
  - Email: "newparent@example.com"
  - Name: "Grace Reyes"
  - EmailVerified: null

- **GuardianInformation Table:** 1 new record
  - UserId: (new user ID)
  - PrimaryGuardianName: "Grace Reyes"
  - PrimaryGuardianType: "MOTHER"
  - SecondaryGuardianName: "Roberto Reyes"
  - SecondaryGuardianType: "FATHER"
  - MobileNumber: "+639181234567"
  - (all other fields populated)

- **Workspace Table:** 1 new workspace record
  - Name: "Sofia Grace Reyes 2024-2025"
  - CreatorId: (new user ID)

- **StudentRecord Table:** 1 new record
  - StudentId: (workspace ID)
  - FirstName: "Sofia"
  - LastName: "Reyes"
  - SchoolYear: "2024-2025"
  - IncomingGradeLevel: "K2"

## Cleanup (Optional)

If you want to test multiple times, you can delete the imported students:

1. Go to Students List
2. Find Miguel Antonio Mugot and Sofia Grace Reyes
3. Delete both student records
4. For Sofia's test: Also delete the user account "newparent@example.com" from database if you want to test account creation again

## Notes

- Both students are valid with all required fields
- No duplicates will be detected (unless you run import twice)
- All validation rules will pass
- Safe to import into your actual database
- You can edit the CSV to change names, grades, or other details as needed

























