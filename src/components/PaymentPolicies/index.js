import format from 'date-fns/format';
import Link from 'next/link';
import SignatureCanvas from 'react-signature-canvas';

export const PaymentPoliciesText = ({ inModal = false }) => (
  <div className={`space-y-5 leading-relaxed ${inModal ? 'text-sm' : 'text-sm'}`}>
    <h3 className={`font-bold ${inModal ? 'text-lg' : 'text-base'}`}>
      General Policies on Payment of Tuition Fees, Refund and Withdrawal or
      Transfer
    </h3>
    <p>
      To maintain a seamless transition into our homeschooling community, we
      have streamlined the following payment policies designed to support an
      efficient transaction.
    </p>
    <ol className="px-5 space-y-4 list-decimal">
      <li>
        <strong>ACCEPTED MODE OF PAYMENT.</strong> The school will accept bank
        deposit or bank transfer, credit or debit card payments, over-the-counter
        payment, Post-dated checks, subject to school approval and Online payment
        platforms/electronic wallets (only: Gcash/Union Bank, and Dragonpay);
      </li>
      <li>
        <strong>INSTALLMENT PAYMENT PLAN.</strong> Families availing of
        installment payments shall, upon enrollment, select their preferred
        payment terms through the Parent Portal.
      </li>
      <li>
        <strong>NON-REFUNDABLE FEES.</strong> The Reservation Fee, Tuition
        Downpayment, Registration Fee, Digital Platform Access Fees upon
        activation, and all costs associated with learning kits, books, and
        educational materials already released, distributed, or otherwise made
        available to the learner shall be non-refundable under all
        circumstances.
      </li>
      <li>
        <strong>WITHDRAWAL CHARGES POLICY.</strong> All withdrawal from
        enrollment must be submitted in writing by the parent or legal guardian
        of the learners. The parent will email the withdrawal letter to our admin
        at: admthelivingpupil@gmail.com and the finance department at:
        finance.livingpupil@gmail.com. Such withdrawal shall be subject to the
        following charges:
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm border border-collapse border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-3 py-2 font-bold text-left border border-gray-300">
                  PERIOD
                </th>
                <th className="px-3 py-2 font-bold text-left border border-gray-300">
                  CHARGES
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border border-gray-300">
                  Within one Week after the Enrollment
                </td>
                <td className="px-3 py-2 border border-gray-300">
                  10% of the full amount of tuition
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-300">
                  Within two Weeks after the Enrollment
                </td>
                <td className="px-3 py-2 border border-gray-300">
                  20% of the full amount of tuition
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-300">
                  Withdrawal after three (3) weeks from enrollment
                </td>
                <td className="px-3 py-2 border border-gray-300">
                  30% of the full amount of tuition
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-300">
                  Withdrawal after one (1) month from enrollment
                </td>
                <td className="px-3 py-2 border border-gray-300">
                  Full Tuition
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-300">
                  Withdrawal after (2) months from the opening of class
                </td>
                <td className="px-3 py-2 border border-gray-300">
                  Full Tuition
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </li>
      <li>
        <strong>PROCESSING OF REFUND.</strong> In case of refund, requests must
        be submitted in writing by the parent or legal guardian of the learners
        enrolled in a specific academic year (A.Y.). Approved refunds shall be
        processed within thirty (30) to sixty (60) business days, subject to
        accounting verification and banking procedures.
      </li>
      <li>
        <strong>DELAYED PAYMENTS AND INTEREST CHARGES.</strong> Any unpaid
        balance not settled within fifteen (15) calendar days from its due date
        shall incur a late payment charge of three percent (3%) per month.
      </li>
      <li>
        <strong>UNPAID ACCOUNT.</strong> Accounts that remain unpaid for more
        than sixty (60) calendar days shall be subject to:
        <ul className="px-5 mt-2 space-y-1 list-disc">
          <li>
            7.1. Temporary Restriction of Parent Portal Access to Student
            Academic Records
          </li>
          <li>
            7.2. Non-release of report cards, certificates, or credentials;
          </li>
          <li>
            7.3. Disqualification from re-enrollment for the succeeding academic
            year; and/or
          </li>
          <li>
            7.4. Appropriate legal or collection remedies permitted under
            Philippine law.
          </li>
        </ul>
        <p className="mt-3 italic">
          <strong>Note:</strong> Children enrolled in preschool or pre-elementary
          levels shall not be required to obtain school records as a prerequisite
          for enrollment into the next grade level. However, all unpaid balances
          and financial obligations must still be fully paid before approval of
          enrollment to the succeeding academic level.
        </p>
      </li>
      <li>
        <strong>DISHONERED OR BOUNCED CHECKS.</strong> The parent or guardian
        shall be responsible for bank penalties, administrative handling fees
        and legal consequences under Batas Pambansa Blg. 22 or other applicable
        laws.
      </li>
      <li>
        <strong>PAGSAULOG.</strong> All students must participate in the year end
        PAGSAULOG (Graduation, Moving-Up and Recognition Celebration) either
        online or face to face and are subject to a registration fee of Php 1300
        - Php 3500 per family. This celebration is part of the clearance
        requirement.
      </li>
      <li>
        <strong>RESERVATION OF RIGHTS.</strong> The school reserves the right to
        amend, revise, or supplement this policy when necessary to comply with
        Existing Philippine laws and departmental regulations, Government
        issuances, Amendments in law or orders, Institutional operational
        requirements; or Extraordinary circumstances affecting school operations.
        All revisions shall take effect upon official publication or
        dissemination by the school administration.
      </li>
      <li>
        <strong>ACKNOWLEDGMENT.</strong> I hereby acknowledge that I have read,
        understood, and agreed to comply with the foregoing policy. By signing
        below, I signify my acceptance of and adherence to this policy.
      </li>
    </ol>
  </div>
);

export const PaymentPolicySignatureSection = ({
  sigCanvas,
  signatureLink,
  signatureProgress,
  onClear,
  onSave,
  disabled = false,
}) => (
  <div
    className={`flex flex-col items-center p-5 space-y-5 bg-gray-100 rounded ${
      disabled ? 'pointer-events-none opacity-50' : ''
    }`}
  >
    <div className="flex flex-col items-center w-full">
      <p className="mb-3 text-xs text-center">
        By signing, you are agreeing to the General Policies on Payment of
        Tuition Fees, Refund and Withdrawal or Transfer Policy.
      </p>
      <SignatureCanvas
        ref={sigCanvas}
        canvasProps={{
          className: `sigCanvas bg-white border ${
            signatureLink ? 'border-gray-400' : 'border-red-500'
          } w-full h-40 sm:h-48 md:h-56 lg:h-64`,
        }}
      />
      <div className="flex mt-3 space-x-3">
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="px-3 py-1 text-white bg-red-500 rounded disabled:opacity-50"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={disabled}
          className="px-3 py-1 text-white bg-blue-500 rounded disabled:opacity-50"
        >
          Save
        </button>
      </div>
      <div className="w-full mt-2 rounded-full shadow bg-grey-light">
        <div
          className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
          style={{ width: `${signatureProgress}%` }}
        >
          <span className="px-3">{signatureProgress}%</span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center space-y-3">
        {signatureLink ? (
          <Link href={signatureLink}>
            <a className="text-sm text-blue-600 underline" target="_blank">
              Preview Image
            </a>
          </Link>
        ) : (
          <p className="text-sm text-gray-500">No signature uploaded</p>
        )}
      </div>
    </div>
  </div>
);
