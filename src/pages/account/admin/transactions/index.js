import { useMemo, useRef, useState } from 'react';
import formatDistance from 'date-fns/formatDistance';
import api from '@/lib/common/api';

import Papa from 'papaparse';

import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import { useTransactions } from '@/hooks/data';
import { STATUS_CODES } from '@/lib/server/dragonpay';
import { TransactionStatus } from '@prisma/client';
import {
  ACCREDITATION,
  GRADE_LEVEL,
  PAYMENT_TYPE,
  PROGRAM,
  STATUS_BG_COLOR,
  STATUS,
} from '@/utils/constants';
import Modal from '@/components/Modal';

const filterValueOptions = {
  paymentType: PAYMENT_TYPE,
  paymentStatus: STATUS,
};

const filterByOptions = {
  paymentType: 'Payment Type',
  paymentStatus: 'Payment Status',
};

const Transactions = () => {
  const { data, isLoading } = useTransactions();
  const [showModal, setModalVisibility] = useState(false);
  const [isSubmitting, setSubmittingState] = useState(false);
  const [filter, setFilter] = useState(['', '']);
  const [filterBy, filterValue] = filter;
  const [uploadCount, setUploadCount] = useState(0);
  const [totalUpload, setTotalUpload] = useState(0);

  console.log('Transaction data', { data });

  const filterTransactions = useMemo(() => {
    if (!filterBy || !filterValue) return data?.transactions;

    const filteredTransactionIds = data?.transactions
      ?.map(
        ({
          transactionId,
          amount,
          currency,
          paymentReference,
          paymentStatus,
          schoolFee: {
            paymentType,
            student: {
              studentRecord: {
                accreditation,
                enrollmentType,
                incomingGradeLevel,
                program,
              },
            },
          },
        }) => ({
          id: transactionId,
          amount,
          currency,
          paymentReference,
          paymentStatus,
          paymentType,
          accreditation,
          enrollmentType,
          incomingGradeLevel,
          program,
        })
      )
      ?.filter((transaction) => transaction[filterBy] === filterValue)
      ?.map(({ id }) => id);

    return data?.transactions?.filter(({ transactionId }) =>
      filteredTransactionIds.includes(transactionId)
    );
  }, [data, filterBy, filterValue]);

  console.log('Transaction data filtered', { filterTransactions });

  const inputFileRef = useRef();

  const toggleModal = () => setModalVisibility(!showModal);

  const renew = () => {};

  const submit = () => {
    inputFileRef.current.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setTotalUpload(results.data.length);
        setSubmittingState(true);
        for (const data of results.data) {
          api('/api/enroll/import', {
            method: 'POST',
            body: JSON.stringify(data),
          })
            .then((response) => {
              console.log(response);
              setUploadCount(uploadCount++);
              setSubmittingState(uploadCount !== results.data.length);
              if (response.errors) {
                Object.keys(response.errors).forEach((error) =>
                  console.log(response.errors[error].msg)
                );
              } else {
                console.log('Student information successfully submitted!');
              }
            })
            .catch((error) => {
              console.log(error);
              setUploadCount(uploadCount++);
              setSubmittingState(uploadCount !== results.data.length);
            });
        }
      },
    });
  };

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Students List" />
      <Modal
        show={isSubmitting}
        title="Loading import..."
        toggle={() => setSubmittingState(false)}
      >
        <p>Please do not close or refresh the browser.</p>
        <p>
          {uploadCount} / {totalUpload}
        </p>
        <p>
          <progress
            value={(uploadCount / totalUpload) * 100}
            max="100"
            style={{ width: '100%' }}
          />
        </p>
      </Modal>
      <SideModal show={showModal} toggle={toggleModal} />
      <Content.Title
        title="Enrollment Transactions"
        subtitle="View and manage all transactions relevant to enrollment"
      />
      <Content.Divider />
      <div className="flex flex-col">
        <button
          className="w-full py-2 text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
          disabled={isSubmitting}
          onClick={submit}
          style={{ width: '25%' }}
        >
          {isSubmitting ? 'Processing...' : 'Import Transaction'}
        </button>
        <label className="text-xs mt-1">
          Note: Use the CSV template. You can download it{' '}
          <a
            href="/files/import_file_template.csv"
            className="text-primary-500"
          >
            here
          </a>
        </label>
      </div>
      <Content.Container>
        <Card>
          <Card.Body title="Transactions List">
            <div className="flex flex-col md:flex-row space-y-5 py-4 md:justify-between md:items-center">
              <div className="flex flex-1 flex-col md:flex-row space-y-3 md:space-x-5 md:items-center">
                <div>Filter By:</div>
                <div className="flex flex-row md:w-1/4">
                  <div className="relative inline-block w-full rounded border">
                    <select
                      className="w-full px-3 py-2 capitalize rounded appearance-none"
                      onChange={(e) => setFilter([e.target.value, ''])}
                      value={filterBy}
                    >
                      <option value="">-</option>
                      {Object.entries(filterByOptions).map(([value, name]) => (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                {!!filterBy && (
                  <div className="flex flex-row md:w-1/4">
                    <div className="relative inline-block w-full rounded border">
                      <select
                        className="w-full px-3 py-2 capitalize rounded appearance-none"
                        onChange={(e) => setFilter([filterBy, e.target.value])}
                        value={filterValue}
                      >
                        <option value="">-</option>
                        {Object.entries(filterValueOptions[filterBy]).map(
                          ([value, name]) => (
                            <option key={value} value={value}>
                              {name}
                            </option>
                          )
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDownIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-2xl">
                Total: {filterTransactions?.length || 0}
              </div>
            </div>
            <div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 border-t border-b border-t-gray-300 border-b-gray-300">
                    <th className="p-2 font-medium text-left">
                      Student Information
                    </th>
                    <th className="p-2 font-medium text-center">
                      Payment Terms
                    </th>
                    <th className="p-2 font-medium text-left">
                      Transaction Details
                    </th>
                    <th className="p-2 font-medium text-right">Amount</th>
                    <th className="p-2 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading ? (
                    data ? (
                      data.transactions.map((transaction, index) => (
                        <tr
                          key={index}
                          className="text-sm border-t border-b hover:bg-gray-100 border-b-gray-300"
                        >
                          <td className="p-2 text-left">
                            <div>
                              <h4 className="flex items-center space-x-3 text-xl font-medium capitalize text-primary-500">
                                <span>{`${transaction.schoolFee.student.studentRecord.firstName}`}</span>
                                <span className="px-2 py-0.5 text-xs bg-secondary-500 rounded-full">{`${
                                  GRADE_LEVEL[
                                    transaction.schoolFee.student.studentRecord
                                      .incomingGradeLevel
                                  ]
                                }`}</span>
                              </h4>
                              <h5 className="font-bold">
                                <span className="text-xs">{`${
                                  PROGRAM[
                                    transaction.schoolFee.student.studentRecord
                                      .program
                                  ]
                                } - ${
                                  ACCREDITATION[
                                    transaction.schoolFee.student.studentRecord
                                      .accreditation
                                  ]
                                }`}</span>
                              </h5>
                              <p className="text-xs text-gray-400">
                                Created{' '}
                                {new Date(transaction.createdAt).toDateString()}{' '}
                                by{' '}
                                <strong>
                                  {transaction.user.guardianInformation
                                    ? transaction.user.guardianInformation
                                        .primaryGuardianName
                                    : transaction.user.email}
                                </strong>
                              </p>
                              <small>{transaction.user.email}</small>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            {PAYMENT_TYPE[transaction.schoolFee.paymentType]}
                          </td>
                          <td className="p-2 text-left">
                            <div>
                              {transaction.paymentReference ? (
                                <h4 className="flex space-x-3">
                                  <span className="font-mono font-bold uppercase">
                                    {transaction.paymentReference}
                                  </span>
                                  <span
                                    className={`rounded-full py-0.5 text-xs px-2 ${
                                      STATUS_BG_COLOR[transaction.paymentStatus]
                                    }`}
                                  >
                                    {STATUS_CODES[transaction.paymentStatus]}
                                  </span>
                                </h4>
                              ) : (
                                <h4 className="text-lg font-bold text-gray-300">
                                  -
                                </h4>
                              )}
                              <p className="font-mono text-xs text-gray-400 lowercase">
                                {transaction.transactionId}
                              </p>
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: transaction.currency,
                            }).format(transaction.amount)}
                          </td>
                          <td className="p-2 space-x-2 text-xs text-center">
                            {transaction.paymentStatus !==
                              TransactionStatus.S && (
                              <button
                                className="px-3 py-1 text-white rounded bg-amber-600"
                                onClick={renew}
                              >
                                Renew
                              </button>
                            )}
                            {/* <button
                            className="px-3 py-1 text-white rounded bg-cyan-600"
                            onClick={renew}
                          >
                            View
                          </button> */}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>No records found...</td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td className="px-3 py-1 text-center" colSpan={5}>
                        Fetching records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </Content.Container>
      <input
        type="file"
        accept="text/csv"
        hidden
        ref={inputFileRef}
        onChange={handleImportFile}
      />
    </AdminLayout>
  );
};

export default Transactions;
