import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import { AgreementSignatureBlock } from '@/lib/server/agreement-signature';
import { fetchBytes } from '@/lib/server/stamp-agreement-pdf';

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingHorizontal: 48,
    paddingBottom: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.45,
    color: '#111827',
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    marginBottom: 14,
  },
  paragraph: {
    marginBottom: 10,
  },
  item: {
    marginBottom: 10,
  },
  itemTitle: {
    fontFamily: 'Helvetica-Bold',
  },
  nestedList: {
    marginTop: 6,
    paddingLeft: 12,
  },
  nestedItem: {
    marginBottom: 3,
  },
  note: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#e5e7eb',
    fontFamily: 'Helvetica-Bold',
  },
  tableCell: {
    width: '50%',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 9,
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
});

const PolicyItem = ({ number, title, children }) => (
  <View style={styles.item}>
    <Text>
      {number}. <Text style={styles.itemTitle}>{title}</Text> {children}
    </Text>
  </View>
);

const HomeschoolAgreementDocument = ({
  signatureBytes,
  signerName,
  signedAt,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>
        General Policies on Payment of Tuition Fees, Refund and Withdrawal or
        Transfer
      </Text>
      <Text style={styles.paragraph}>
        To maintain a seamless transition into our homeschooling community, we
        have streamlined the following payment policies designed to support an
        efficient transaction.
      </Text>

      <PolicyItem number="1" title="ACCEPTED MODE OF PAYMENT.">
        The school will accept bank deposit or bank transfer, credit or debit
        card payments, over-the-counter payment, Post-dated checks, subject to
        school approval and Online payment platforms/electronic wallets (only:
        Gcash/Union Bank, and Dragonpay);
      </PolicyItem>

      <PolicyItem number="2" title="INSTALLMENT PAYMENT PLAN.">
        Families availing of installment payments shall, upon enrollment, select
        their preferred payment terms through the Parent Portal.
      </PolicyItem>

      <PolicyItem number="3" title="NON-REFUNDABLE FEES.">
        The Reservation Fee, Tuition Downpayment, Registration Fee, Digital
        Platform Access Fees upon activation, and all costs associated with
        learning kits, books, and educational materials already released,
        distributed, or otherwise made available to the learner shall be
        non-refundable under all circumstances.
      </PolicyItem>

      <View style={styles.item}>
        <Text>
          4. <Text style={styles.itemTitle}>WITHDRAWAL CHARGES POLICY.</Text>{' '}
          All withdrawal from enrollment must be submitted in writing by the
          parent or legal guardian of the learners. The parent will email the
          withdrawal letter to our admin at: registrar@livingpupilhomeschoolph.com and the
          finance department at: finance@livingpupilhomeschoolph.com. Such withdrawal
          shall be subject to the following charges:
        </Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>PERIOD</Text>
            <Text style={[styles.tableCell, styles.tableCellLast]}>
              CHARGES
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              Within one Week after the Enrollment
            </Text>
            <Text style={[styles.tableCell, styles.tableCellLast]}>
              10% of the full amount of tuition
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              Within two Weeks after the Enrollment
            </Text>
            <Text style={[styles.tableCell, styles.tableCellLast]}>
              20% of the full amount of tuition
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              Withdrawal after three (3) weeks from enrollment
            </Text>
            <Text style={[styles.tableCell, styles.tableCellLast]}>
              30% of the full amount of tuition
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              Withdrawal after one (1) month from enrollment
            </Text>
            <Text style={[styles.tableCell, styles.tableCellLast]}>
              Full Tuition
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              Withdrawal after (2) months from the opening of class
            </Text>
            <Text style={[styles.tableCell, styles.tableCellLast]}>
              Full Tuition
            </Text>
          </View>
        </View>
      </View>

      <PolicyItem number="5" title="PROCESSING OF REFUND.">
        In case of refund, requests must be submitted in writing by the parent
        or legal guardian of the learners enrolled in a specific academic year
        (A.Y.). Approved refunds shall be processed within thirty (30) to sixty
        (60) business days, subject to accounting verification and banking
        procedures.
      </PolicyItem>

      <PolicyItem number="6" title="DELAYED PAYMENTS AND INTEREST CHARGES.">
        Any unpaid balance not settled within fifteen (15) calendar days from
        its due date shall incur a late payment charge of three percent (3%) per
        month.
      </PolicyItem>

      <View style={styles.item}>
        <Text>
          7. <Text style={styles.itemTitle}>UNPAID ACCOUNT.</Text> Accounts that
          remain unpaid for more than sixty (60) calendar days shall be subject
          to:
        </Text>
        <View style={styles.nestedList}>
          <Text style={styles.nestedItem}>
            7.1. Temporary Restriction of Parent Portal Access to Student
            Academic Records
          </Text>
          <Text style={styles.nestedItem}>
            7.2. Non-release of report cards, certificates, or credentials;
          </Text>
          <Text style={styles.nestedItem}>
            7.3. Disqualification from re-enrollment for the succeeding academic
            year; and/or
          </Text>
          <Text style={styles.nestedItem}>
            7.4. Appropriate legal or collection remedies permitted under
            Philippine law.
          </Text>
        </View>
        <Text style={styles.note}>
          Note: Children enrolled in preschool or pre-elementary levels shall
          not be required to obtain school records as a prerequisite for
          enrollment into the next grade level. However, all unpaid balances and
          financial obligations must still be fully paid before approval of
          enrollment to the succeeding academic level.
        </Text>
      </View>

      <PolicyItem number="8" title="DISHONERED OR BOUNCED CHECKS.">
        The parent or guardian shall be responsible for bank penalties,
        administrative handling fees and legal consequences under Batas Pambansa
        Blg. 22 or other applicable laws.
      </PolicyItem>

      <PolicyItem number="9" title="PAGSAULOG.">
        All students must participate in the year end PAGSAULOG (Graduation,
        Moving-Up and Recognition Celebration) either online or face to face and
        are subject to a registration fee of Php 1300 - Php 3500 per family.
        This celebration is part of the clearance requirement.
      </PolicyItem>

      <PolicyItem number="10" title="RESERVATION OF RIGHTS.">
        The school reserves the right to amend, revise, or supplement this
        policy when necessary to comply with Existing Philippine laws and
        departmental regulations, Government issuances, Amendments in law or
        orders, Institutional operational requirements; or Extraordinary
        circumstances affecting school operations. All revisions shall take
        effect upon official publication or dissemination by the school
        administration.
      </PolicyItem>

      <PolicyItem number="11" title="ACKNOWLEDGMENT.">
        I hereby acknowledge that I have read, understood, and agreed to comply
        with the foregoing policy. By signing below, I signify my acceptance of
        and adherence to this policy.
      </PolicyItem>

      <AgreementSignatureBlock
        signatureBytes={signatureBytes}
        signerName={signerName}
        signedAt={signedAt}
      />
    </Page>
  </Document>
);

export const buildSignedHomeschoolAgreementPdf = async ({
  signatureUrl,
  signerName,
  signedAt,
}) => {
  const signatureBytes = signatureUrl ? await fetchBytes(signatureUrl) : null;
  return renderToBuffer(
    <HomeschoolAgreementDocument
      signatureBytes={signatureBytes}
      signerName={signerName}
      signedAt={signedAt}
    />
  );
};
