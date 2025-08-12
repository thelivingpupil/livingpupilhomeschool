import React from 'react';
import { DOCUMENT_DETAILS } from '@/utils/constants';

const MultiStudentForm = ({
    students,
    onAddStudent,
    onRemoveStudent,
    onUpdateStudent,
    onUpdateStudentDocuments
}) => {
    return (
        <div className="space-y-6">
            {students.map((student, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Student {index + 1}
                        </h3>
                        {students.length > 1 && (
                            <button
                                onClick={() => onRemoveStudent(index)}
                                className="px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                            >
                                Remove Student
                            </button>
                        )}
                    </div>

                    {/* Student Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Student Full Name *
                            </label>
                            <input
                                type="text"
                                value={student.studentName}
                                onChange={(e) => onUpdateStudent(index, 'studentName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                LRN *
                            </label>
                            <input
                                type="text"
                                value={student.lrn}
                                onChange={(e) => onUpdateStudent(index, 'lrn', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Grade Level *
                            </label>
                            <input
                                type="text"
                                value={student.gradeLevel}
                                onChange={(e) => onUpdateStudent(index, 'gradeLevel', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current School *
                            </label>
                            <input
                                type="text"
                                value={student.currentSchool}
                                onChange={(e) => onUpdateStudent(index, 'currentSchool', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grades with LP
                            </label>
                            <input
                                type="text"
                                value={student.gradesWithLP}
                                onChange={(e) => onUpdateStudent(index, 'gradesWithLP', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last School Year with LP
                            </label>
                            <input
                                type="text"
                                value={student.lastSchoolYear}
                                onChange={(e) => onUpdateStudent(index, 'lastSchoolYear', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Document Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Documents for Student {index + 1}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.values(DOCUMENT_DETAILS).map((detail, docIndex) => (
                                <label key={docIndex} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={student.selectedDocuments.includes(detail.value)}
                                        onChange={() => onUpdateStudentDocuments(index, detail.value)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{detail.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            {/* Add Student Button */}
            <div className="text-center">
                <button
                    onClick={onAddStudent}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                    + Add Another Student
                </button>
            </div>
        </div>
    );
};

export default MultiStudentForm; 