import { useMemo, useRef, useState } from 'react';
import formatDistance from 'date-fns/formatDistance';
import api from '@/lib/common/api';
import { ChevronDownIcon } from '@heroicons/react/outline';

import Papa from 'papaparse';

import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import { useTransactions } from '@/hooks/data';
import { STATUS_CODES } from '@/lib/server/dragonpay';
import { PaymentType, TransactionStatus } from '@prisma/client';
import {
  ACCREDITATION,
  GRADE_LEVEL,
  PAYMENT_TYPE,
  PROGRAM,
  STATUS_BG_COLOR,
  STATUS,
} from '@/utils/constants';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';

const filterValueOptions = {
  paymentType: PAYMENT_TYPE,
  paymentStatus: STATUS,
};

const filterByOptions = {
  paymentType: 'Payment Term',
  paymentStatus: 'Transaction Status',
  emailAccount: 'Email Account',
};

const Transactions = () => {
  const { data, isLoading } = useTransactions();
  const [showModal, setModalVisibility] = useState(false);
  const [isSubmitting, setSubmittingState] = useState(false);
  const [isUpdatingTransaction, setUpdatingTransaction] = useState(false);
  const [updateTransaction, setUpdateTransaction] = useState({
    transactionId: '',
    payment: '',
    name: '',
    gradeLevel: '',
    program: '',
    accreditation: '',
    createdAt: '',
    updatedAt: '',
    guardianInformation: '',
    email: '',
    paymentStatus: '',
    paymentOrder: '',
    paymentType: '',
    currency: '',
  });
  const [filter, setFilter] = useState(['', '']);
  const [filterBy, filterValue] = filter;
  const [uploadCount, setUploadCount] = useState(0);
  const [totalUpload, setTotalUpload] = useState(0);

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
          user: { email },
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
          email,
        })
      )
      ?.filter((transaction) =>
        filterBy === 'emailAccount'
          ? transaction?.email
              ?.toLowerCase()
              .includes(filterValue.trim().toLowerCase())
          : transaction[filterBy] === filterValue
      )
      ?.map(({ id }) => id);

    return data?.transactions?.filter(({ transactionId }) =>
      filteredTransactionIds.includes(transactionId)
    );
  }, [data, filterBy, filterValue]);

  const inputFileRef = useRef();

  const toggleModal = () => setModalVisibility((state) => !state);

  const openUpdateModal = (transaction) => () => {
    setUpdateTransaction({
      ...updateTransaction,
      name: transaction.schoolFee.student.studentRecord.firstName,
      gradeLevel:
        transaction.schoolFee.student.studentRecord.incomingGradeLevel,
      program: transaction.schoolFee.student.studentRecord.program,
      accreditation: transaction.schoolFee.student.studentRecord.accreditation,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      guardianInformation: transaction.user.guardianInformation
        ? transaction.user.guardianInformation.primaryGuardianName
        : transaction.user.email,
      email: transaction.user.email,
      paymentStatus: transaction.paymentStatus,
      transactionId: transaction.transactionId,
      payment: transaction.amount,
      paymentType: transaction.schoolFee.paymentType,
      currency: transaction.currency,
      paymentOrder:
        transaction.schoolFee.paymentType === PaymentType.ANNUAL
          ? 'Total Fee'
          : transaction.schoolFee.order === 0
          ? 'Initial Fee'
          : `Payment #${transaction.schoolFee.order}`,
    });
    setModalVisibility(true);
  };

  const handleUpdatePaymentTransaction = (e) => {
    setUpdateTransaction({
      ...updateTransaction,
      payment: Number(e.target.value),
    });
  };

  const handleUpdateTransaction = () => {
    setUpdatingTransaction(true);
    api(`/api/transactions/${updateTransaction.transactionId}`, {
      body: {
        amount: updateTransaction.payment,
        status: TransactionStatus.S,
      },
      method: 'PUT',
    })
      .then(() => {
        setUpdatingTransaction(false);
        toggleModal();
        toast.success(
          `Successfully updated transaction for ${updateTransaction.name}`
        );
      })
      .catch(() => {
        setUpdatingTransaction(false);
        toast.error(
          `Error in updating transaction for ${updateTransaction.name}`
        );
      });
  };

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
      <SideModal
        show={showModal}
        toggle={toggleModal}
        title="Update Transaction"
      >
        <div>
          <h4 className="flex items-center space-x-3 text-xl font-medium capitalize text-primary-500">
            <span>{`${updateTransaction.name}`}</span>
            <span className="px-2 py-0.5 text-xs bg-secondary-500 rounded-full">{`${
              GRADE_LEVEL[updateTransaction.gradeLevel]
            }`}</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                STATUS_BG_COLOR[updateTransaction.paymentStatus]
              }`}
            >{`${STATUS[updateTransaction.paymentStatus]}`}</span>
          </h4>
          <h5 className="font-bold">
            <span className="text-xs">{`${
              PROGRAM[updateTransaction.program]
            } - ${ACCREDITATION[updateTransaction.accreditation]}`}</span>
          </h5>
          <p className="text-xs text-gray-400">
            Created {new Date(updateTransaction.createdAt).toDateString()} by:{' '}
            <strong>{updateTransaction.guardianInformation}</strong>
          </p>
          <p className="text-xs text-gray-400">
            Last Updated: {new Date(updateTransaction.updatedAt).toDateString()}
          </p>
        </div>
        <div className="flex flex-col py-4">
          <p className="font-medium py-2 text-primary-500 text-xl">
            {PAYMENT_TYPE[updateTransaction.paymentType]}
          </p>
          <p className="font-medium py-2 text-secondary-500 text-xl">
            {updateTransaction.paymentOrder}
          </p>
          <div className="grid grid-cols-2 gap-2 my-2 p-2 border border-primary-500 rounded shadow">
            <div className="flex capitalize font-semibold text-lg">Status</div>
            <div className="flex capitalize font-semibold text-lg">Amount</div>
            <div className="flex">
              <span
                className={`px-6 py-0.5 rounded-full flex items-center ${
                  STATUS_BG_COLOR[updateTransaction.paymentStatus]
                }`}
              >{`${STATUS[updateTransaction.paymentStatus]}`}</span>
            </div>
            <div className="flex">
              <input
                className="px-3 py-2 border rounded truncate"
                type="text"
                value={Number(updateTransaction.payment).toFixed(2)}
                onChange={handleUpdatePaymentTransaction}
              />
            </div>
          </div>
          <div className="w-full flex justify-end">
            <button
              className="px-3 py-1 text-white text-base text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
              disabled={isUpdatingTransaction}
              onClick={handleUpdateTransaction}
            >
              Update Transaction
            </button>
          </div>
        </div>
      </SideModal>
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
                {!!filterBy &&
                  (filterBy === 'emailAccount' ? (
                    <div className="flex flex-row md:w-1/4">
                      <input
                        className="w-full px-3 py-2 border rounded"
                        onChange={(e) => setFilter([filterBy, e.target.value])}
                        placeholder="Email Account"
                        value={filterValue}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-row md:w-1/4">
                      <div className="relative inline-block w-full rounded border">
                        <select
                          className="w-full px-3 py-2 capitalize rounded appearance-none"
                          onChange={(e) =>
                            setFilter([filterBy, e.target.value])
                          }
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
                  ))}
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
                      filterTransactions.map((transaction, index) => (
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
                              <p className="text-xs text-gray-400">
                                Last Updated:{' '}
                                {new Date(transaction.updatedAt).toDateString()}
                              </p>
                              <small>{transaction.user.email}</small>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex flex-col items-center">
                              <div className="flex">
                                {
                                  PAYMENT_TYPE[
                                    transaction.schoolFee.paymentType
                                  ]
                                }
                              </div>
                              <div className="flex text-sm text-gray-400 italic">
                                {transaction.schoolFee.paymentType ===
                                PaymentType.ANNUAL
                                  ? 'Total Fee'
                                  : transaction.schoolFee.order === 0
                                  ? 'Initial Fee'
                                  : `Payment #${transaction.schoolFee.order}`}
                              </div>
                            </div>
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
                                className="px-3 py-1 text-white rounded bg-cyan-600"
                                onClick={openUpdateModal(transaction)}
                              >
                                Update
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
