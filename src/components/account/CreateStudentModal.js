import { useEffect, useMemo, useState } from 'react';
import crypto from 'crypto';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { Gender, Religion } from '@prisma/client';
import differenceInYears from 'date-fns/differenceInYears';
import format from 'date-fns/format';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import slugify from 'slugify';
import toast from 'react-hot-toast';
import phil, {
  getBarangayByMun,
  getCityMunByProvince,
} from 'phil-reg-prov-mun-brgy';
import zip from 'zipcodes-ph';

import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Modal from '@/components/Modal';
import { useParentStudents } from '@/hooks/data/index';
import { storage } from '@/lib/client/firebase';
import api from '@/lib/common/api';
import { RELIGION } from '@/utils/constants';
import {
  normalizeFullNameFromParts,
  normalizeFullNameString,
} from '@/utils/student-name';

const MAX_FILE_BYTES = 10485760;

/**
 * Student Information + Files and Documents (aligned with enrollment form step 1).
 * Program / grade / school year for each year remain on full enrollment (`EnrollmentV2`).
 */
const CreateStudentModal = ({ show, toggle, onCreated }) => {
  const { data: studentsPayload } = useParentStudents();
  const existingStudents = studentsPayload?.students;
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 7);
    return d;
  });
  /** Empty until selected — matches enrollment form (required, red border when unset). */
  const [gender, setGender] = useState('');
  const [religion, setReligion] = useState(Religion.ROMAN_CATHOLIC);
  const [reason, setReason] = useState('');
  const [specialRadio, setSpecialRadio] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [isCity, setIsCity] = useState(false);
  const [isBarangay, setIsBarangay] = useState(false);
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [internationAddress, setInternationalAddress] = useState('');

  const [pictureLink, setPictureLink] = useState(null);
  const [birthCertificateLink, setBirthCertificateLink] = useState(null);
  const [reportCardLink, setReportCardLink] = useState(null);
  const [pictureProgress, setPictureProgress] = useState(0);
  const [birthCertificateProgress, setBirthCertificateProgress] = useState(0);
  const [reportCardProgress, setReportCardProgress] = useState(0);

  const [isSubmitting, setSubmittingState] = useState(false);

  const storageSlug = useMemo(() => {
    if (!firstName.trim() || !lastName.trim()) return '';
    return slugify(
      `${firstName.toLowerCase()} ${lastName.toLowerCase()} ${crypto
        .createHash('md5')
        .update(`${firstName}${lastName}`)
        .digest('hex')
        .substring(0, 6)}}`
    );
  }, [firstName, lastName]);

  const workspaceName = useMemo(() => {
    const parts = [firstName, lastName].map((s) => s.trim()).filter(Boolean);
    return parts.join(' ');
  }, [firstName, lastName]);

  const age = differenceInYears(new Date(), birthDate) || 0;

  const duplicateFullName = useMemo(() => {
    if (!firstName.trim() || !lastName.trim()) return false;
    const key = normalizeFullNameFromParts(firstName, middleName, lastName);
    if (!key) return false;
    return (
      existingStudents?.some(
        (s) => normalizeFullNameString(s.fullName) === key
      ) ?? false
    );
  }, [firstName, middleName, lastName, existingStudents]);

  /** Same rules as enrollment step 0 student block (not guardians/teachers/school year). Birth certificate is highlighted but not required to proceed, matching enrollment. */
  const isFormValid = useMemo(() => {
    const okName =
      firstName.length > 0 &&
      lastName.length > 0 &&
      !duplicateFullName;
    const okBirth = Boolean(birthDate);
    const okGender = gender.length > 0;
    const okReason = reason.length > 0;
    const okSpecial = specialRadio === 'YES' || specialRadio === 'NO';
    const okSpecialDetail =
      specialRadio !== 'YES' || specialNeeds.trim().length > 0;
    const okProvince = Boolean(selectedProvince);
    const okCity = String(selectedCity).length > 0;
    const okBarangay = String(selectedBarangay).length > 0;
    const okAddr1 = address1.length > 0;
    const okZip = String(zipCode).length > 0;
    const okAddress2 = address2.length > 0;
    return (
      okName &&
      okBirth &&
      okGender &&
      okReason &&
      okSpecial &&
      okSpecialDetail &&
      okProvince &&
      okCity &&
      okBarangay &&
      okAddr1 &&
      okZip &&
      okAddress2
    );
  }, [
    firstName,
    lastName,
    birthDate,
    gender,
    reason,
    specialRadio,
    specialNeeds,
    selectedProvince,
    selectedCity,
    selectedBarangay,
    address1,
    zipCode,
    address2,
    duplicateFullName,
  ]);

  const invalidBorder = (invalid) =>
    invalid ? 'border-red-500 border-2' : 'border border-gray-300';

  const getCityMunByCode = (code) => {
    if (isNaN(code)) {
      return code;
    }
    if (code) {
      const city_mun = cities.find((loc) => loc.mun_code === code);
      let city = city_mun?.name;
      if (city) {
        city = city
          .toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      return city;
    }
  };

  const getProvinceByCode = (code) => {
    if (code) {
      const prov = phil.provinces.find((loc) => loc.prov_code === code);
      let province = prov?.name;
      if (province) {
        province = province
          .toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      return province;
    }
  };

  const updateAddress = (zip, province, city, barangay) => {
    const newAddress = `${barangay}, ${city}, ${province}, ${zip}`;
    setAddress2(newAddress);
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setZipCode('');
    const provinceData = getCityMunByProvince(province);
    setCities(provinceData || []);
    setSelectedCity('');
    setBarangays([]);
    updateAddress('', getProvinceByCode(province), '', '');
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    const cityData = getBarangayByMun(city);
    setBarangays(cityData || []);
    setSelectedBarangay('');
    updateAddress(
      zipCode,
      getProvinceByCode(selectedProvince),
      getCityMunByCode(city),
      ''
    );
  };

  const handleBarangayChange = (e) => {
    const barangay = e.target.value;
    setSelectedBarangay(barangay);
    updateAddress(
      zipCode,
      getProvinceByCode(selectedProvince),
      getCityMunByCode(selectedCity),
      barangay
    );
  };

  useEffect(() => {
    let city = getCityMunByCode(selectedCity);
    if (city) {
      city = city
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    if (!city) return;
    const z = zip.reverse(city);
    setZipCode(z || '');
  }, [selectedCity]);

  useEffect(() => {
    updateAddress(
      zipCode,
      getProvinceByCode(selectedProvince),
      getCityMunByCode(selectedCity),
      selectedBarangay
    );
  }, [zipCode]);

  const uploadToPath = (file, folderPrefix, setProgress, setUrl) => {
    if (!storageSlug) {
      toast.error('Enter first and last name before uploading.');
      return;
    }
    if (file.size < MAX_FILE_BYTES) {
      const extension = file.name.split('.').pop();
      const storageRef = ref(
        storage,
        `files/${storageSlug}/${folderPrefix}-${crypto
          .createHash('md5')
          .update(file.name)
          .digest('hex')
          .substring(0, 12)}-${format(
          new Date(),
          'yyyy.MM.dd.kk.mm.ss'
        )}.${extension}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          toast.error(error?.message || 'Upload failed');
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setUrl(downloadURL);
            setProgress(100);
          });
        }
      );
    } else {
      toast.error('File too large. Size should not exceed 10 MB.');
    }
  };

  const handlePictureUpload = (e) => {
    const file = e.target?.files?.[0];
    if (file) uploadToPath(file, 'picture', setPictureProgress, setPictureLink);
  };

  const handleBirthCertificateUpload = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      uploadToPath(
        file,
        'birth',
        setBirthCertificateProgress,
        setBirthCertificateLink
      );
    }
  };

  const handleReportCardUpload = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      uploadToPath(
        file,
        'report',
        setReportCardProgress,
        setReportCardLink
      );
    }
  };

  const reset = () => {
    setFirstName('');
    setMiddleName('');
    setLastName('');
    const d = new Date();
    d.setFullYear(d.getFullYear() - 7);
    setBirthDate(d);
    setGender('');
    setReligion(Religion.ROMAN_CATHOLIC);
    setReason('');
    setSpecialRadio('');
    setSpecialNeeds('');
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedBarangay('');
    setCities([]);
    setBarangays([]);
    setIsCity(false);
    setIsBarangay(false);
    setAddress1('');
    setAddress2('');
    setZipCode('');
    setInternationalAddress('');
    setPictureLink(null);
    setBirthCertificateLink(null);
    setReportCardLink(null);
    setPictureProgress(0);
    setBirthCertificateProgress(0);
    setReportCardProgress(0);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isFormValid) {
      toast.error('Please complete all required fields.');
      return;
    }
    if (!workspaceName || workspaceName.length > 128) {
      toast.error('Enter first and last name for the student.');
      return;
    }

    setSubmittingState(true);
    api('/api/workspace', {
      body: {
        name: workspaceName,
        firstName: firstName.trim(),
        middleName: (middleName || '').trim(),
        lastName: lastName.trim(),
        birthDate: birthDate.toISOString(),
        gender,
        religion,
        reason: reason.trim(),
        specialRadio,
        specialNeeds: specialRadio === 'YES' ? specialNeeds.trim() : '',
        address1: address1.trim(),
        address2: address2.trim(),
        internationAddress: internationAddress.trim() || undefined,
        pictureLink: pictureLink || undefined,
        birthCertificateLink: birthCertificateLink || undefined,
        reportCardLink: reportCardLink || undefined,
      },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((key) => {
          const err = response.errors[key];
          const msg = err?.msg || err?.message || key;
          toast.error(typeof msg === 'string' ? msg : 'Validation error');
        });
      } else {
        reset();
        toggle();
        toast.success('Student enrolled.');
        onCreated?.();
      }
    });
  };

  const inputClass = (invalid) =>
    `w-full px-3 py-2 rounded text-sm text-gray-900 ${invalidBorder(!!invalid)}`;

  return (
    <Modal show={show} title="Add Student" toggle={toggle}>
      <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
        <p className="text-gray-600">
          Add student information and documents. Program, grade, and school year
          for each school year are completed in the full enrollment flow.
        </p>

        <Card.Body title="Student Information">
          <div className="flex flex-col p-2 space-y-3">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Full name <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  className={inputClass(
                    firstName.length <= 0 || duplicateFullName
                  )}
                  disabled={isSubmitting}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Given name"
                  type="text"
                  value={firstName}
                />
                <input
                  className={inputClass(duplicateFullName)}
                  disabled={isSubmitting}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Middle name (optional)"
                  type="text"
                  value={middleName}
                />
                <input
                  className={inputClass(
                    lastName.length <= 0 || duplicateFullName
                  )}
                  disabled={isSubmitting}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  type="text"
                  value={lastName}
                />
              </div>
              {duplicateFullName && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  A student with this full name already exists. Change the name
                  or use the existing student record.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Birthday <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative rounded ${invalidBorder(!birthDate)}`}
                >
                  <DatePicker
                    className="w-full px-2 py-1 bg-transparent outline-none"
                    disabled={isSubmitting}
                    nextMonthButtonLabel=">"
                    onChange={(date) => date && setBirthDate(date)}
                    popperClassName="react-datepicker-left"
                    previousMonthButtonLabel="<"
                    selected={birthDate}
                    selectsStart
                    startDate={birthDate}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Age
                </label>
                <input
                  className={inputClass(false)}
                  disabled
                  readOnly
                  type="text"
                  value={`${age} years old`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative flex rounded ${invalidBorder(!gender)}`}
                >
                  <select
                    className="w-full px-3 py-2 capitalize rounded appearance-none bg-white"
                    disabled={isSubmitting}
                    onChange={(e) => setGender(e.target.value)}
                    value={gender}
                  >
                    <option value="">Select Gender</option>
                    {[Gender.MALE, Gender.FEMALE].map((g) => (
                      <option key={g} value={g}>
                        {g.toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Religion <span className="text-red-500">*</span>
                </label>
                <div className="relative flex rounded border border-gray-300">
                  <select
                    className="w-full px-3 py-2 capitalize rounded appearance-none bg-white"
                    disabled={isSubmitting}
                    onChange={(e) => setReligion(e.target.value)}
                    value={religion}
                  >
                    {Object.entries(RELIGION).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Reason for homeschooling <span className="text-red-500">*</span>
              </label>
              <textarea
                className={`${inputClass(!reason)} min-h-[100px]`}
                disabled={isSubmitting}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why did you choose to homeschool your child?"
                rows={4}
                value={reason}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Does the child have special needs?{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    checked={specialRadio === 'NO'}
                    disabled={isSubmitting}
                    name="specialNeedsRadio"
                    onChange={() => {
                      setSpecialRadio('NO');
                      setSpecialNeeds('');
                    }}
                    type="radio"
                    value="NO"
                  />
                  No
                </label>
                <label className="flex items-center gap-2">
                  <input
                    checked={specialRadio === 'YES'}
                    disabled={isSubmitting}
                    name="specialNeedsRadio"
                    onChange={() => setSpecialRadio('YES')}
                    type="radio"
                    value="YES"
                  />
                  Yes
                </label>
              </div>
            </div>
            {specialRadio === 'YES' && (
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Please specify <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass(
                    specialRadio === 'YES' && specialNeeds.length <= 0
                  )}
                  disabled={isSubmitting}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  type="text"
                  value={specialNeeds}
                />
              </div>
            )}

            <hr className="border-dashed" />

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Complete address <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-3 mt-1">
                <select
                  className={inputClass(!selectedProvince)}
                  disabled={isSubmitting}
                  onChange={handleProvinceChange}
                  value={selectedProvince}
                >
                  <option value="">Select Province</option>
                  {phil.provinces.map((p) => (
                    <option key={p.prov_code} value={p.prov_code}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {!isCity ? (
                  <select
                    className={inputClass(!selectedCity)}
                    disabled={!selectedProvince || isSubmitting}
                    onChange={handleCityChange}
                    value={selectedCity}
                  >
                    <option value="">Select City/Municipality</option>
                    {cities.map((city) => (
                      <option key={city.mun_code} value={city.mun_code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inputClass(!selectedCity)}
                    disabled={isSubmitting}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="City"
                    type="text"
                    value={selectedCity}
                  />
                )}
                <Button
                  className="text-gray-800 bg-gray-200 hover:bg-gray-300 w-full sm:w-auto"
                  onClick={() => setIsCity((v) => !v)}
                  type="button"
                >
                  {isCity ? 'Select city from list' : 'Enter city manually'}
                </Button>
                {!isBarangay ? (
                  <select
                    className={inputClass(!selectedBarangay)}
                    disabled={!selectedCity || isSubmitting}
                    onChange={handleBarangayChange}
                    value={selectedBarangay}
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map((b, i) => (
                      <option key={i} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inputClass(!selectedBarangay)}
                    disabled={isSubmitting}
                    onChange={(e) => setSelectedBarangay(e.target.value)}
                    placeholder="Barangay"
                    type="text"
                    value={selectedBarangay}
                  />
                )}
                <Button
                  className="text-gray-800 bg-gray-200 hover:bg-gray-300 w-full sm:w-auto"
                  onClick={() => setIsBarangay((v) => !v)}
                  type="button"
                >
                  {isBarangay
                    ? 'Select barangay from list'
                    : 'Enter barangay manually'}
                </Button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className={inputClass(!address1)}
                    disabled={isSubmitting}
                    onChange={(e) => setAddress1(e.target.value)}
                    placeholder="House No., Street, Village/Subdivision"
                    type="text"
                    value={address1}
                  />
                  <input
                    className={inputClass(!zipCode)}
                    disabled={isSubmitting}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="ZIP Code"
                    type="text"
                    value={zipCode}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Province / city / barangay line:{' '}
                  <span className="font-medium text-gray-700">
                    {address2 || '—'}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                International address{' '}
                <span className="text-gray-500">(if residing abroad)</span>
              </label>
              <input
                className={inputClass(false)}
                disabled={isSubmitting}
                onChange={(e) => setInternationalAddress(e.target.value)}
                placeholder="Optional"
                type="text"
                value={internationAddress}
              />
            </div>
          </div>
        </Card.Body>

        <Card.Body title="Files and Documents">
          <div className="flex flex-col p-2 space-y-4">
            {(!firstName || !lastName) && (
              <div className="px-3 py-3 text-sm border-2 rounded text-amber-500 border-amber-600 bg-amber-50">
                <p>
                  Please provide the student information first before uploading
                  any documents
                </p>
              </div>
            )}
            <p className="text-sm font-bold text-gray-900">
              Optional: You can upload these files at a later time
            </p>
            <p className="text-xs text-gray-600 sm:text-sm">
              Accepted file formats are <strong>PDF</strong>,{' '}
              <strong>PNG</strong>, <strong>JPEG/JPG</strong>, and{' '}
              <strong>GIF</strong> with a maximum file size of{' '}
              <strong className="text-red-600">10 MB</strong>.
            </p>
            <table className="w-full text-xs border border-collapse sm:text-sm">
              <tbody>
                <tr>
                  <td className="w-1/2 px-2 py-2 border align-top">
                    <h3 className="font-semibold">ID Picture</h3>
                    <p className="text-gray-500">
                      Digital copy of the child&apos;s latest photo with{' '}
                      <strong>WHITE</strong> background
                    </p>
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      accept=".jpeg,.jpg,.png"
                      disabled={!firstName || !lastName || isSubmitting}
                      onChange={handlePictureUpload}
                      type="file"
                    />
                    <div className="w-full mt-1 h-1.5 rounded bg-gray-200">
                      <div
                        className="h-full rounded bg-secondary-500"
                        style={{ width: `${pictureProgress}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2 border">
                    {pictureLink ? (
                      <Link href={pictureLink}>
                        <a
                          className="text-primary-600 underline"
                          rel="noreferrer"
                          target="_blank"
                        >
                          Preview
                        </a>
                      </Link>
                    ) : (
                      <span className="text-gray-400">No file</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td
                    className={`px-2 py-2 align-top ${
                      !birthCertificateLink
                        ? 'border-red-500 border-2'
                        : 'border'
                    }`}
                  >
                    <h3 className="font-semibold">Birth Certificate</h3>
                    <p className="text-gray-500">
                      <strong>Philippine Statistics Authority (PSA)</strong>{' '}
                      issued copy of the child&apos;s birth certificate
                    </p>
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      accept=".gif,.jpeg,.jpg,.png,.pdf"
                      disabled={!firstName || !lastName || isSubmitting}
                      onChange={handleBirthCertificateUpload}
                      type="file"
                    />
                    <div className="w-full mt-1 h-1.5 rounded bg-gray-200">
                      <div
                        className="h-full rounded bg-secondary-500"
                        style={{ width: `${birthCertificateProgress}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2 border">
                    {birthCertificateLink ? (
                      <Link href={birthCertificateLink}>
                        <a
                          className="text-primary-600 underline"
                          rel="noreferrer"
                          target="_blank"
                        >
                          Preview
                        </a>
                      </Link>
                    ) : (
                      <span className="text-gray-400">No file</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-2 border align-top">
                    <h3 className="font-semibold">Report Card / School Card</h3>
                    <p className="text-gray-500">From previous school</p>
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      accept=".gif,.jpeg,.jpg,.png,.pdf"
                      disabled={!firstName || !lastName || isSubmitting}
                      onChange={handleReportCardUpload}
                      type="file"
                    />
                    <div className="w-full mt-1 h-1.5 rounded bg-gray-200">
                      <div
                        className="h-full rounded bg-secondary-500"
                        style={{ width: `${reportCardProgress}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2 border">
                    {reportCardLink ? (
                      <Link href={reportCardLink}>
                        <a
                          className="text-primary-600 underline"
                          rel="noreferrer"
                          target="_blank"
                        >
                          Preview
                        </a>
                      </Link>
                    ) : (
                      <span className="text-gray-400">No file</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card.Body>

        <div className="flex flex-col items-stretch pt-2">
          <Button
            className="text-white bg-primary-600 hover:bg-primary-600"
            disabled={isSubmitting || !isFormValid}
            type="submit"
          >
            {isSubmitting ? 'Saving…' : 'Submit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateStudentModal;
