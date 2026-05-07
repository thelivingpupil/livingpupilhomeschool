import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Accreditation,
  EnrollmentTypeV2,
  Fees,
  GradeLevel,
  GuardianType,
  PaymentType,
  Program,
} from '@prisma/client';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/outline';
import crypto from 'crypto';
import format from 'date-fns/format';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import Link from 'next/link';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import SignatureCanvas from 'react-signature-canvas';
import useSWR from 'swr';
import toast from 'react-hot-toast';

import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Modal from '@/components/Modal';
import { storage } from '@/lib/client/firebase';
import api from '@/lib/common/api';
import fetcher from '@/lib/client/fetcher';
import {
  ACCREDITATION,
  COTTAGE_TYPE,
  ENROLLMENT_TYPE,
  FEES,
  GRADE_LEVEL,
  GRADE_LEVEL_GROUPS,
  GRADE_TO_FORM_MAP,
  PAYMENT_TYPE,
  PROGRAM,
  SCHOOL_YEAR,
  calculateMonthlyPayment,
  getMonthIndexForSchoolYear,
} from '@/utils/constants';
import {
  formatEnrollmentPhp,
  getDiscountDisplayNumber,
  getEnrollmentFeeLineAmount,
  getInitialFeeTotalNumber,
} from '@/utils/enrollment-fee-display';
import {
  GeneralPoliciesAndGuidelines,
  PaymentPoliciesAndRefund,
} from './EnrollmentPolicySections';
import SchoolFeesBreakdown from './SchoolFeesBreakdown';

const MAX_FILE_BYTES = 10485760;
const ALL_SY_CHOICES = [SCHOOL_YEAR.SY_2026_2027, SCHOOL_YEAR.SY_2025_2026];

const STEPS = [
  'Educational background, guardians & teachers',
  'Program, accreditation & general policies',
  'School fees, payment & signature',
];

const EnrollSchoolYearWizardModal = ({
  show,
  toggle,
  studentKey,
  workspaceSlug,
  enrolledSchoolYearNames = [],
  studentRecord = null,
  previousEnrollment = null,
  onSuccess,
}) => {
  const { data: ctxPayload, isLoading: ctxLoading } = useSWR(
    show ? '/api/account/enrollment-data' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  );
  const guardian = ctxPayload?.data?.guardian;
  const programs = ctxPayload?.data?.programs ?? [];

  const [step, setStep] = useState(0);

  const [schoolYear, setSchoolYear] = useState('');
  const [enrollmentType, setEnrollmentType] = useState(EnrollmentTypeV2.NEW);
  const [gradeLevel, setGradeLevel] = useState(GradeLevel.PRESCHOOL);
  const [program, setProgram] = useState(Program.HOMESCHOOL_PROGRAM);
  const [cottageType, setCottageType] = useState('');
  const [accreditation, setAccreditation] = useState('');
  const [formerSchoolName, setFormerSchoolName] = useState('');
  const [formerSchoolAddress, setFormerSchoolAddress] = useState('');
  const [formerRegistrar, setFormerRegistrar] = useState('');
  const [formerRegistrarEmail, setFormerRegistrarEmail] = useState('');
  const [formerRegistrarNumber, setFormerRegistrarNumber] = useState('');
  const [reportCardLink, setReportCardLink] = useState('');
  const [reportCardProgress, setReportCardProgress] = useState(0);

  const [primaryGuardianName, setPrimaryGuardianName] = useState('');
  const [primaryGuardianOccupation, setPrimaryGuardianOccupation] =
    useState('');
  const [primaryGuardianType, setPrimaryGuardianType] = useState(
    GuardianType.MOTHER
  );
  const [primaryGuardianProfile, setPrimaryGuardianProfile] = useState('');
  const [secondaryGuardianName, setSecondaryGuardianName] = useState('');
  const [secondaryGuardianOccupation, setSecondaryGuardianOccupation] =
    useState('');
  const [secondaryGuardianType, setSecondaryGuardianType] = useState(
    GuardianType.MOTHER
  );
  const [secondaryGuardianProfile, setSecondaryGuardianProfile] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [validMobileNumber, setValidMobileNumber] = useState(false);
  const [telephoneNumber, setTelephoneNumber] = useState('');
  const [anotherEmail, setAnotherEmail] = useState('');

  const [primaryTeacherName, setPrimaryTeacherName] = useState('');
  const [primaryTeacherAge, setPrimaryTeacherAge] = useState('');
  const [primaryTeacherRelationship, setPrimaryTeacherRelationship] =
    useState('');
  const [primaryTeacherEducation, setPrimaryTeacherEducation] = useState('');
  const [primaryTeacherProfile, setPrimaryTeacherProfile] = useState('');

  const [payment, setPayment] = useState(null);
  const [fee, setFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [isSubmittingCode, setSubmittingCode] = useState(false);
  const [agree, setAgree] = useState(false);
  const [signatureLink, setSignatureLink] = useState('');
  const [signatureProgress, setSignatureProgress] = useState(0);
  const sigCanvas = useRef(null);
  /** Avoid re-seeding when SWR refetches (focus/tab) and object identities change while the modal stays open. */
  const mainFormSeededRef = useRef(false);
  const guardianSeededRef = useRef(false);

  const [monthIndex, setMonthIndex] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const selectableYears = ALL_SY_CHOICES.filter(
    (y) => !enrolledSchoolYearNames.includes(y)
  );
  const isNew = enrollmentType === EnrollmentTypeV2.NEW;
  const needsCottage = program === Program.HOMESCHOOL_COTTAGE;
  const preschoolOrK1 =
    gradeLevel === GradeLevel.PRESCHOOL || gradeLevel === GradeLevel.K1;

  const programFee = useMemo(() => {
    if (!programs?.length) return null;
    return programs.find((row) => {
      if (program === Program.HOMESCHOOL_COTTAGE) {
        return (
          row.programType === program &&
          row.gradeLevel === GRADE_TO_FORM_MAP[gradeLevel] &&
          row.enrollmentType === enrollmentType &&
          row.cottageType === cottageType
        );
      }
      return (
        row.gradeLevel === gradeLevel &&
        row.enrollmentType === enrollmentType &&
        row.programType === program
      );
    });
  }, [programs, program, gradeLevel, enrollmentType, cottageType]);

  const programFeeByAccreditation = programFee?.tuitionFees?.find(
    (t) => t.type === accreditation
  );

  const monthlyPayment = useMemo(() => {
    if (accreditation == null || !programFee || monthIndex == null) return 0;
    return calculateMonthlyPayment(monthIndex, programFeeByAccreditation);
  }, [accreditation, programFee, monthIndex, programFeeByAccreditation]);

  useEffect(() => {
    if (!schoolYear) return;
    setMonthIndex(getMonthIndexForSchoolYear(schoolYear, new Date()));
  }, [schoolYear]);

  useEffect(() => {
    if (!show) {
      mainFormSeededRef.current = false;
      return;
    }
    if (mainFormSeededRef.current) return;
    mainFormSeededRef.current = true;

    setStep(0);
    setSubmitting(false);
    setPayment(null);
    setFee(null);
    setPaymentMethod(null);
    setDiscount(null);
    setDiscountCode('');
    setAgree(false);
    setSignatureLink('');
    setSignatureProgress(0);
    if (sigCanvas.current) sigCanvas.current.clear();

    const sr = studentRecord;
    const prev = previousEnrollment;

    setFormerSchoolName((sr?.formerSchoolName || '').trim());
    setFormerSchoolAddress((sr?.formerSchoolAddress || '').trim());
    setReportCardLink(sr?.reportCard || '');
    setPrimaryTeacherName(sr?.primaryTeacherName || '');
    setPrimaryTeacherAge(sr?.primaryTeacherAge || '');
    setPrimaryTeacherRelationship(sr?.primaryTeacherRelationship || '');
    setPrimaryTeacherEducation(sr?.primaryTeacherEducation || '');
    setPrimaryTeacherProfile(sr?.primaryTeacherProfile || '');

    if (prev) {
      setEnrollmentType(EnrollmentTypeV2.CONTINUING);
      let g = prev.gradeLevel ?? GradeLevel.PRESCHOOL;
      let p = prev.program ?? Program.HOMESCHOOL_PROGRAM;
      if (g === GradeLevel.PRESCHOOL && p === Program.HOMESCHOOL_COTTAGE) {
        p = Program.HOMESCHOOL_PROGRAM;
      }
      setGradeLevel(g);
      setProgram(p);
      setCottageType(prev.cottageType ?? '');
      const acc = prev.accreditation;
      if (
        acc === Accreditation.LOCAL ||
        acc === Accreditation.INTERNATIONAL ||
        acc === Accreditation.DUAL
      ) {
        setAccreditation(acc);
      } else {
        setAccreditation('');
      }
      setFormerRegistrar(prev.formerRegistrar ?? '');
      setFormerRegistrarEmail(prev.formerRegistrarEmail ?? '');
      setFormerRegistrarNumber(prev.formerRegistrarNumber ?? '');
    } else {
      setEnrollmentType(EnrollmentTypeV2.NEW);
      setGradeLevel(GradeLevel.PRESCHOOL);
      setProgram(Program.HOMESCHOOL_PROGRAM);
      setCottageType('');
      setAccreditation('');
      setFormerRegistrar('');
      setFormerRegistrarEmail('');
      setFormerRegistrarNumber('');
    }

    const choices = ALL_SY_CHOICES.filter(
      (y) => !enrolledSchoolYearNames.includes(y)
    );
    setSchoolYear(
      choices.includes(SCHOOL_YEAR.SY_2026_2027)
        ? SCHOOL_YEAR.SY_2026_2027
        : choices[0] || ''
    );
  }, [show, studentRecord, previousEnrollment, enrolledSchoolYearNames]);

  useEffect(() => {
    if (!show) {
      guardianSeededRef.current = false;
      return;
    }
    if (!guardian) return;
    if (guardianSeededRef.current) return;
    guardianSeededRef.current = true;

    setPrimaryGuardianName(guardian.primaryGuardianName || '');
    setPrimaryGuardianOccupation(guardian.primaryGuardianOccupation || '');
    setPrimaryGuardianType(
      guardian.primaryGuardianType || GuardianType.MOTHER
    );
    setPrimaryGuardianProfile(guardian.primaryGuardianProfile || '');
    setSecondaryGuardianName(guardian.secondaryGuardianName || '');
    setSecondaryGuardianOccupation(guardian.secondaryGuardianOccupation || '');
    setSecondaryGuardianType(
      guardian.secondaryGuardianType || GuardianType.MOTHER
    );
    setSecondaryGuardianProfile(guardian.secondaryGuardianProfile || '');
    setMobileNumber(guardian.mobileNumber || '');
    setTelephoneNumber(guardian.telephoneNumber || '');
    setAnotherEmail(guardian.anotherEmail || '');
    setValidMobileNumber(Boolean(guardian.mobileNumber));
  }, [guardian, show]);

  useEffect(() => {
    if (
      preschoolOrK1 &&
      (accreditation === Accreditation.INTERNATIONAL ||
        accreditation === Accreditation.DUAL)
    ) {
      setAccreditation('');
    }
  }, [gradeLevel, preschoolOrK1, accreditation]);

  useEffect(() => {
    if (gradeLevel === GradeLevel.PRESCHOOL && program === Program.HOMESCHOOL_COTTAGE) {
      setProgram(Program.HOMESCHOOL_PROGRAM);
      setCottageType('');
    }
  }, [gradeLevel, program]);

  const step0Valid =
    Boolean(schoolYear) &&
    formerSchoolName.trim() &&
    formerSchoolAddress.trim() &&
    (!isNew ||
      (formerRegistrar.trim() &&
        formerRegistrarEmail.trim() &&
        formerRegistrarNumber.trim())) &&
    primaryGuardianName.trim() &&
    primaryGuardianOccupation.trim() &&
    primaryGuardianProfile.trim() &&
    secondaryGuardianName.trim() &&
    secondaryGuardianOccupation.trim() &&
    secondaryGuardianProfile.trim() &&
    mobileNumber.length > 0 &&
    validMobileNumber &&
    telephoneNumber.trim() &&
    anotherEmail.trim() &&
    primaryTeacherName.trim() &&
    primaryTeacherAge.trim() &&
    primaryTeacherRelationship.trim() &&
    primaryTeacherProfile.trim() &&
    primaryTeacherEducation.trim();

  const step1Valid =
    Boolean(program) &&
    Boolean(accreditation) &&
    (!needsCottage || Boolean(cottageType));

  const step2Valid =
    Boolean(payment) &&
    Boolean(paymentMethod) &&
    agree &&
    Boolean(signatureLink);

  const validateNext =
    (step === 0 && step0Valid) ||
    (step === 1 && step1Valid) ||
    (step === 2 && step2Valid);

  const handleReportCardUpload = (e) => {
    const file = e.target?.files?.[0];
    if (!workspaceSlug || !file) return;
    if (file.size >= MAX_FILE_BYTES) {
      toast.error('File too large. Max 10 MB.');
      return;
    }
    const extension = file.name.split('.').pop();
    const storageRef = ref(
      storage,
      `files/${workspaceSlug}/report-${crypto
        .createHash('md5')
        .update(file.name)
        .digest('hex')
        .substring(0, 12)}-${format(new Date(), 'yyyy.MM.dd.kk.mm.ss')}.${extension}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      'state_changed',
      (snap) => {
        setReportCardProgress(
          Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        );
      },
      (err) => toast.error(err?.message || 'Upload failed'),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setReportCardLink(url);
          setReportCardProgress(100);
        });
      }
    );
  };

  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = Buffer.from(arr[1], 'base64');
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr[n];
    return new Blob([u8arr], { type: mime });
  };

  const saveSignature = () => {
    if (!sigCanvas.current || !workspaceSlug) return;
    const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    const blob = dataURLToBlob(dataUrl);
    const fileName = `files/${workspaceSlug}/signature-${crypto
      .createHash('md5')
      .update(dataUrl)
      .digest('hex')
      .substring(0, 12)}-${format(new Date(), 'yyyy.MM.dd.kk.mm.ss')}.png`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, blob);
    uploadTask.on(
      'state_changed',
      (snap) => {
        setSignatureProgress(
          Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        );
      },
      (err) => toast.error(err?.message || 'Upload failed'),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setSignatureLink(url);
          setSignatureProgress(100);
        });
      }
    );
  };

  const applyDiscount = () => {
    if (!discountCode.trim()) return;
    setSubmittingCode(true);
    api('/api/enroll/discount', {
      method: 'POST',
      body: { code: discountCode.trim() },
    }).then((response) => {
      setSubmittingCode(false);
      if (response.errors) {
        Object.keys(response.errors).forEach((k) =>
          toast.error(response.errors[k].msg)
        );
      } else {
        setDiscount(response.data);
        toast.success('Discount successfully applied');
      }
    });
  };

  const submitAll = () => {
    if (!validateNext || step !== 2) return;
    setSubmitting(true);
    const body = {
      schoolYear,
      enrollmentType,
      gradeLevel,
      program,
      cottageType: needsCottage ? cottageType : null,
      accreditation,
      formerSchoolName: formerSchoolName.trim(),
      formerSchoolAddress: formerSchoolAddress.trim(),
      formerRegistrar: isNew ? formerRegistrar.trim() : undefined,
      formerRegistrarEmail: isNew ? formerRegistrarEmail.trim() : undefined,
      formerRegistrarNumber: isNew ? formerRegistrarNumber.trim() : undefined,
      reportCardLink: reportCardLink || undefined,
      reason: studentRecord?.reason || '',
      specialRadio: studentRecord?.specialNeeds || 'NO',
      specialNeeds: studentRecord?.specialNeedSpecific || '',
      primaryGuardianName: primaryGuardianName.trim(),
      primaryGuardianOccupation: primaryGuardianOccupation.trim(),
      primaryGuardianType,
      primaryGuardianProfile: primaryGuardianProfile.trim(),
      secondaryGuardianName: secondaryGuardianName.trim(),
      secondaryGuardianOccupation: secondaryGuardianOccupation.trim(),
      secondaryGuardianType,
      secondaryGuardianProfile: secondaryGuardianProfile.trim(),
      mobileNumber,
      telephoneNumber: telephoneNumber.trim(),
      anotherEmail: anotherEmail.trim(),
      primaryTeacherName: primaryTeacherName.trim(),
      primaryTeacherAge: primaryTeacherAge.trim(),
      primaryTeacherRelationship: primaryTeacherRelationship.trim(),
      primaryTeacherEducation: primaryTeacherEducation.trim(),
      primaryTeacherProfile: primaryTeacherProfile.trim(),
      payment,
      paymentMethod,
      discountCode: discountCode.trim() || '',
      scholarshipCode: '',
      signatureLink,
      policyAgreement: true,
    };

    api(`/api/account/students/${encodeURIComponent(studentKey)}/enroll`, {
      method: 'POST',
      body,
    }).then((response) => {
      setSubmitting(false);
      if (response.errors) {
        Object.keys(response.errors).forEach((k) =>
          toast.error(response.errors[k].msg)
        );
        return;
      }
      if (response.error) {
        toast.error(
          typeof response.error === 'string' ? response.error : 'Failed.'
        );
        return;
      }
      toast.success('Enrollment submitted.');
      toggle();
      onSuccess?.(response.data);
    });
  };

  const next = () => {
    if (!validateNext || step >= STEPS.length - 1) return;
    setStep((s) => s + 1);
  };

  const previous = () => {
    if (step <= 0) return;
    setStep((s) => s - 1);
  };

  const selectWrap = (invalid) =>
    `relative flex rounded ${
      invalid ? 'border-red-500 border-2' : 'border border-gray-300'
    }`;
  const inputClass = (inv) =>
    `w-full px-3 py-2 rounded text-sm ${inv ? 'border-red-500 border-2' : 'border border-gray-300'}`;

  const noYears = selectableYears.length === 0;

  return (
    <Modal show={show} title="Enroll for a school year" toggle={toggle}>
      <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
        {ctxLoading && <p className="text-gray-500">Loading form data…</p>}
        {noYears && (
          <p className="text-amber-700">
            Already enrolled for all available school years (
            {ALL_SY_CHOICES.join(', ')}).
          </p>
        )}

        {!ctxLoading && !noYears && (
          <>
            <div className="flex justify-between gap-2">
              {STEPS.map((label, i) => (
                <button
                  key={label}
                  className="flex flex-1 flex-col items-center gap-1 text-center"
                  onClick={() => (i < step ? setStep(i) : undefined)}
                  type="button"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      step === i
                        ? 'bg-secondary-400'
                        : i < step
                          ? 'bg-green-400'
                          : 'bg-gray-200'
                    }`}
                  >
                    {i < step ? (
                      <CheckIcon className="h-5 w-5 text-white" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-[10px] leading-tight text-gray-700 md:text-xs">
                    {label}
                  </span>
                </button>
              ))}
            </div>

            <div className="rounded border-2 border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              Fields marked <span className="font-bold text-red-600">*</span> are
              required. This wizard matches the main enrollment form sections.
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <Card.Body title="Educational background">
                  <div className="flex flex-col gap-3 p-2">
                    <div>
                      <label className="mb-1 block font-medium">
                        Enrolling as a <span className="text-red-500">*</span>
                      </label>
                      <div className={selectWrap(false)}>
                        <select
                          className="w-full appearance-none rounded bg-white px-3 py-2 capitalize"
                          onChange={(e) => setEnrollmentType(e.target.value)}
                          value={enrollmentType}
                        >
                          {Object.keys(ENROLLMENT_TYPE).map((k) => (
                            <option key={k} value={k}>
                              {ENROLLMENT_TYPE[k].toLowerCase()}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block font-medium">
                        Incoming grade level{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className={selectWrap(false)}>
                        <select
                          className="w-full appearance-none rounded bg-white px-3 py-2 capitalize"
                          onChange={(e) => setGradeLevel(e.target.value)}
                          value={gradeLevel}
                        >
                          {GRADE_LEVEL_GROUPS.map((g, gi) => (
                            <optgroup key={gi} label={g.name}>
                              {g.levels.map((lv) => (
                                <option key={lv} value={lv}>
                                  {GRADE_LEVEL[lv]}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block font-medium">
                        School year <span className="text-red-500">*</span>
                      </label>
                      <div className={selectWrap(!schoolYear)}>
                        <select
                          className="w-full appearance-none rounded bg-white px-3 py-2 capitalize"
                          onChange={(e) => setSchoolYear(e.target.value)}
                          value={schoolYear}
                        >
                          <option value="">Please select School year...</option>
                          {selectableYears.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block font-medium">
                        Former school name{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={inputClass(!formerSchoolName.trim())}
                        onChange={(e) => setFormerSchoolName(e.target.value)}
                        value={formerSchoolName}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-medium">
                        Former school address{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className={`${inputClass(!formerSchoolAddress.trim())} min-h-[72px]`}
                        onChange={(e) => setFormerSchoolAddress(e.target.value)}
                        rows={3}
                        value={formerSchoolAddress}
                      />
                    </div>
                    {isNew && (
                      <>
                        <input
                          className={inputClass(!formerRegistrar.trim())}
                          onChange={(e) => setFormerRegistrar(e.target.value)}
                          placeholder="Former registrar full name *"
                          value={formerRegistrar}
                        />
                        <input
                          className={inputClass(!formerRegistrarEmail.trim())}
                          onChange={(e) => setFormerRegistrarEmail(e.target.value)}
                          placeholder="Former registrar email *"
                          type="email"
                          value={formerRegistrarEmail}
                        />
                        <input
                          className={inputClass(!formerRegistrarNumber.trim())}
                          onChange={(e) =>
                            setFormerRegistrarNumber(e.target.value)
                          }
                          placeholder="Former registrar contact *"
                          value={formerRegistrarNumber}
                        />
                      </>
                    )}
                    <div>
                      <label className="mb-1 block text-xs text-gray-600">
                        Report card / school card (optional)
                      </label>
                      <input
                        accept=".gif,.jpeg,.jpg,.png,.pdf"
                        disabled={!workspaceSlug}
                        onChange={handleReportCardUpload}
                        type="file"
                      />
                      <div className="mt-1 h-1.5 w-full rounded bg-gray-200">
                        <div
                          className="h-full rounded bg-secondary-500"
                          style={{ width: `${reportCardProgress}%` }}
                        />
                      </div>
                      {reportCardLink && (
                        <Link href={reportCardLink}>
                          <a
                            className="text-xs text-primary-600 underline"
                            rel="noreferrer"
                            target="_blank"
                          >
                            Preview
                          </a>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card.Body>

                <Card.Body title="Guardian information">
                  <div className="flex flex-col gap-3 p-2">
                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        className={inputClass(!primaryGuardianName.trim())}
                        onChange={(e) => setPrimaryGuardianName(e.target.value)}
                        placeholder="Primary guardian full name *"
                        value={primaryGuardianName}
                      />
                      <input
                        className={inputClass(!primaryGuardianOccupation.trim())}
                        onChange={(e) =>
                          setPrimaryGuardianOccupation(e.target.value)
                        }
                        placeholder="Occupation *"
                        value={primaryGuardianOccupation}
                      />
                    </div>
                    <div className={selectWrap(false)}>
                      <select
                        className="w-full appearance-none rounded bg-white px-3 py-2 capitalize"
                        onChange={(e) => setPrimaryGuardianType(e.target.value)}
                        value={primaryGuardianType}
                      >
                        {Object.keys(GuardianType).map((k) => (
                          <option key={k} value={GuardianType[k]}>
                            {String(GuardianType[k]).replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className={inputClass(!primaryGuardianProfile.trim())}
                      onChange={(e) => setPrimaryGuardianProfile(e.target.value)}
                      placeholder="Primary guardian Facebook profile *"
                      value={primaryGuardianProfile}
                    />
                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        className={inputClass(!secondaryGuardianName.trim())}
                        onChange={(e) => setSecondaryGuardianName(e.target.value)}
                        placeholder="Secondary guardian full name *"
                        value={secondaryGuardianName}
                      />
                      <input
                        className={inputClass(
                          !secondaryGuardianOccupation.trim()
                        )}
                        onChange={(e) =>
                          setSecondaryGuardianOccupation(e.target.value)
                        }
                        placeholder="Occupation *"
                        value={secondaryGuardianOccupation}
                      />
                    </div>
                    <div className={selectWrap(false)}>
                      <select
                        className="w-full appearance-none rounded bg-white px-3 py-2 capitalize"
                        onChange={(e) =>
                          setSecondaryGuardianType(e.target.value)
                        }
                        value={secondaryGuardianType}
                      >
                        {Object.keys(GuardianType).map((k) => (
                          <option key={k} value={GuardianType[k]}>
                            {String(GuardianType[k]).replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className={inputClass(!secondaryGuardianProfile.trim())}
                      onChange={(e) =>
                        setSecondaryGuardianProfile(e.target.value)
                      }
                      placeholder="Secondary guardian Facebook profile *"
                      value={secondaryGuardianProfile}
                    />
                    <label className="font-medium">Contact numbers *</label>
                    <PhoneInput
                      buttonClass="border-r bg-white pr-2"
                      containerClass="w-full"
                      country="ph"
                      enableSearch
                      inputProps={{ name: 'mobile', required: true }}
                      inputStyle={{
                        width: '100%',
                        padding: '12px 48px',
                        fontSize: '14px',
                        border: validMobileNumber ? '1px solid #d1d5db' : '2px solid red',
                        borderRadius: '6px',
                      }}
                      onChange={(value, data) => {
                        setMobileNumber(value);
                        setValidMobileNumber(Boolean(data?.dialCode));
                      }}
                      searchPlaceholder="Search country"
                      value={mobileNumber}
                    />
                    <input
                      className={inputClass(!telephoneNumber.trim())}
                      onChange={(e) => setTelephoneNumber(e.target.value)}
                      placeholder="Telephone number *"
                      value={telephoneNumber}
                    />
                    <input
                      className={inputClass(!anotherEmail.trim())}
                      onChange={(e) => setAnotherEmail(e.target.value)}
                      placeholder="Additional email *"
                      type="email"
                      value={anotherEmail}
                    />
                  </div>
                </Card.Body>

                <Card.Body title="Student's teacher information">
                  <div className="flex flex-col gap-3 p-2">
                    <div className="grid gap-2 md:grid-cols-3">
                      <input
                        className={inputClass(!primaryTeacherName.trim())}
                        onChange={(e) => setPrimaryTeacherName(e.target.value)}
                        placeholder="Who teaches the student? *"
                        value={primaryTeacherName}
                      />
                      <input
                        className={inputClass(!primaryTeacherAge.trim())}
                        onChange={(e) => setPrimaryTeacherAge(e.target.value)}
                        placeholder="Age *"
                        value={primaryTeacherAge}
                      />
                      <input
                        className={inputClass(
                          !primaryTeacherRelationship.trim()
                        )}
                        onChange={(e) =>
                          setPrimaryTeacherRelationship(e.target.value)
                        }
                        placeholder="Relationship *"
                        value={primaryTeacherRelationship}
                      />
                    </div>
                    <input
                      className={inputClass(!primaryTeacherProfile.trim())}
                      onChange={(e) => setPrimaryTeacherProfile(e.target.value)}
                      placeholder="Facebook profile *"
                      value={primaryTeacherProfile}
                    />
                    <input
                      className={inputClass(!primaryTeacherEducation.trim())}
                      onChange={(e) =>
                        setPrimaryTeacherEducation(e.target.value)
                      }
                      placeholder="Highest educational attainment *"
                      value={primaryTeacherEducation}
                    />
                  </div>
                </Card.Body>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <Card.Body title="Program and accreditation">
                  <div className="flex flex-col gap-3 p-2">
                    <div>
                      <label className="mb-1 block font-medium">
                        Program <span className="text-red-500">*</span>
                      </label>
                      <div className={selectWrap(false)}>
                        <select
                          className="w-full appearance-none rounded bg-white px-3 py-2 capitalize"
                          onChange={(e) => {
                            const p = e.target.value;
                            setProgram(p);
                            if (p !== Program.HOMESCHOOL_COTTAGE) {
                              setCottageType('');
                            }
                          }}
                          value={program}
                        >
                          {Object.keys(PROGRAM).map((k) => (
                            <option
                              key={k}
                              disabled={
                                k === Program.HOMESCHOOL_COTTAGE &&
                                gradeLevel === GradeLevel.PRESCHOOL
                              }
                              value={k}
                            >
                              {PROGRAM[k].toLowerCase()}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {needsCottage && (
                      <div>
                        <label className="mb-1 block font-medium">
                          Cottage type <span className="text-red-500">*</span>
                        </label>
                        <div className={selectWrap(!cottageType)}>
                          <select
                            className="w-full appearance-none rounded bg-white px-3 py-2 capitalize"
                            onChange={(e) => setCottageType(e.target.value || '')}
                            value={cottageType}
                          >
                            <option value="">Please select…</option>
                            {Object.keys(COTTAGE_TYPE).map((k) => (
                              <option key={k} value={k}>
                                {COTTAGE_TYPE[k]}
                              </option>
                            ))}
                          </select>
                          <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block font-medium">
                        Accreditation <span className="text-red-500">*</span>
                      </label>
                      <div className={selectWrap(!accreditation)}>
                        <select
                          className="w-full appearance-none rounded bg-white px-3 py-2 capitalize"
                          onChange={(e) => setAccreditation(e.target.value || '')}
                          value={accreditation}
                        >
                          <option value="">Please select accreditation…</option>
                          <option value={Accreditation.LOCAL}>
                            {ACCREDITATION[Accreditation.LOCAL]}
                          </option>
                          <option
                            disabled={preschoolOrK1}
                            value={Accreditation.INTERNATIONAL}
                          >
                            {ACCREDITATION[Accreditation.INTERNATIONAL]}
                          </option>
                          <option disabled={preschoolOrK1} value={Accreditation.DUAL}>
                            {ACCREDITATION[Accreditation.DUAL]}
                          </option>
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Card.Body>
                <GeneralPoliciesAndGuidelines />
              </div>
            )}

            {step === 2 && programFeeByAccreditation && (
              <div className="space-y-4">
                <div className="rounded border border-primary-100 bg-primary-50/40 p-3">
                  <p className="text-xs">{ENROLLMENT_TYPE[enrollmentType]}</p>
                  <h3 className="text-lg font-semibold text-primary-600">
                    {PROGRAM[program]} for {GRADE_LEVEL[gradeLevel]} —{' '}
                    {ACCREDITATION[accreditation]}
                  </h3>
                </div>
                <div>
                  <label className="mb-1 block font-medium">
                    Select payment type <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrap(!payment)}>
                    <select
                      className="w-full appearance-none rounded border px-3 py-2 capitalize"
                      onChange={(e) => {
                        const v = e.target.value || null;
                        setPayment(v);
                        const terms = programFeeByAccreditation?.paymentTerms;
                        if (v === PaymentType.ANNUAL) setFee(terms?.[0]);
                        else if (v === PaymentType.SEMI_ANNUAL) setFee(terms?.[1]);
                        else if (v === PaymentType.QUARTERLY) setFee(terms?.[2]);
                        else if (v === PaymentType.MONTHLY) setFee(terms?.[3]);
                        else setFee(null);
                      }}
                      value={payment || ''}
                    >
                      <option value="">Please select payment type…</option>
                      <option value={PaymentType.ANNUAL}>Full payment</option>
                      <option value={PaymentType.SEMI_ANNUAL}>
                        Three (3) term payment
                      </option>
                      <option value={PaymentType.QUARTERLY}>
                        Four (4) term payment
                      </option>
                      {programFeeByAccreditation?.paymentTerms?.[3] && (
                        <option value={PaymentType.MONTHLY}>
                          Monthly term payment
                        </option>
                      )}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <PaymentPoliciesAndRefund />

                <p className="text-xs text-gray-700">
                  By completing and submitting this form, we agree to follow the
                  terms listed above in the Living Pupil Homeschool Agreement. We
                  understand that this agreement is bona fide and will be
                  enforced.
                </p>

                <hr className="my-5 border border-dashed border-gray-300" />

                <div>
                  <label className="mb-1 block font-medium">
                    Select payment method <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrap(!paymentMethod)}>
                    <select
                      className="w-full appearance-none rounded border px-3 py-2 capitalize"
                      onChange={(e) =>
                        setPaymentMethod(e.target.value || null)
                      }
                      value={paymentMethod || ''}
                    >
                      <option value="">Please select payment method…</option>
                      <option value={Fees.ONLINE}>
                        Online banking (+ Php 10.00)
                      </option>
                      <option value={Fees.OTC}>
                        Over-the-counter banking (+ Php 15.00)
                      </option>
                      <option value={Fees.PAYMENT_CENTERS}>
                        Payment centers (+ Php 20.00)
                      </option>
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded border bg-gray-50 p-3">
                  <label className="text-sm font-medium text-primary-700">
                    Discount code
                  </label>
                  <div className="flex rounded border">
                    <input
                      className="w-3/4 rounded-l px-2 py-1 text-sm"
                      onChange={(e) => {
                        setDiscountCode(e.target.value);
                        setDiscount(null);
                      }}
                      value={discountCode}
                    />
                    <button
                      className="w-1/4 rounded-r bg-secondary-500 px-2 text-xs text-white hover:bg-secondary-400"
                      disabled={isSubmittingCode}
                      onClick={applyDiscount}
                      type="button"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <SchoolFeesBreakdown
                  discount={discount}
                  discountCode={discountCode}
                  fee={fee}
                  feesMap={FEES}
                  monthIndex={monthIndex}
                  monthlyPayment={monthlyPayment}
                  paymentMethod={paymentMethod}
                />

                <div className="flex flex-col space-y-3">
                  <label className="text-base font-medium text-primary-600 md:text-lg">
                    {!payment
                      ? 'Initial Fees Summary for Payments'
                      : payment === PaymentType.ANNUAL
                        ? `Full Payment Summary for ${PAYMENT_TYPE[payment]} Payments`
                        : `Initial Fees Summary for ${PAYMENT_TYPE[payment]} Payments`}
                  </label>
                  <div className="flex flex-col justify-between rounded border bg-gray-50">
                    <div className="flex items-center justify-between space-x-5 border-b p-4 md:p-5">
                      <div>
                        <h5 className="font-medium">Enrollment Fee</h5>
                        <h6 className="text-xs text-gray-500">
                          Based on payment type selection
                        </h6>
                      </div>
                      <div className="text-right text-sm">
                        {formatEnrollmentPhp(getEnrollmentFeeLineAmount(fee))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between space-x-5 border-b p-4 md:p-5">
                      <div>
                        <h5 className="font-medium">Payment Gateway Fee</h5>
                        <h6 className="text-xs text-gray-500">
                          Based on payment method selection
                        </h6>
                      </div>
                      <div className="text-right text-sm">
                        {formatEnrollmentPhp(FEES[paymentMethod] || 0)}
                      </div>
                    </div>
                    {fee?._type === 'fullTermPayment' && (
                      <div className="flex items-center justify-between space-x-5 border-b p-4 md:p-5">
                        <div>
                          <h5 className="font-medium">Miscellaneous Fee</h5>
                          <h6 className="text-xs text-gray-500">
                            Enrollment miscellaneous fee
                          </h6>
                        </div>
                        <div className="text-right text-sm">
                          {formatEnrollmentPhp(500)}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between space-x-5 p-4 md:p-5">
                      <div>
                        <h5 className="font-medium">Discount</h5>
                        <h6 className="text-xs text-gray-500">
                          Based on applied discount code:{' '}
                          <span className="font-bold text-green-600">
                            {discountCode || '-'}{' '}
                            {discount
                              ? `(${Number(discount.value).toFixed(2)}${
                                  discount.type === 'VALUE' ? 'Php' : '%'
                                })`
                              : ''}
                          </span>
                        </h6>
                        {fee && fee?._type !== 'fullTermPayment' && (
                          <p className="text-xs font-semibold text-primary-600">
                            <strong>NOTE:</strong> Discount will be applied on
                            the second payment.
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <span className={discount ? 'text-red-600' : ''}>
                          {formatEnrollmentPhp(
                            getDiscountDisplayNumber(fee, discount)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between space-x-5 border-t border-dashed border-gray-300 bg-gray-100 p-4 md:p-5">
                      <div>
                        <h5 className="font-bold">
                          {fee?._type === 'fullTermPayment'
                            ? 'Total Payable'
                            : 'Initial Fee'}
                        </h5>
                        <h6 className="text-xs text-primary-600">
                          <strong>NOTE</strong>: Succeeding payments will always
                          incur payment gateway fees per transaction and see
                          breakdown for applicable discounts
                        </h6>
                      </div>
                      <div className="text-right text-sm font-semibold">
                        {formatEnrollmentPhp(
                          getInitialFeeTotalNumber(
                            fee,
                            discount,
                            paymentMethod,
                            FEES
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    checked={agree}
                    onChange={() => setAgree(!agree)}
                    type="checkbox"
                  />
                  <span>
                    Yes, I agree. My responses will be saved in Living Pupil
                    Homeschool&apos;s Database.
                  </span>
                </label>

                <div>
                  <p className="mb-2 text-center text-xs text-gray-600">
                    By signing, you are agreeing to the Homeschool Agreement and
                    Payment Policy.
                  </p>
                  <SignatureCanvas
                    canvasProps={{
                      className: `sigCanvas h-40 w-full rounded border bg-gray-100 ${
                        signatureLink ? 'border-gray-400' : 'border-red-500'
                      }`,
                    }}
                    ref={sigCanvas}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      className="rounded bg-red-500 px-3 py-1 text-xs text-white"
                      onClick={() => sigCanvas.current?.clear()}
                      type="button"
                    >
                      Clear
                    </button>
                    <button
                      className="rounded bg-blue-500 px-3 py-1 text-xs text-white"
                      onClick={saveSignature}
                      type="button"
                    >
                      Save signature
                    </button>
                  </div>
                  <div className="mt-1 h-1 w-full rounded bg-gray-200">
                    <div
                      className="h-full rounded bg-secondary-500"
                      style={{ width: `${signatureProgress}%` }}
                    />
                  </div>
                  {signatureLink && (
                    <Link href={signatureLink}>
                      <a
                        className="text-xs text-primary-600 underline"
                        rel="noreferrer"
                        target="_blank"
                      >
                        Preview signature
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {step === 2 && !programFeeByAccreditation && (
              <p className="text-amber-800">
                No fee schedule found for this program / grade / accreditation.
                Go back and confirm program and accreditation.
              </p>
            )}

            <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
              <Button
                className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                disabled={step === 0}
                onClick={previous}
                type="button"
              >
                Previous
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  className="bg-primary-600 text-white hover:bg-primary-500"
                  disabled={!validateNext}
                  onClick={next}
                  type="button"
                >
                  Next
                </Button>
              ) : (
                <Button
                  className="bg-primary-600 text-white hover:bg-primary-500"
                  disabled={!validateNext || isSubmitting}
                  onClick={submitAll}
                  type="button"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit enrollment'}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default EnrollSchoolYearWizardModal;
