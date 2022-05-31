import { GradeLevel, PaymentType, TransactionStatus } from '@prisma/client';
import Link from 'next/link';

import Card from '@/components/Card';
import Content from '@/components/Content';
import Meta from '@/components/Meta';
import AccountLayout from '@/layouts/AccountLayout';
import { useWorkspace } from '@/providers/workspace';
import { GRADE_LEVEL } from '@/utils/constants';

const Fees = () => {
  const { workspace } = useWorkspace();
  const fees = {
    [GradeLevel.PRESCHOOL]: { schoolFees: [] },
    [GradeLevel.K1]: { schoolFees: [] },
    [GradeLevel.K2]: { schoolFees: [] },
    [GradeLevel.GRADE_1]: { schoolFees: [] },
    [GradeLevel.GRADE_2]: { schoolFees: [] },
    [GradeLevel.GRADE_3]: { schoolFees: [] },
    [GradeLevel.GRADE_4]: { schoolFees: [] },
    [GradeLevel.GRADE_5]: { schoolFees: [] },
    [GradeLevel.GRADE_6]: { schoolFees: [] },
    [GradeLevel.GRADE_7]: { schoolFees: [] },
    [GradeLevel.GRADE_8]: { schoolFees: [] },
    [GradeLevel.GRADE_9]: { schoolFees: [] },
    [GradeLevel.GRADE_10]: { schoolFees: [] },
    [GradeLevel.GRADE_11]: { schoolFees: [] },
    [GradeLevel.GRADE_12]: { schoolFees: [] },
  };
  workspace?.schoolFees.map((fee) => {
    fees[fee.gradeLevel].schoolFees[fee.order] = fee;
  });

  return (
    workspace && (
      <AccountLayout>
        <Meta title={`Living Pupil Homeschool - ${workspace.name} | Profile`} />
        <Content.Title
          title={`${workspace.name} - School Fees`}
          subtitle="This is the student record information"
        />
        <Content.Divider />
        {workspace.studentRecord ? (
          <Content.Container>
            {Object.keys(fees).map((level) => {
              if (fees[level].schoolFees.length > 0) {
                return (
                  <Card key={level}>
                    <Card.Body title={GRADE_LEVEL[level]}>
                      <table className="border">
                        <thead>
                          <tr className="text-left">
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Fee</th>
                            <th className="px-3 py-2 text-center">
                              Action / Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {fees[level].schoolFees.map((f, index) => (
                            <tr>
                              <td className="px-3 py-2">
                                <p>
                                  {index === 0 &&
                                  f.paymentType === PaymentType.ANNUAL
                                    ? 'Total School Fee'
                                    : index === 0 &&
                                      f.paymentType !== PaymentType.ANNUL
                                    ? 'Initial School Fee'
                                    : index > 0 &&
                                      f.paymentType === PaymentType.SEMI_ANNUAL
                                    ? `Semi-Annual School Fee #${index}`
                                    : `Quarterly Fee #${index}`}
                                </p>
                                <p className="text-xs italic text-gray-400">
                                  <span className="font-medium">
                                    Reference Number:{' '}
                                  </span>
                                  {f.transaction.referenceNumber}
                                </p>
                              </td>
                              <td className="px-3 py-2">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'PHP',
                                }).format(f.transaction.amount)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {f.transaction.paymentStatus ===
                                TransactionStatus.U ? (
                                  <Link href={f.transaction.url}>
                                    <a
                                      className="inline-block px-3 py-2 rounded bg-secondary-500 hover:bg-secondary-400"
                                      target="_blank"
                                    >
                                      Pay Now
                                    </a>
                                  </Link>
                                ) : (
                                  <div>
                                    <span className="inline-block px-3 py-1 text-xs text-white bg-green-600 rounded-full">
                                      Paid
                                    </span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card.Body>
                  </Card>
                );
              }
            })}
          </Content.Container>
        ) : (
          <Content.Container>
            <Card>
              <Card.Body title="No student record yet..."></Card.Body>
            </Card>
          </Content.Container>
        )}
      </AccountLayout>
    )
  );
};

export default Fees;
