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
import { is } from 'date-fns/locale';

const QUARTERLY_FORM_ID = '252259173067460';
const quarterlyForms = {
  [GradeLevel.K2]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_1]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_2]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_3]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_4]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_5]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_6]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_7]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_8]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_9]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_10]: QUARTERLY_FORM_ID,
};

// Year End Requirements - by grade level
// K2 | Grades 1-3 | Grades 4-6 | Grades 7-10
const yearEndForms = {
  [GradeLevel.K2]: '260549507424459',
  [GradeLevel.GRADE_1]: '260549092239462',
  [GradeLevel.GRADE_2]: '260549092239462',
  [GradeLevel.GRADE_3]: '260549092239462',
  [GradeLevel.GRADE_4]: '260548590769472',
  [GradeLevel.GRADE_5]: '260548590769472',
  [GradeLevel.GRADE_6]: '260548590769472',
  [GradeLevel.GRADE_7]: '260549250286460',
  [GradeLevel.GRADE_8]: '260549250286460',
  [GradeLevel.GRADE_9]: '260549250286460',
  [GradeLevel.GRADE_10]: '260549250286460',
};

const userUnsettledDues = [
  'edgiepascua19@gmail.com',
  'louviloveamancio02@gmail.com',
  'louviloveamancio02@gmail.com',
  'leamanulat@gmail.com',
  'annjelafreelancing@gmail.com',
  'louviloveamancio02@gmail.com',
  'deianirajill@gmail.com',
  'queenpeanuts2019@gmail.com',
  'gracebenaro1287@gmail.com',
  'heavencie21@gmail.com',
  'lopenajenin8@gmail.com',
  'lopenajenin8@gmail.com',
  'amaraagravante@gmail.com',
  'yoursgally@icloud.com',
  'maychrisphils@gmail.com',
  'gee.umbay@gmail.com',
  'cardonacmichelle@gmail.com',
  'annjelafreelancing@gmail.com',
  'trinah_saguiguit@yahoo.com',
  'irenerosacena34@gmail.com',
  'louviloveamancio02@gmail.com',
  'jaymecristineg14@gmail.com',
  'john.2021reysela.2022@gmail.com',
  'cherry.barrias@yahoo.com.ph',
  'camiliabee22@yahoo.com',
  'japitantheresa@gmail.com',
  'khendyz85@gmail.com',
  'khendyz85@gmail.com',
  'aocajayon12@gmail.com',
  'maychrisphils@gmail.com',
  'scpongos@gmail.com',
  'gee.umbay@gmail.com',
  'selosailonahjeana@gmail.com',
  'annjelafreelancing@gmail.com',
  'trinah_saguiguit@yahoo.com',
  'irenerosacena34@gmail.com',
  'louviloveamancio02@gmail.com',
  'mariannealexis.kalaw@gmail.com',
  'ziellepaule31@gmail.com',
  'edgiepascua19@gmail.com',
  'joan.moyoco@gmail.com',
  'leamanulat@gmail.com',
  'ysaterso31@gmail.com',
  'mlcdiaz71@yahoo.com',
  'mlcdiaz71@yahoo.com',
  'fudge_wik3@yahoo.com',
  'aocajayon12@gmail.com',
  'maychrisphils@gmail.com',
  'scpongos@gmail.com',
  'gee.umbay@gmail.com',
  'selosailonahjeana@gmail.com',
  'annjelafreelancing@gmail.com',

  'trinah_saguiguit@yahoo.com',
  'irenerosacena34@gmail.com',
  'louviloveamancio02@gmail.com',
  'aocajayon12@gmail.com',
  'bridges.homeschoollp@gmail.com',
  'bridges.homeschoollp@gmail.com',
  'bridges.homeschoollp@gmail.com',
  'bridges.homeschoollp@gmail.com',
  'bridges.homeschoollp@gmail.com',
  'ameline.cabardo@gmail.com',
  'janvincent.buhion@gmail.com',
  'cnsanayehr@gmail.com',
  'peachyglaze93@gmail.com',
  'peachyglaze93@gmail.com',
  'peachyglaze93@gmail.com',
  'meriamclo032@gmail.com',
  'heavencie21@gmail.com',
  'lopenajenin8@gmail.com',
  'lopenajenin8@gmail.com',
  'amaraagravante@gmail.com',
  'yoursgally@icloud.com',
  'gracebenaro1287@gmail.com',
  'queenpeanuts2019@gmail.com',
  'deianirajill@gmail.com',
  'seninfrias24@gmail.com',
  'ruthieflorest1031@gmail.com',
  'camiliabee22@yahoo.com',
  'maidy.cramales@yahoo.com',
  'maquiling.kyla22@gmail.com',
  'khendyz85@gmail.com',
  'khendyz85@gmail.com',
  'cabagyen@gmail.com',
  'angel.nahid92@gmail.com',
  'cardonacmichelle@gmail.com',
  'przewodnikmark@gmail.com',
  'przewodnikmark@gmail.com',
  'taripeibrahim0@gmail.com',
  'fudge_wik3@yahoo.com',
  'maychrisphils@gmail.com',
  'scpongos@gmail.com',
  'scpongos@gmail.com',
  'gee.umbay@gmail.com',
  'gretaespiritu@gmail.com',
  'selosailonahjeana@gmail.com',
  'annjelafreelancing@gmail.com',
  'gretaespiritu@gmail.com',
  'gretaespiritu@gmail.com',
  'gretaespiritu@gmail.com',

  'trinah_saguiguit@yahoo.com',
  'karenwenwa@gmail.com',
  'irenerosacena34@gmail.com',
  'louviloveamancio02@gmail.com',
  'lopenajenin8@gmail.com',
  'gillianfrancescamb@gmail.com',
  'howellcaronan@gmail.com',
  'nalagonivy@yhoo.com',
  'ladycaroline.amoin@gmail.com',
  'ladycaroline.amoin@gmail.com',
  'switbluejess@gmail.com',
  'aocajayon12@gmail.com',
  'jaymecristineg14@gmail.com',
  'aningkaye@gmail.com',
  'john.2021reysela.2022@gmail.com',
  'cherry.barrias@yahoo.com.ph',
  'anjelai2013@gmail.com',
  'rizamontes.va@gmail.com',
  'richlacuesta@gmail.com',
  'aikopuda21@gmail.com',
  'switbluejess@gmail.com',
  'przewodnikmark@gmail.com',
  'przewodnikmark@gmail.com',
  'przewodnikmark@gmail.com',
  'taripeibrahim0@gmail.com',
  'fudge_wik3@yahoo.com',
  'maychrisphils@gmail.com',
  'scpongos@gmail.com',
  'scpongos@gmail.com',
  'gee.umbay@gmail.com',
  'gretaespiritu@gmail.com',
  'selosailonahjeana@gmail.com',
  'annjelafreelancing@gmail.com',
  'gretaespiritu@gmail.com',
  'gretaespiritu@gmail.com',
  'gretaespiritu@gmail.com',

  'riziritz18@gmail.com',
  'trinah_saguiguit@yahoo.com',
  'karenwenwa@gmail.com',
  'irenerosacena34@gmail.com',
  'queenlacson25@gmail.com',
  'louviloveamancio02@gmail.com',
  'tine.tolentino9@gmail.com',
  'meldeetan1990@gmail.com',
  'lspresillas23@gmail.com',
  'lspresillas23@gmail.com',
  'mariannealexis.kalaw@gmail.com',
  'christine.r.bongato@gmail.com',
  'ziellepaule31@gmail.com',
  'lopenajenin8@gmail.com',
  'saniel.keziah09@gmail.com',
  'lopenajenin8@gmail.com',
  'gillianfrancescamb@gmail.com',
  'howellcaronan@gmail.com',
  'vnsaliwag@gmail.com',
  'nalagonivy@yhoo.com',
  'ladycaroline.amoin@gmail.com',
  'ladycaroline.amoin@gmail.com',
  'switbluejess@gmail.com',
  'switbluejess@gmail.com',

  'ffloresarah@gmail.com',
  'aocajayon12@gmail.com',
  'gingmirallesmd@gmail.com',
  'eldzbenigay1@gmail.com',
  'mlcdiaz71@yahoo.com',
  'montesclarosjonessa@gmail.com',
  'tinneyolmedo@gmail.com',
  'jonnaabadia030829@gmail.com',
  'cabatinganjhellyca@gmail.com',
  'gracebenaro1287@gmail.com',
  'hanahpuerteyu@gmail.com',
  'queenpeanuts2019@gmail.com',
  'tinneyolmedo@gmail.com',
  'rosecelldiana@gmail.com',
  'chip.suarez@gmail.com',
  'mlcdiaz71@yahoo.com',
  'deianirajill@gmail.com',
  'seninfrias24@gmail.com',
  'sherilyndemesa001@gmail.com',
  'emzqco@gmail.com',
  'camiliabee22@yahoo.com',
  'm2gladtoday@gmail.com',
  'maidy.cramales@yahoo.com',
  'maquiling.kyla22@gmail.com',
  'nicodaphnekeon@gmail.com',
  'dejecacionangela@gmail.com',
  'kakayhamili@gmail.com',
  'khendyz85@gmail.com',
  'khendyz85@gmail.com',
  'debbie.balonon@gmail.com',
  'cabagyen@gmail.com',
  'richlacuesta@gmail.com',
  'aikopuda21@gmail.com',
  'switbluejess@gmail.com',
  'przewodnikmark@gmail.com',
  'przewodnikmark@gmail.com',
  'przewodnikmark@gmail.com',
  'taripeibrahim0@gmail.com',
  'fudge_wik3@yahoo.com',
  'maychrisphils@gmail.com',
  'scpongos@gmail.com',
  'scpongos@gmail.com',
  'ronilo.montejo@gmail.com',
  'gee.umbay@gmail.com',
  'gretaespiritu@gmail.com',
  'selosailonahjeana@gmail.com',
  'annjelafreelancing@gmail.com',
  'besanaandycarlo@gmail.com',
  'gretaespiritu@gmail.com',
  'gretaespiritu@gmail.com',
  'gretaespiritu@gmail.com',
  'sandradelantar@gmail.com',
  'peacelayese111@gmail.com',
  'riziritz18@gmail.com',
  'trinah_saguiguit@yahoo.com',
  'karenwenwa@gmail.com',
  'irenerosacena34@gmail.com',
  'ar.scrisostomo4@gmail.com',
  'tine.tolentino9@gmail.com',
  'meldeetan1990@gmail.com',
  'lspresillas23@gmail.com',
  'lspresillas23@gmail.com',
  'imee.suarez@gmail.com',
  'lopenajenin8@gmail.com',
  'howellcaronan@gmail.com',
  'nalagonivy@yhoo.com',
  'switbluejess@gmail.com',
  'switbluejess@gmail.com',
  'ffloresarah@gmail.com',
  'switbluejess@gmail.com',
  'przewodnikmark@gmail.com',
  'przewodnikmark@gmail.com',
  'przewodnikmark@gmail.com',
  'fudge_wik3@yahoo.com',
];

const Grades = () => {
  const { workspace } = useWorkspace();
  const [formPage, setFormPage] = useState('quarterly');

  const handleSelectChange = (event) => {
    setFormPage(event.target.value);
  };

  const isInUnsettleDuesList = userUnsettledDues.includes(
    workspace?.creator.email,
  );
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
                  <option value="quarterly">Quarterly Requirements</option>
                  <option value="year-end">Year End Requirements</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5" />
                </div>
              </div>

              {(formPage === 'quarterly' || formPage === 'year-end') &&
                (() => {
                  const forms =
                    formPage === 'quarterly' ? quarterlyForms : yearEndForms;
                  const formId =
                    forms[workspace?.studentRecord?.incomingGradeLevel];
                  if (!formId)
                    return (
                      <p className="mt-4 text-gray-600">
                        No form available for this grade level.
                      </p>
                    );
                  return (
                    <div className="mt-4 min-h-[600px] w-full">
                      <JotFormEmbed
                        key={`${formPage}-${workspace?.studentRecord?.incomingGradeLevel}`}
                        src={`https://form.jotform.com/${formId}`}
                        scrolling={true}
                        style={{ height: '100%', minHeight: 600 }}
                      />
                    </div>
                  );
                })()}
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
