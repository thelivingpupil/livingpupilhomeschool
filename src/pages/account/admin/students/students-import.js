import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DataGrid } from '@mui/x-data-grid';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

import Content from '@/components/Content';
import Meta from '@/components/Meta';
import AdminLayout from '@/layouts/AdminLayout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import api from '@/lib/common/api';

const StudentsImport = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // File drop handler
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setCsvFile(file);
    setValidationResults(null);

    // Read and validate the file
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target.result;
      await validateCSV(csvData);
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  // Validate CSV
  const validateCSV = async (csvData) => {
    setIsValidating(true);
    try {
      const response = await api('/api/students/import/validate', {
        method: 'POST',
        body: { csvData },
      });

      if (response.error || response.errors) {
        toast.error(response.error || 'Validation failed');
        setValidationResults(null);
      } else if (response.rows && response.summary) {
        setValidationResults(response);
        if (response.summary.errors > 0) {
          toast.error(`Found ${response.summary.errors} errors in CSV`);
        } else if (response.summary.duplicates > 0) {
          toast.success(`Validation complete. ${response.summary.duplicates} duplicates will be skipped.`);
        } else {
          toast.success('Validation successful! Ready to import.');
        }
      } else {
        toast.error('Invalid response from server');
        console.error('Response:', response);
        setValidationResults(null);
      }
    } catch (error) {
      toast.error('Failed to validate CSV');
      console.error('Validation error:', error);
      setValidationResults(null);
    } finally {
      setIsValidating(false);
    }
  };

  // Import students
  const handleImport = async () => {
    if (!csvFile || !validationResults) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target.result;

      try {
        const response = await api('/api/students/import/process', {
          method: 'POST',
          body: { csvData },
        });

        if (response.error || response.errors) {
          toast.error(response.error || 'Import failed');
          console.error('Import errors:', response.errors || response.error);
        } else if (response.results) {
          const { results } = response;
          toast.success(
            `Import complete! Imported: ${results.imported}, Skipped: ${results.skipped}, Failed: ${results.failed}`
          );

          // Reset state
          setCsvFile(null);
          setValidationResults(null);
        } else {
          toast.error('Invalid response from server');
          console.error('Response:', response);
        }
      } catch (error) {
        toast.error('Failed to import students');
        console.error('Import error:', error);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(csvFile);
  };

  // Download CSV template
  const downloadTemplate = () => {
    const headers = [
      'First Name',
      'Middle Name',
      'Last Name',
      'Birth Date',
      'Gender',
      'Religion',
      'Reason',
      'Special Needs',
      'Special Needs Specific',
      'School Year',
      'Grade Level',
      'Enrollment Type',
      'Former School Name',
      'Former School Address',
      'Former Registrar',
      'Former Registrar Email',
      'Former Registrar Number',
      'Program',
      'Cottage Type',
      'Accreditation',
      'Payment Type',
      'Payment Method',
      'Discount Code',
      'Month Index',
      'Account Email',
      'Primary Guardian Name',
      'Primary Guardian Occupation',
      'Primary Guardian Type',
      'Primary Guardian Profile',
      'Secondary Guardian Name',
      'Secondary Guardian Occupation',
      'Secondary Guardian Type',
      'Secondary Guardian Profile',
      'Mobile Number',
      'Telephone Number',
      'Another Email',
      'Address Line 1',
      'Address Line 2',
      'Student Address 1',
      'Student Address 2',
      'Primary Teacher Name',
      'Primary Teacher Age',
      'Primary Teacher Relationship',
      'Primary Teacher Profile',
      'Primary Teacher Education',
    ];

    const sampleRow = [
      'Juan',
      'Cruz',
      'Dela Cruz',
      '2015-05-20',
      'MALE',
      'ROMAN_CATHOLIC',
      'Personalized learning',
      'NO',
      '',
      '2024-2025',
      'GRADE_1',
      'NEW',
      'Sample Elementary School',
      '123 School St, City',
      'Maria Santos',
      'registrar@school.com',
      '+639171234567',
      'HOMESCHOOL_PROGRAM',
      '',
      'LOCAL',
      'Full Payment',
      'Online Banking',
      '',
      '',
      'parent@example.com',
      'Maria Dela Cruz',
      'Teacher',
      'MOTHER',
      'https://facebook.com/maria',
      'Pedro Dela Cruz',
      'Engineer',
      'FATHER',
      'https://facebook.com/pedro',
      '+639171234567',
      '(02) 1234-5678',
      'secondary@example.com',
      '123 Main St, Barangay',
      'City, Province 1234',
      '',
      '',
      'Maria Dela Cruz',
      '35',
      'Mother',
      'https://facebook.com/maria',
      'College Graduate',
    ];

    const csv = Papa.unparse({
      fields: headers,
      data: [sampleRow],
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // DataGrid columns
  const columns = [
    { field: 'rowNumber', headerName: 'Row', width: 70 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const statusColors = {
          valid: 'bg-green-100 text-green-800',
          error: 'bg-red-100 text-red-800',
          duplicate: 'bg-yellow-100 text-yellow-800',
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${statusColors[params.value] || 'bg-gray-100 text-gray-800'
              }`}
          >
            {params.value.toUpperCase()}
          </span>
        );
      },
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      width: 120,
      valueGetter: (value, row) => row?.data?.['First Name'] || '',
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      width: 120,
      valueGetter: (value, row) => row?.data?.['Last Name'] || '',
    },
    {
      field: 'email',
      headerName: 'Account Email',
      width: 200,
      valueGetter: (value, row) => row?.data?.['Account Email'] || '',
    },
    {
      field: 'gradeLevel',
      headerName: 'Grade Level',
      width: 120,
      valueGetter: (value, row) => row?.data?.['Grade Level'] || '',
    },
    {
      field: 'schoolYear',
      headerName: 'School Year',
      width: 110,
      valueGetter: (value, row) => row?.data?.['School Year'] || '',
    },
    {
      field: 'messages',
      headerName: 'Errors / Warnings',
      width: 400,
      renderCell: (params) => {
        const allMessages = [
          ...(params.row?.errors || []).map((e) => `❌ ${e}`),
          ...(params.row?.warnings || []).map((w) => `⚠️ ${w}`),
        ];
        return <div className="text-xs">{allMessages.join(' • ')}</div>;
      },
    },
  ];

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Import Students" />
      <Content.Title
        title="Import Students"
        subtitle="Bulk import student records from CSV"
      />
      <Content.Divider />

      <div className="space-y-5">
        {/* Template Download */}
        <Card>
          <Card.Body title="Step 1: Download Template">
            <div className="flex flex-col space-y-3">
              <p className="text-sm text-gray-600">
                Download the CSV template to ensure your data is formatted correctly.
                The template includes sample data to guide you.
              </p>
              <div>
                <Button
                  className="text-white bg-secondary-500 hover:bg-secondary-600"
                  onClick={downloadTemplate}
                >
                  Download CSV Template
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* File Upload */}
        <Card>
          <Card.Body title="Step 2: Upload CSV File">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
                }`}
            >
              <input {...getInputProps()} />
              {csvFile ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-primary-600">
                    📄 {csvFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(csvFile.size / 1024).toFixed(2)} KB
                  </p>
                  <p className="text-xs text-gray-400">
                    Click or drag to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-700">
                    {isDragActive
                      ? 'Drop the CSV file here'
                      : 'Drag and drop a CSV file here, or click to select'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Maximum file size: 10MB
                  </p>
                </div>
              )}
            </div>
            {isValidating && (
              <div className="mt-3 text-center">
                <p className="text-sm text-primary-600">
                  Validating CSV file...
                </p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Validation Results */}
        {validationResults && (
          <>
            <Card>
              <Card.Body title="Step 3: Review Validation Results">
                <div className="grid grid-cols-4 gap-4 mb-5">
                  <div className="p-4 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">Total Rows</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {validationResults.summary.total}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded">
                    <p className="text-sm text-gray-600">Valid</p>
                    <p className="text-2xl font-bold text-green-600">
                      {validationResults.summary.valid}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded">
                    <p className="text-sm text-gray-600">Duplicates</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {validationResults.summary.duplicates}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded">
                    <p className="text-sm text-gray-600">Errors</p>
                    <p className="text-2xl font-bold text-red-600">
                      {validationResults.summary.errors}
                    </p>
                  </div>
                </div>

                <div style={{ height: 500, width: '100%' }}>
                  <DataGrid
                    rows={validationResults.rows.map((row, idx) => ({
                      id: idx,
                      ...row,
                    }))}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    density="comfortable"
                  />
                </div>
              </Card.Body>
            </Card>

            {/* Import Button */}
            {validationResults.summary.errors === 0 && (
              <Card>
                <Card.Body title="Step 4: Import Students">
                  <div className="flex flex-col space-y-3">
                    {validationResults.summary.duplicates > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          ⚠️ {validationResults.summary.duplicates} duplicate
                          student(s) will be skipped during import.
                        </p>
                      </div>
                    )}
                    <div>
                      <Button
                        className="text-white bg-primary-600 hover:bg-primary-500"
                        onClick={handleImport}
                        disabled={isImporting}
                      >
                        {isImporting
                          ? 'Importing...'
                          : `Import ${validationResults.summary.valid} Student(s)`}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </>
        )}

        {/* Instructions */}
        <Card>
          <Card.Body title="Import Instructions">
            <div className="prose prose-sm max-w-none">
              <p className="font-semibold">Required Fields:</p>
              <ul className="text-sm text-gray-600">
                <li>
                  <strong>Student Info:</strong> First Name, Last Name, Birth Date, Gender, Religion,
                  Reason, Special Needs, School Year, Grade Level, Enrollment Type
                </li>
                <li>
                  <strong>School Info:</strong> Former School Name, Former School Address,
                  Former Registrar (for NEW enrollment only)
                </li>
                <li>
                  <strong>Program:</strong> Program, Accreditation
                </li>
                <li>
                  <strong>Guardian:</strong> Account Email, Primary & Secondary Guardian details,
                  Contact information, Address
                </li>
                <li>
                  <strong>Teacher:</strong> Primary Teacher details (Name, Age, Relationship, Profile, Education)
                </li>
              </ul>

              <p className="font-semibold mt-4">Optional Fields:</p>
              <ul className="text-sm text-gray-600">
                <li>
                  <strong>Payment:</strong> Payment Type, Payment Method, Discount Code, Month Index
                  <br />
                  <span className="text-xs text-gray-500">
                    If not specified, defaults to Full Payment via Online Banking
                  </span>
                </li>
              </ul>

              <p className="font-semibold mt-4">Month Index Guide (for Nine (9) Term Payment):</p>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  Month Index determines the number of remaining monthly payments for Nine (9) Term Payment option.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                  <p className="font-semibold text-blue-900 mb-2">How it works:</p>
                  <ul className="text-xs space-y-1 text-blue-800">
                    <li>• <strong>Auto-calculated:</strong> If left empty for monthly payments, it's automatically calculated based on the current month</li>
                    <li>• <strong>Manual override:</strong> You can specify a custom value (1-9) to set the number of remaining monthly payments</li>
                    <li>• <strong>Example:</strong> If enrolling in August and school year is 2025-2026, Month Index = 6 (Aug, Sep, Oct, Nov, Dec, Jan)</li>
                  </ul>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold">Month Index Reference for 2024-2025 School Year:</p>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-semibold">Jan-Jun 2025:</span> 8 months
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-semibold">July 2025:</span> 7 months
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-semibold">August 2025:</span> 6 months
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-semibold">September 2025:</span> 5 months
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-semibold">October 2025:</span> 4 months
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-semibold">November 2025:</span> 3 months
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-semibold">December 2025:</span> 3 months
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-semibold">January 2026:</span> 1 month
                    </div>
                  </div>
                </div>
                <p className="text-xs italic text-gray-500 mt-2">
                  💡 Tip: Leave Month Index empty to use automatic calculation, or specify a number (1-9) to override.
                </p>
              </div>

              <p className="font-semibold mt-4">Valid Values:</p>
              <ul className="text-sm text-gray-600">
                <li><strong>Gender:</strong> MALE, FEMALE</li>
                <li><strong>Grade Level:</strong> PRESCHOOL, K1, K2, GRADE_1 through GRADE_12</li>
                <li><strong>Enrollment Type:</strong> NEW, CONTINUING</li>
                <li><strong>Program:</strong> HOMESCHOOL_PROGRAM, HOMESCHOOL_COTTAGE</li>
                <li><strong>Accreditation:</strong> LOCAL, INTERNATIONAL, DUAL</li>
                <li><strong>Special Needs:</strong> YES, NO</li>
                <li><strong>Payment Type:</strong> Full Payment, Three (3) Term Payment, Four (4) Term Payment, Nine (9) Term Payment</li>
                <li><strong>Payment Method:</strong> Online Banking, Over-the-Counter Banking, Payment Centers</li>
              </ul>

              <p className="font-semibold mt-4">Notes:</p>
              <ul className="text-sm text-gray-600">
                <li>Birth Date format: YYYY-MM-DD (e.g., 2015-05-20)</li>
                <li>Duplicates are detected by: First Name + Middle Name + Last Name + School Year + Grade Level</li>
                <li>New accounts will be created automatically for emails that don't exist</li>
                <li>File uploads (pictures, certificates) must be added separately after import</li>
                <li>School fees will be automatically created based on Payment Type (defaults to Full Payment)</li>
                <li>Month Index is auto-calculated for Nine (9) Term Payment if not specified in CSV</li>
              </ul>
            </div>
          </Card.Body>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default StudentsImport;
