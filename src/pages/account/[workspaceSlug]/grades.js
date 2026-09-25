import { useState } from 'react';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { useWorkspace } from '@/providers/workspace';
import JotFormEmbed from 'react-jotform-embed';
import { GradeLevel } from '@prisma/client';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { getSession } from 'next-auth/react';
import {
  PartnerSchool,
  formatStudentPartnerSchools,
  getUsPartnerSchool,
} from '@/utils/constants';

// S.Y. 2026-2027 Term Requirements - by partner school
const termForms = {
  [PartnerSchool.KAIROS]: '262088747216464',
  [PartnerSchool.MANDAUE]: '262098951793472',
};

// S.Y. 2026-2027 Year End Requirements - by partner school and grade band
// K2 | Grades 1-3 | Grades 4-6 | Grades 7-10
const yearEndForms = {
  [PartnerSchool.KAIROS]: {
    [GradeLevel.K2]: '261957952103461',
    [GradeLevel.GRADE_1]: '261958436762470',
    [GradeLevel.GRADE_2]: '261958436762470',
    [GradeLevel.GRADE_3]: '261958436762470',
    [GradeLevel.GRADE_4]: '261958956818479',
    [GradeLevel.GRADE_5]: '261958956818479',
    [GradeLevel.GRADE_6]: '261958956818479',
    [GradeLevel.GRADE_7]: '261958599117474',
    [GradeLevel.GRADE_8]: '261958599117474',
    [GradeLevel.GRADE_9]: '261958599117474',
    [GradeLevel.GRADE_10]: '261958599117474',
  },
  [PartnerSchool.MANDAUE]: {
    [GradeLevel.K2]: '262097919231462',
    [GradeLevel.GRADE_1]: '262098072330453',
    [GradeLevel.GRADE_2]: '262098072330453',
    [GradeLevel.GRADE_3]: '262098072330453',
    [GradeLevel.GRADE_4]: '262098587041463',
    [GradeLevel.GRADE_5]: '262098587041463',
    [GradeLevel.GRADE_6]: '262098587041463',
    [GradeLevel.GRADE_7]: '262098100048451',
    [GradeLevel.GRADE_8]: '262098100048451',
    [GradeLevel.GRADE_9]: '262098100048451',
    [GradeLevel.GRADE_10]: '262098100048451',
  },
};

const userUnsettledDues = [
  'edgiepascua19@gmail.com',
  'louviloveamancio02@gmail.com',
  'louviloveamancio02@gmail.com',
  'leamanulat@gmail.com',
  'louviloveamancio02@gmail.com',
  'gracebenaro1287@gmail.com',
  'heavencie21@gmail.com',
  'maychrisphils@gmail.com',
  'gee.umbay@gmail.com',
  'irenerosacena34@gmail.com',
  'louviloveamancio02@gmail.com',
  'john.2021reysela.2022@gmail.com',
  'cherry.barrias@yahoo.com.ph',
  'camiliabee22@yahoo.com',
  'aocajayon12@gmail.com',
  'maychrisphils@gmail.com',
  'gee.umbay@gmail.com',
  'selosailonahjeana@gmail.com',
  'irenerosacena34@gmail.com',
  'louviloveamancio02@gmail.com',
  'mariannealexis.kalaw@gmail.com',
  'edgiepascua19@gmail.com',
  'leamanulat@gmail.com',
  'mlcdiaz71@yahoo.com',
  'mlcdiaz71@yahoo.com',
  'fudge_wik3@yahoo.com',
  'aocajayon12@gmail.com',
  'maychrisphils@gmail.com',
  'gee.umbay@gmail.com',
  'selosailonahjeana@gmail.com',
  'irenerosacena34@gmail.com',
  'louviloveamancio02@gmail.com',
  'aocajayon12@gmail.com',
  'cnsanayehr@gmail.com',
  'heavencie21@gmail.com',
  'gracebenaro1287@gmail.com',
  'seninfrias24@gmail.com',
  'ruthieflorest1031@gmail.com',
  'camiliabee22@yahoo.com',
  'angel.nahid92@gmail.com',
  'taripeibrahim0@gmail.com',
  'fudge_wik3@yahoo.com',
  'maychrisphils@gmail.com',
  'gee.umbay@gmail.com',
  'selosailonahjeana@gmail.com',
  'irenerosacena34@gmail.com',
  'louviloveamancio02@gmail.com',
  'gillianfrancescamb@gmail.com',
  'howellcaronan@gmail.com',
  'nalagonivy@yhoo.com',
  'ladycaroline.amoin@gmail.com',
  'ladycaroline.amoin@gmail.com',
  'switbluejess@gmail.com',
  'aocajayon12@gmail.com',
  'john.2021reysela.2022@gmail.com',
  'cherry.barrias@yahoo.com.ph',
  'anjelai2013@gmail.com',
  'rizamontes.va@gmail.com',
  'richlacuesta@gmail.com',
  'aikopuda21@gmail.com',
  'switbluejess@gmail.com',
  'taripeibrahim0@gmail.com',
  'fudge_wik3@yahoo.com',
  'maychrisphils@gmail.com',
  'gee.umbay@gmail.com',
  'selosailonahjeana@gmail.com',
  'irenerosacena34@gmail.com',
  'queenlacson25@gmail.com',
  'louviloveamancio02@gmail.com',
  'meldeetan1990@gmail.com',
  'lspresillas23@gmail.com',
  'lspresillas23@gmail.com',
  'mariannealexis.kalaw@gmail.com',
  'christine.r.bongato@gmail.com',
  'gillianfrancescamb@gmail.com',
  'howellcaronan@gmail.com',
  'nalagonivy@yhoo.com',
  'ladycaroline.amoin@gmail.com',
  'ladycaroline.amoin@gmail.com',
  'switbluejess@gmail.com',
  'switbluejess@gmail.com',
  'aocajayon12@gmail.com',
  'gingmirallesmd@gmail.com',
  'mlcdiaz71@yahoo.com',
  'gracebenaro1287@gmail.com',
  'mlcdiaz71@yahoo.com',
  'seninfrias24@gmail.com',
  'sherilyndemesa001@gmail.com',
  'camiliabee22@yahoo.com',
  'richlacuesta@gmail.com',
  'aikopuda21@gmail.com',
  'switbluejess@gmail.com',
  'taripeibrahim0@gmail.com',
  'fudge_wik3@yahoo.com',
  'maychrisphils@gmail.com',
  'gee.umbay@gmail.com',
  'selosailonahjeana@gmail.com',
  'peacelayese111@gmail.com',
  'irenerosacena34@gmail.com',
  'meldeetan1990@gmail.com',
  'lspresillas23@gmail.com',
  'lspresillas23@gmail.com',
  'howellcaronan@gmail.com',
  'nalagonivy@yhoo.com',
  'switbluejess@gmail.com',
  'switbluejess@gmail.com',
  'switbluejess@gmail.com',
  'fudge_wik3@yahoo.com',
  'ginalynpebida1984@gmail.com',
  'ira.bluerose@gmail.com',
  'raine.rosales1021@gmail.com',
  'shaigimao@gmail.com',
  'creator.klariza@gmail.com',
  'hlynrs18@gmail.com',
  'shengdizon21@gmail.com',
  'trinah_saguiguit@yahoo.com',
  'mariajessavillaber@gmail.com',
  'donamaeabrigo@gmail.com',
  'nicodaphnekeon@gmail.com',
  'ellinejeanne@gmail.com',
  'maricris.jamarolin@gmail.com',
  'castroliezel@gmail.com',
  'mark.elle11@gmail.com',
  'npamaran.hasan@gmail.com',
  'daianefq01@gmail.com',
  'kchinoguin28@gmail.com',
  'ietyayangpaqs10@gmail.com',
  'almamikai@gmail.com',
  'dfmbanaag@gmail.com',
  'kgdacumos1989@gmail.com',
  'lovicabrera@gmail.com',
  'queenpeanuts2019@gmail.com',
  'scpongos@gmail.com',
  'kaiaralar@gmail.com',
  'gallardomatheresa676@gmail.com',
  'leigabornes@gmail.com',
  'gerdiaz12221990@gmail.com',
  'reina@vaxclusive.com',
  'nahidmadel@gmail.com',
  'ivarsmukbang@gmail.com',
  'belgarjobelle@gmail.com',
  'maidy.cramales@yahoo.com',
  'norjannahdica9@gmail.com',
  '5jardawa@protonmail.com',
  'fbliwayan@gmail.com',
  'janvincent.buhion@gmail.com',
  'borgoniaeliza@gmail.com',
  'ilove_candiez@yahoo.com',
  'privatejayranz@yahoo.com',
  'flornavacilla@gmail.com',
  'noreen.suerte@gmail.com',
  'lcadungog22@gmail.com',
  'iraguedan@gmail.com',
  'jlois.tiano@gmail.com',
  'cmnseverino@gmail.com',
  'sandradelantar@gmail.com',
  'shennafaitht@gmail.com',
  'peaches.color@gmail.com',
  'sweetyloumiole@gmail.com',
  'camilledenisencm@gmail.com',
  'samkristine2022@gmail.com',
  'debbie.balonon@gmail.com',
  'sheryna@gmail.com',
  'tinneyolmedo@gmail.com',
  'mvdayangco@gmail.com',
  'ysaterso31@gmail.com',
  'chrisbobjanssencaballero@gmail.com',
  'mitchborjal@yahoo.com',
  'real.bon72987@gmail.com',
  'deianirajill@gmail.com',
  'aquitanseno@gmail.com',
  'faithfortesa.va@gmail.com',
  'loste.gellieann@hotmail.com',
  'bella073088@gmail.com',
  'mannahgarcia09@gmail.com',
  'jedajanecv@gmail.com',
  'francemoiselle@gmail.com',
  'borjaangellouise8@gmail.com',
  'carmelmd@yahoo.com.ph',
];

const Grades = () => {
  const { workspace } = useWorkspace();
  const [formPage, setFormPage] = useState('card');

  const handleSelectChange = (event) => {
    setFormPage(event.target.value);
  };

  const isInUnsettleDuesList = userUnsettledDues.includes(
    workspace?.creator.email,
  );
  const schoolYearReportCardUrl =
    workspace?.studentRecord?.schoolYearReportCard;
  const gradeLevel = workspace?.studentRecord?.incomingGradeLevel;
  const storedPartnerSchool = workspace?.studentRecord?.partnerSchool;
  const partnerSchool = getUsPartnerSchool(storedPartnerSchool);
  const showPartnerForms = formPage === 'term' || formPage === 'year-end';

  const getFormId = () => {
    if (!partnerSchool) return null;

    if (formPage === 'term') {
      return termForms[partnerSchool];
    }

    if (formPage === 'year-end') {
      return yearEndForms[partnerSchool]?.[gradeLevel];
    }

    return null;
  };

  const formId = getFormId();

  return (
    <AccountLayout>
      {workspace ? (
        <>
          <Meta title="Living Pupil Homeschool - Student Grades" />
          <Content.Title
            title={`${workspace.name} - Grades`}
            subtitle="View your student's grades"
          />
          <Content.Divider />
          {isInUnsettleDuesList ? (
            <Card>
              <div className="p-4 text-center">
                <p className="text-lg font-semibold text-red-500">
                  Grade uploads are currently disabled. Please settle any
                  outstanding dues first.
                </p>
              </div>
            </Card>
          ) : (
            <Content.Container>
              <div className="relative inline-block w-full sm:w-1/2 md:w-1/3 border-none">
                <select
                  className="w-full px-3 py-1.5 text-xs sm:text-sm capitalize rounded appearance-none border leading-tight"
                  onChange={handleSelectChange}
                  value={formPage}
                >
                  <option value="term">Term Requirements</option>
                  <option value="year-end">Year End Requirements</option>
                  <option value="card">Card</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5" />
                </div>
              </div>

              {showPartnerForms && !storedPartnerSchool && (
                <p className="mt-4 text-gray-600">
                  Partner school not assigned. Please contact Living Pupil.
                </p>
              )}

              {showPartnerForms && storedPartnerSchool && (
                <>
                  <p className="mt-3 text-sm text-gray-600">
                    Partner School:{' '}
                    {formatStudentPartnerSchools(workspace?.studentRecord)}
                  </p>
                  {formId ? (
                    <div className="mt-4 min-h-[600px] w-full">
                      <JotFormEmbed
                        key={`${formPage}-${partnerSchool}-${gradeLevel}`}
                        src={`https://form.jotform.com/${formId}`}
                        scrolling={true}
                        style={{ height: '100%', minHeight: 600 }}
                      />
                    </div>
                  ) : (
                    <p className="mt-4 text-gray-600">
                      No form available for this partner school or grade level.
                    </p>
                  )}
                </>
              )}

              {formPage === 'card' && (
                <div className="mt-4 space-y-4">
                  {schoolYearReportCardUrl ? (
                    <>
                      <div className="w-full min-h-[600px] border rounded overflow-hidden bg-gray-50">
                        <iframe
                          className="w-full min-h-[600px] border-0"
                          src={`https://docs.google.com/gview?url=${encodeURIComponent(
                            schoolYearReportCardUrl,
                          )}&embedded=true`}
                          title="School Year Report Card"
                        />
                      </div>
                      <a
                        className="inline-block px-4 py-2 text-sm text-white rounded bg-primary-500 hover:bg-primary-400"
                        download
                        href={schoolYearReportCardUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Download Report Card
                      </a>
                    </>
                  ) : (
                    <p className="text-gray-600">
                      No school year report card has been uploaded yet.
                    </p>
                  )}
                </div>
              )}
            </Content.Container>
          )}
        </>
      ) : null}
    </AccountLayout>
  );
};

// Force server-side rendering to ensure router.query is available
export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  // Redirect to login if not authenticated, preserving the original URL
  if (!session) {
    const callbackUrl = encodeURIComponent(
      context.resolvedUrl || context.req.url,
    );
    return {
      redirect: {
        destination: `/auth/login?callbackUrl=${callbackUrl}`,
        permanent: false,
      },
    };
  }

  // Return empty props - workspace will be loaded by AccountLayout
  return {
    props: {},
  };
};

export default Grades;
