import format from 'date-fns/format';
import Link from 'next/link';
import SignatureCanvas from 'react-signature-canvas';

export const ParentPartnershipAgreementContent = ({ inModal = false }) => (
  <div
    className={`space-y-5 leading-relaxed ${
      inModal ? 'text-sm' : 'p-5 text-sm bg-gray-100 rounded'
    }`}
  >
    <h3 className={`font-bold ${inModal ? 'text-lg' : 'text-base'}`}>
      Parent Partnership Agreement
    </h3>
    <p>
      At Living Pupil Homeschool, we believe that homeschooling is a partnership
      between the school and the family. As the primary educator of your child,
      your active participation is essential to your child&apos;s growth and
      success.
    </p>

    <div>
      <p className="font-semibold">Before Enrollment</p>
      <p>
        To ensure that families are well-prepared for the homeschooling journey,
        we ask that all parents intending to enroll watch the Homeschool
        Fundamentals training videos.
      </p>
    </div>

    <div>
      <p className="font-semibold">As a Parent-Educator, I Commit To:</p>
      <p className="font-bold">Preparing for Home Education</p>
      <ul className="px-5 list-disc space-y-1">
        <li>
          Dedicating time to plan, study, and organize our homeschool program.
        </li>
        <li>
          Intentionally completing all required self-paced training and attending
          Living Pupil parent-teacher training sessions.
        </li>
        <li>
          Continually growing in my understanding of the Charlotte Mason
          philosophy and its practical application in our home.
        </li>
        <li>
          Families enrolled in the Pure Charlotte Mason Program or the Homeschool
          Cottage 3-Day Program commit to ongoing growth in the Charlotte Mason
          philosophy by faithfully attending the trainings, workshops, and parent
          education opportunities provided by Living Pupil Homeschool.
        </li>
      </ul>
      <p className="mt-3 font-bold">Working in Partnership with Living Pupil</p>
      <ul className="px-5 list-disc space-y-1">
        <li>
          Participating in coaching sessions, consultations, or support meetings
          with Living Pupil advisers and coaches whenever available.
        </li>
        <li>
          Communicating openly with the school regarding concerns, challenges, or
          circumstances that may affect my child&apos;s academic progress, habits,
          or behavior.
        </li>
        <li>
          Staying informed by regularly checking official school communication
          channels, including email, the Living Pupil Facebook Page, parent
          groups, chat rooms, and other platforms designated by the school.
        </li>
      </ul>
      <p className="mt-3 font-bold">Maintaining Academic Records</p>
      <ul className="px-5 list-disc space-y-1">
        <li>
          Administering term assessments using the full Charlotte Mason or
          Charlotte Mason-inspired approach provided by the school.
        </li>
        <li>
          Submitting term and final grades, including computed averages,
          according to Living Pupil Homeschool guidelines (for Kindergarten 2 to
          Grade 10 students).
        </li>
        <li>
          Complying with the Department of Education (DepEd) requirement of at
          least 200 school days per academic year and maintaining records
          according to DepEd guidelines.
        </li>
      </ul>
    </div>

    <div>
      <p className="font-bold">
        As a Member of the Living Pupil Family, I Commit To:
      </p>
      <ul className="px-5 list-disc space-y-1">
        <li>
          Supporting and promoting the values, mission, and educational
          philosophy of Living Pupil Homeschool.
        </li>
        <li>
          Encouraging a respectful, cooperative, and Christ-centered learning
          community.
        </li>
        <li>
          Participating, whenever possible, in school activities, events, and
          community gatherings, recognizing their importance in fostering
          relationships and enriching the homeschool experience.
        </li>
        <li>
          Participating in Pagsaulog, the Living Pupil end-of-school-year
          celebration.
        </li>
        <li>
          Recognizing that the school community is sustained through shared
          responsibility, I commit to fulfilling all financial obligations
          according to my chosen payment schedule (annual, semi-annual, or
          quarterly).
        </li>
      </ul>
    </div>

    <div>
      <p className="font-bold">Intellectual Property</p>
      <p>I understand and agree that:</p>
      <ul className="px-5 list-disc space-y-1">
        <li>
          I will not reproduce, record, distribute, upload, share, sell, or
          publicly display Living Pupil&apos;s training videos, lecture
          recordings, course materials, lesson plans, handouts, digital
          resources, or other proprietary materials without prior written
          permission from the school.
        </li>
        <li>
          Access to Living Pupil&apos;s parent trainings, curriculum resources,
          recordings, and educational materials is intended solely for enrolled
          families and may not be shared with non-enrolled individuals or
          organizations.
        </li>
      </ul>
    </div>

    <div>
      <p className="font-bold">Enrollment Agreement</p>
      <p>
        I understand that enrollment in Living Pupil Homeschool begins with a
        provisional enrollment status. Full enrollment is granted upon the
        satisfactory completion of the required self-paced parent training and
        fulfillment of all enrollment requirements established by the school.
      </p>
      <p className="mt-2">
        By enrolling, I acknowledge that homeschooling is a shared responsibility
        and that I am committed to partnering with Living Pupil Homeschool in
        providing a rich, meaningful, and life-giving education for my child.
      </p>
    </div>
  </div>
);

export const MediaConsentSection = ({ mediaConsent, onChange, disabled = false }) => (
  <div
    className={`flex flex-col p-5 space-y-4 text-sm leading-relaxed bg-gray-100 rounded ${
      disabled ? 'pointer-events-none opacity-50' : ''
    }`}
  >
    <p className="text-sm font-bold">Media Consent</p>
    <p>Please select one: <span className="text-red-600">*</span></p>
    <div
      className={`space-y-3 rounded px-3 py-2 ${
        mediaConsent === null ? 'border-red-500 border-2' : ''
      }`}
    >
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="radio"
          name="mediaConsent"
          className="mt-1"
          disabled={disabled}
          checked={mediaConsent === true}
          onChange={() => onChange(true)}
        />
        <span>
          <strong>I GRANT PERMISSION</strong> for Living Pupil Homeschool to use photographs,
          videos, testimonials, interviews, and other media involving my child
          and family for educational, promotional, publication, social media,
          marketing, and community-building purposes.
        </span>
      </label>
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="radio"
          name="mediaConsent"
          className="mt-1"
          disabled={disabled}
          checked={mediaConsent === false}
          onChange={() => onChange(false)}
        />
        <span>
          <strong>I DO NOT GRANT PERMISSION</strong> for Living Pupil Homeschool to use
          identifiable photographs, videos, testimonials, interviews, or other
          media involving my child and family for promotional or marketing
          purposes. I understand that while the school will make reasonable
          efforts to honor this request, my child may still appear incidentally in
          group photographs, event recordings, livestreams, or documentation of
          school activities where individual participants are not the primary
          focus.
        </span>
      </label>
    </div>
  </div>
);

export const EnrollmentAgreementSignatureSection = ({
  primaryGuardianName,
  enrollmentSigCanvas,
  enrollmentAgreementSignatureLink,
  enrollmentSignatureProgress,
  enrollmentAgreementSignatureDate,
  onClear,
  onSave,
  disabled = false,
}) => (
  <div
    className={`flex flex-col p-5 space-y-5 bg-gray-100 rounded ${
      disabled ? 'pointer-events-none opacity-50' : ''
    }`}
  >
    <h3 className="text-lg font-bold">Enrollment Agreement</h3>
    <p className="text-sm">
      Parent/Guardian Name:{' '}
      <span className="font-medium">{primaryGuardianName || '—'}</span>
    </p>
    <p className="text-xs text-gray-600">
      By signing below, you are agreeing to the Parent Partnership Agreement and
      Enrollment Agreement.
    </p>
    <SignatureCanvas
      ref={enrollmentSigCanvas}
      canvasProps={{
        className: `sigCanvas bg-gray-100 border ${
          enrollmentAgreementSignatureLink
            ? 'border-gray-400'
            : 'border-red-500'
        } w-full h-40 sm:h-48 md:h-56 lg:h-64`,
      }}
    />
    <div className="flex space-x-3">
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
      >
        Save
      </button>
    </div>
    <div className="w-full rounded-full shadow bg-grey-light">
      <div
        className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
        style={{ width: `${enrollmentSignatureProgress}%` }}
      >
        <span className="px-3">{enrollmentSignatureProgress}%</span>
      </div>
    </div>
    <div className="flex flex-col items-center justify-center space-y-3">
      {enrollmentAgreementSignatureLink ? (
        <Link href={enrollmentAgreementSignatureLink}>
          <a className="text-sm text-blue-600 underline" target="_blank">
            Preview Image
          </a>
        </Link>
      ) : (
        <p className="text-sm text-gray-500">No signature uploaded</p>
      )}
    </div>
    <p className="text-sm">
      Date:{' '}
      <span className="font-medium">
        {enrollmentAgreementSignatureDate
          ? format(enrollmentAgreementSignatureDate, 'MMMM d, yyyy')
          : '—'}
      </span>
    </p>
  </div>
);
