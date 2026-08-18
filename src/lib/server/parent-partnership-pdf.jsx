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
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginTop: 8,
    marginBottom: 6,
  },
  subsectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginTop: 6,
    marginBottom: 4,
  },
  list: {
    marginBottom: 8,
    paddingLeft: 12,
  },
  listItem: {
    marginBottom: 4,
  },
});

const Bullet = ({ children }) => (
  <Text style={styles.listItem}>• {children}</Text>
);

const ParentPartnershipDocument = ({
  signatureBytes,
  signerName,
  signedAt,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Parent Partnership Agreement</Text>
      <Text style={styles.paragraph}>
        At Living Pupil Homeschool, we believe that homeschooling is a
        partnership between the school and the family. As the primary educator
        of your child, your active participation is essential to your
        child's growth and success.
      </Text>

      <Text style={styles.sectionTitle}>Before Enrollment</Text>
      <Text style={styles.paragraph}>
        To ensure that families are well-prepared for the homeschooling
        journey, we ask that all parents intending to enroll watch the
        Homeschool Fundamentals training videos.
      </Text>

      <Text style={styles.sectionTitle}>As a Parent-Educator, I Commit To:</Text>
      <Text style={styles.subsectionTitle}>Preparing for Home Education</Text>
      <View style={styles.list}>
        <Bullet>
          Dedicating time to plan, study, and organize our homeschool program.
        </Bullet>
        <Bullet>
          Intentionally completing all required self-paced training and
          attending Living Pupil parent-teacher training sessions.
        </Bullet>
        <Bullet>
          Continually growing in my understanding of the Charlotte Mason
          philosophy and its practical application in our home.
        </Bullet>
        <Bullet>
          Families enrolled in the Pure Charlotte Mason Program or the
          Homeschool Cottage 3-Day Program commit to ongoing growth in the
          Charlotte Mason philosophy by faithfully attending the trainings,
          workshops, and parent education opportunities provided by Living
          Pupil Homeschool.
        </Bullet>
      </View>

      <Text style={styles.subsectionTitle}>
        Working in Partnership with Living Pupil
      </Text>
      <View style={styles.list}>
        <Bullet>
          Participating in coaching sessions, consultations, or support
          meetings with Living Pupil advisers and coaches whenever available.
        </Bullet>
        <Bullet>
          Communicating openly with the school regarding concerns, challenges,
          or circumstances that may affect my child's academic progress,
          habits, or behavior.
        </Bullet>
        <Bullet>
          Staying informed by regularly checking official school communication
          channels, including email, the Living Pupil Facebook Page, parent
          groups, chat rooms, and other platforms designated by the school.
        </Bullet>
      </View>

      <Text style={styles.subsectionTitle}>Maintaining Academic Records</Text>
      <View style={styles.list}>
        <Bullet>
          Administering term assessments using the full Charlotte Mason or
          Charlotte Mason-inspired approach provided by the school.
        </Bullet>
        <Bullet>
          Submitting term and final grades, including computed averages,
          according to Living Pupil Homeschool guidelines (for Kindergarten 2
          to Grade 10 students).
        </Bullet>
        <Bullet>
          Complying with the Department of Education (DepEd) requirement of at
          least 200 school days per academic year and maintaining records
          according to DepEd guidelines.
        </Bullet>
      </View>

      <Text style={styles.sectionTitle}>
        As a Member of the Living Pupil Family, I Commit To:
      </Text>
      <View style={styles.list}>
        <Bullet>
          Supporting and promoting the values, mission, and educational
          philosophy of Living Pupil Homeschool.
        </Bullet>
        <Bullet>
          Encouraging a respectful, cooperative, and Christ-centered learning
          community.
        </Bullet>
        <Bullet>
          Participating, whenever possible, in school activities, events, and
          community gatherings, recognizing their importance in fostering
          relationships and enriching the homeschool experience.
        </Bullet>
        <Bullet>
          Participating in Pagsaulog, the Living Pupil end-of-school-year
          celebration.
        </Bullet>
        <Bullet>
          Recognizing that the school community is sustained through shared
          responsibility, I commit to fulfilling all financial obligations
          according to my chosen payment schedule (annual, semi-annual, or
          quarterly).
        </Bullet>
      </View>

      <Text style={styles.sectionTitle}>Intellectual Property</Text>
      <Text style={styles.paragraph}>I understand and agree that:</Text>
      <View style={styles.list}>
        <Bullet>
          I will not reproduce, record, distribute, upload, share, sell, or
          publicly display Living Pupil's training videos, lecture
          recordings, course materials, lesson plans, handouts, digital
          resources, or other proprietary materials without prior written
          permission from the school.
        </Bullet>
        <Bullet>
          Access to Living Pupil's parent trainings, curriculum resources,
          recordings, and educational materials is intended solely for enrolled
          families and may not be shared with non-enrolled individuals or
          organizations.
        </Bullet>
      </View>

      <Text style={styles.sectionTitle}>Enrollment Agreement</Text>
      <Text style={styles.paragraph}>
        I understand that enrollment in Living Pupil Homeschool begins with a
        provisional enrollment status. Full enrollment is granted upon the
        satisfactory completion of the required self-paced parent training and
        fulfillment of all enrollment requirements established by the school.
      </Text>
      <Text style={styles.paragraph}>
        By enrolling, I acknowledge that homeschooling is a shared
        responsibility and that I am committed to partnering with Living Pupil
        Homeschool in providing a rich, meaningful, and life-giving education
        for my child.
      </Text>
      <AgreementSignatureBlock
        signatureBytes={signatureBytes}
        signerName={signerName}
        signedAt={signedAt}
      />
    </Page>
  </Document>
);

export const buildSignedParentPartnershipPdf = async ({
  signatureUrl,
  signerName,
  signedAt,
}) => {
  const signatureBytes = signatureUrl ? await fetchBytes(signatureUrl) : null;
  return renderToBuffer(
    <ParentPartnershipDocument
      signatureBytes={signatureBytes}
      signerName={signerName}
      signedAt={signedAt}
    />
  );
};
