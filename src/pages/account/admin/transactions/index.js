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
import { useTransactions, useSchoolFees } from '@/hooks/data';
import { STATUS_CODES } from '@/lib/server/dragonpay';
import { PaymentType, TransactionStatus } from '@prisma/client';
import {
  ACCREDITATION,
  GRADE_LEVEL,
  PAYMENT_TYPE,
  PROGRAM,
  STATUS_BG_COLOR,
  STATUS,
  COTTAGE_TYPE,
} from '@/utils/constants';
import Modal from '@/components/Modal';
import CenteredModal from '@/components/Modal/centered-modal';
import toast from 'react-hot-toast';
import { getDeadline } from '@/utils/index';

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
  const { data: schoolFeesData, isLoading: isSchoolFeesDataLoading } =
    useSchoolFees(); //the schoolFeesData is an alias so it won't conflict with data
  const [showModal, setModalVisibility] = useState(false);
  const [showCenteredModal, setCenteredModalVisibility] = useState(false);
  const [showConfirmChange, setShowConfirmChange] = useState(false);
  const [isSubmitting, setSubmittingState] = useState(false);
  const [isUpdatingTransaction, setUpdatingTransaction] = useState(false);
  const [updateTransaction, setUpdateTransaction] = useState({
    transactionId: '',
    studentId: '',
    payment: '',
    amount: '',
    order: 0,
    balance: '',
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
    deadline: '',
    paymentProofLink: '',
  });
  const [newPayment, setNewPayment] = useState(0.0);
  const [filter, setFilter] = useState(['', '']);
  const [filterBy, filterValue] = filter;
  const [uploadCount, setUploadCount] = useState(0);
  const [totalUpload, setTotalUpload] = useState(0);
  const [newAmount, setNewAmount] = useState(0.0);
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [action, setAction] = useState('UPDATE');

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

  const toggleModal = () => {
    if (showModal) {
      setNewPaymentStatus('');
    }
    setModalVisibility((state) => !state);
  };

  const openUpdateModal = (transaction) => () => {
    const balance =
      transaction.balance !== null ? transaction.balance : transaction.amount;
    const initialPayment = getStudentInitialFee(
      transaction.schoolFee.student.studentRecord.studentId
    );
    console.log('Trasanction:', transaction);
    const deadline =
      initialPayment?.transaction?.paymentStatus === 'S'
        ? getDeadline(
            transaction.schoolFee.order,
            transaction.schoolFee.paymentType,
            initialPayment.transaction.updatedAt,
            transaction.schoolFee.student.studentRecord.schoolYear,
            'S'
          )
        : '-';
    setUpdateTransaction({
      ...updateTransaction,
      transactionId: transaction.transactionId,
      studentId: transaction.schoolFee.student.studentRecord.studentId,
      order: parseInt(transaction.schoolFee.order),
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
      amount: Number(transaction.amount).toFixed(2),
      payment: Number(transaction.payment).toFixed(2),
      balance: Number(balance).toFixed(2),
      paymentType: transaction.schoolFee.paymentType,
      currency: transaction.currency,
      deadline,
      paymentProofLink: transaction.paymentProofLink,
      paymentOrder:
        transaction.schoolFee.paymentType === PaymentType.ANNUAL
          ? 'Total Fee'
          : transaction.schoolFee.order === 0
          ? 'Initial Fee'
          : `Payment #${transaction.schoolFee.order}`,
    });

    setNewPaymentStatus('');
    setModalVisibility(true);
  };

  const getStudentInitialFee = (studentId) => {
    if (!schoolFeesData) return null; // Ensure data is loaded before accessing
    // Find the school fee with order 0 for the specified studentId
    return schoolFeesData.schoolFees.find(
      (fee) => fee.studentId === studentId && fee.order === 0
    );
  };

  const getDeadlineForAdmin = (studentId, order, paymentType, schoolYear) => {
    const initialPayment = getStudentInitialFee(studentId);

    if (!initialPayment || initialPayment.transaction.paymentStatus !== 'S') {
      return 'Unpaid Initial Fee';
    }

    return getDeadline(
      order,
      paymentType,
      initialPayment.transaction.updatedAt,
      schoolYear,
      initialPayment.transaction.paymentStatus
    );
  };

  const toggleCenteredModal = () => {
    setCenteredModalVisibility(!showCenteredModal);
  };

  const toggleConfirmChangeModal = () => {
    setShowConfirmChange(!showConfirmChange);
  };

  const handleYes = () => {
    handleUpdateTransaction();
    toggleCenteredModal();
  };

  const handleConfirmChange = () => {
    changeAmount();
    toggleConfirmChangeModal();
  };

  const handleUpdatePaymentTransaction = (e) => {
    setNewPayment(Number(e.target.value).toFixed(2));
  };

  const handleNewAmount = (e) => {
    setNewAmount(Number(e.target.value).toFixed(2));
  };

  const handleUpdateStatus = () => {
    setUpdatingTransaction(true);
    api(`/api/admin/transactions/update-payment-status`, {
      body: {
        transactionId: updateTransaction.transactionId,
        paymentStatus: newPaymentStatus,
      },
      method: 'PUT',
    })
      .then(() => {
        setUpdatingTransaction(false);
        toast.success(
          `Successfully updated payment status for ${updateTransaction.name}`
        );
        setNewPaymentStatus('');
        toggleModal();
      })
      .catch(() => {
        setUpdatingTransaction(false);
        toast.error(
          `Error in updating payment status for ${updateTransaction.name}`
        );
      });
  };

  const handleApply = (e) => {
    const newBalance =
      parseFloat(updateTransaction.balance) - parseFloat(newPayment);
    const totalPaid =
      parseFloat(newPayment) + parseFloat(updateTransaction.payment);
    setUpdateTransaction({
      ...updateTransaction,
      balance: newBalance,
      payment: totalPaid,
    });
    setNewPayment(Number(0).toFixed(2));
  };

  const calculateBalanceForIteration = (amount) => {
    const newAmountForNextPayment =
      parseFloat(amount) + parseFloat(updateTransaction.balance);
    return newAmountForNextPayment;
  };

  const checkDeadline = () => {
    const currentDate = new Date();
    const deadline = new Date(updateTransaction.deadline); // change to

    if (currentDate > deadline && updateTransaction.balance > 0) {
      fetchSchoolFees(
        updateTransaction.studentId,
        updateTransaction.order + 1
      ).then((feeData) => {
        if (feeData[0]?.transactionId === undefined) {
          toggleCenteredModal();
        } else {
          const transactionId = feeData[0].transactionId;
          const amount = calculateBalanceForIteration(
            feeData[0].transaction.amount
          );
          handleIterateTransaction(transactionId, amount, 0, amount, 'P'); // update next transaction
          const prevAmount = updateTransaction.payment; // for previous transaction
          const balance = 0; // for previous transaction
          const totalPaid = updateTransaction.payment; // for previous transaction
          handleIterateTransaction(
            updateTransaction.transactionId,
            prevAmount,
            totalPaid,
            balance,
            'S'
          ); // update previous transaction
        }
      });
    } else {
      handleUpdateTransaction();
    }
  };

  const changeAmount = () => {
    setUpdatingTransaction(true);
    const payment = updateTransaction.payment;
    api(`/api/transactions/${updateTransaction.transactionId}`, {
      body: {
        newAmount,
        payment,
      },
      method: 'PATCH',
    })
      .then(() => {
        setUpdatingTransaction(false);
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
    setNewAmount(0.0);
    toggleModal();
  };

  const handleIterateTransaction = (
    transactionId,
    amount,
    totalPaid,
    balance,
    status
  ) => {
    setUpdatingTransaction(true);
    api(`/api/transactions/${transactionId}`, {
      body: {
        balance: balance,
        payment: totalPaid,
        amount: amount,
        status: status,
      },
      method: 'PUT',
    })
      .then(() => {
        setUpdatingTransaction(false);
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
    toggleModal();
  };

  const fetchSchoolFees = async (studentId, order) => {
    try {
      const queryString = `?studentId=${studentId}&order=${order}`;
      const response = await fetch(`/api/transactions/fees${queryString}`);

      if (!response.ok) {
        throw new Error('Failed to fetch school fees');
      }
      const feeData = await response.json();
      return feeData;
    } catch (error) {
      console.error('Error fetching school fees:', error.message);
      throw error;
    }
  };

  const handleUpdateTransaction = () => {
    setUpdatingTransaction(true);
    let status;
    if (updateTransaction.balance === 0) {
      status = TransactionStatus.S; // Set status to S if payment is zero
    } else if (updateTransaction.balance > 0) {
      status = TransactionStatus.P; // Set status to P if payment is greater than zero
    } else {
      // If payment is less than zero, display a toast and do not proceed with the update
      toast.error(`Payment is greater than amount`);
      return;
    }
    api(`/api/transactions/${updateTransaction.transactionId}`, {
      body: {
        balance: updateTransaction.balance,
        payment: updateTransaction.payment,
        status: status,
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

  const remainingPayments =
    filterBy === 'emailAccount' &&
    filterTransactions
      .filter(
        (transaction) => transaction.paymentStatus !== TransactionStatus.S
      )
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

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
        {/* Transaction Details */}
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
          {updateTransaction.paymentProofLink && (
            <p className="text-xs text-gray-400">
              Payment Proof:{' '}
              <a
                href={updateTransaction.paymentProofLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-600 underline"
              >
                View Proof of Payment
              </a>
            </p>
          )}
        </div>

        <div className="flex flex-col py-4">
          <p className="font-medium py-2 text-primary-500 text-xl">
            {PAYMENT_TYPE[updateTransaction.paymentType]}
          </p>
          <p className="font-medium py-2 text-secondary-500 text-xl">
            {updateTransaction.paymentOrder}
          </p>
          {/* Action Select */}
          <div className="flex flex-col md:flex-row mb-5 md:space-x-5 mt-4">
            <div className="relative inline-block w-full lg:w-1/2 rounded border">
              <select
                className="w-full px-3 py-2 capitalize rounded appearance-none"
                onChange={(e) => setAction(e.target.value)}
                value={action}
              >
                <option value="CHANGE">Change Amount</option>
                <option value="UPDATE">Update Payment</option>
                <option value="UPDATE_STATUS">Update Status</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDownIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
          {/* Update Payment */}
          {action === 'UPDATE' && (
            <>
              <div className="w-full grid grid-cols-[auto_1fr] gap-2 my-2 p-2 border border-primary-500 rounded shadow">
                <div className="flex capitalize font-semibold text-lg">
                  Status:
                </div>
                <div className="flex">
                  <span
                    className={`px-6 py-0.5 rounded-full flex items-center ${
                      STATUS_BG_COLOR[updateTransaction.paymentStatus]
                    }`}
                  >{`${STATUS[updateTransaction.paymentStatus]}`}</span>
                </div>
                <div className="flex py-2 capitalize font-semibold text-lg">
                  Payment:
                </div>
                <div className="flex">
                  <input
                    className="px-3 py-2 border rounded truncate w-full"
                    type="number"
                    value={Number(newPayment).toFixed(2)}
                    onChange={handleUpdatePaymentTransaction}
                  />
                </div>
                <div className="flex py-2 capitalize font-semibold text-lg">
                  Balance:
                </div>
                <div className="flex">
                  <input
                    className="px-3 py-2 border rounded truncate w-full"
                    type="text"
                    value={Number(updateTransaction.balance).toFixed(2)}
                    disabled
                    // onChange={handleUpdatePaymentTransaction}
                  />
                </div>
                <div className="flex py-2 capitalize font-semibold text-lg">
                  Total Paid:
                </div>
                <div className="flex">
                  <input
                    className="px-3 py-2 border rounded truncate w-full"
                    type="text"
                    value={Number(updateTransaction.payment).toFixed(2)}
                    disabled
                    // onChange={handleUpdatePaymentTransaction}
                  />
                </div>
                <div></div>
                {/* <button
              className="px-3 py-1 text-white text-base text-center rounded bg-gray-500 hover:bg-gray-400 disabled:opacity-25"
              disabled={isUpdatingTransaction}
              //onClick={console.log(updateTransaction.studentId)}
              onClick={handleUndo}
            >
              Undo
            </button>  */}
                <button
                  className="px-3 py-1 text-white text-base text-center rounded bg-blue-500 hover:bg-blue-400 disabled:opacity-25"
                  disabled={isUpdatingTransaction}
                  onClick={handleApply}
                >
                  Apply
                </button>
              </div>
              <div className="w-full flex justify-end">
                <button
                  className="px-3 py-1 text-white text-base text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
                  disabled={isUpdatingTransaction}
                  onClick={checkDeadline}
                >
                  Update Transaction
                </button>
              </div>
            </>
          )}
          {/* Change Amount */}
          {action === 'CHANGE' && (
            <>
              <div className="w-full grid grid-cols-[auto_1fr] gap-2 my-2 p-2 border border-primary-500 rounded shadow">
                <div className="flex capitalize font-semibold text-lg">
                  Status:
                </div>
                <div className="flex">
                  <span
                    className={`px-6 py-0.5 rounded-full flex items-center ${
                      STATUS_BG_COLOR[updateTransaction.paymentStatus]
                    }`}
                  >{`${STATUS[updateTransaction.paymentStatus]}`}</span>
                </div>
                <div className="flex py-2 capitalize font-semibold text-lg">
                  Amount:
                </div>
                <div className="flex">
                  <input
                    className="px-3 py-2 border rounded truncate w-full"
                    type="text"
                    value={Number(updateTransaction.amount).toFixed(2)}
                    disabled
                    // onChange={handleUpdatePaymentTransaction}
                  />
                </div>
                <div className="flex items-center py-2 capitalize font-semibold text-lg">
                  New Amount:
                </div>
                <div className="flex">
                  <input
                    className="px-3 py-2 border rounded truncate w-full"
                    type="number"
                    value={Number(newAmount).toFixed(2)}
                    onChange={handleNewAmount}
                  />
                </div>
              </div>
              <div className="w-full flex justify-end">
                <button
                  className="px-3 py-1 text-white text-base text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
                  disabled={isUpdatingTransaction}
                  onClick={toggleConfirmChangeModal}
                >
                  Update Transaction
                </button>
              </div>
            </>
          )}

          {/* Update Status */}
          {action === 'UPDATE_STATUS' && (
            <>
              <div className="w-full grid grid-cols-[auto_1fr] gap-2 my-2 p-2 border border-primary-500 rounded shadow">
                <div className="flex capitalize font-semibold text-lg">
                  Current Status:
                </div>
                <div className="flex">
                  <span
                    className={`px-6 py-0.5 rounded-full flex items-center  ${
                      STATUS_BG_COLOR[updateTransaction.paymentStatus]
                    }`}
                  >{`${STATUS[updateTransaction.paymentStatus]}`}</span>
                </div>
                <div className="flex py-2 capitalize font-semibold text-lg">
                  New Status:
                </div>
                <div className="flex">
                  <select
                    className="px-3 py-2 border rounded truncate  w-full"
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    value={newPaymentStatus}
                  >
                    <option value="">Select Status</option>
                    {Object.entries(STATUS).map(([value, name]) => (
                      <option key={value} value={value}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="w-full flex justify-end">
                <button
                  className="px-3 py-1 text-white text-base text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
                  disabled={isUpdatingTransaction || !newPaymentStatus}
                  onClick={handleUpdateStatus}
                >
                  Update Status
                </button>
              </div>
            </>
          )}
        </div>
      </SideModal>
      <CenteredModal
        show={showConfirmChange}
        toggle={toggleConfirmChangeModal}
        title="Confirm Changes"
      >
        <div>
          <p className="py-1">
            You are about to change the amount <b>{updateTransaction.name}'s</b>{' '}
            school fee.
          </p>
          <p>
            <b>Transaction ID: {updateTransaction.transactionId}</b>
          </p>
          <p>
            <b>Amount: ₱{updateTransaction.amount}</b>
          </p>
          <p>
            <b>New Amount:₱{newAmount} </b>
          </p>
          <p className="mt-5">
            Please note that the changes may not be undone.
          </p>
          <p className="mt-5">Do you wish to proceed?</p>
        </div>
        <div className="w-full flex justify-end">
          <button
            className="px-3 py-1 text-white text-base text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
            disabled={isUpdatingTransaction}
            onClick={handleConfirmChange}
            style={{ marginRight: '0.5rem' }}
          >
            Yes
          </button>
          <button
            className="px-3 py-1 text-white text-base text-center rounded bg-gray-500 hover:bg-gray-400 disabled:opacity-25"
            disabled={isUpdatingTransaction}
            onClick={toggleConfirmChangeModal}
          >
            No
          </button>
        </div>
      </CenteredModal>
      <CenteredModal
        show={showCenteredModal}
        toggle={toggleCenteredModal}
        title="Final Transaction Overdue"
      >
        <div>
          <p>
            This transaction is the final payment. Update this transaction
            instead?
          </p>
        </div>
        <div className="w-full flex justify-end">
          <button
            className="px-3 py-1 text-white text-base text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
            disabled={isUpdatingTransaction}
            onClick={handleYes}
            style={{ marginRight: '0.5rem' }}
          >
            Yes
          </button>
          <button
            className="px-3 py-1 text-white text-base text-center rounded bg-gray-500 hover:bg-gray-400 disabled:opacity-25"
            disabled={isUpdatingTransaction}
            onClick={toggleCenteredModal}
          >
            No
          </button>
        </div>
      </CenteredModal>
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
                    <th className="p-2 font-medium text-center">
                      Manual Payment
                    </th>
                    <th className="p-2 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading || !isSchoolFeesDataLoading ? (
                    data ? (
                      filterTransactions.map((transaction, index) => (
                        <tr
                          key={index}
                          className="text-sm border-t border-b hover:bg-gray-100 border-b-gray-300"
                        >
                          <td className="p-2 text-left">
                            <div>
                              <h4 className="flex items-center space-x-3 text-xl font-medium capitalize text-primary-500">
                                <span>{`${transaction?.schoolFee?.student?.studentRecord?.firstName}`}</span>
                                <span className="px-2 py-0.5 text-xs bg-secondary-500 rounded-full">{`${
                                  GRADE_LEVEL[
                                    transaction.schoolFee.student.studentRecord
                                      ?.incomingGradeLevel
                                  ]
                                }`}</span>
                              </h4>
                              <h5 className="font-bold">
                                <span className="text-xs">
                                  {`${
                                    PROGRAM[
                                      transaction.schoolFee.student
                                        .studentRecord?.program
                                    ]
                                  }
                                  ${
                                    transaction.schoolFee.student.studentRecord
                                      ?.program === 'HOMESCHOOL_COTTAGE'
                                      ? ` (${
                                          COTTAGE_TYPE[
                                            transaction.schoolFee.student
                                              .studentRecord?.cottageType
                                          ]
                                        })`
                                      : ''
                                  } - 
                                  ${
                                    ACCREDITATION[
                                      transaction.schoolFee.student
                                        .studentRecord?.accreditation
                                    ]
                                  }
                                  `}
                                </span>
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
                              {transaction.schoolFee.student.studentRecord
                                ?.discount && (
                                <p className="text-xs font-semibold text-primary-500">
                                  Applied discount:{' '}
                                  {
                                    transaction.schoolFee.student.studentRecord
                                      .discount
                                  }
                                </p>
                              )}
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
                                  : transaction.schoolFee.order === 10
                                  ? ''
                                  : `Payment #${transaction.schoolFee.order}`}
                              </div>
                              <p className="text-xs font-semibold text-primary-500">
                                {transaction.schoolFee.order === 0 ||
                                transaction.schoolFee.order === 10
                                  ? ''
                                  : getDeadlineForAdmin(
                                      transaction.schoolFee?.student
                                        ?.studentRecord?.studentId,
                                      transaction.schoolFee.order,
                                      transaction.schoolFee.paymentType,
                                      //transaction.createdAt,
                                      transaction.schoolFee.student
                                        .studentRecord?.schoolYear
                                    ) || null}
                              </p>
                            </div>
                          </td>
                          <td className="p-2 text-left">
                            <div>
                              <h4 className="flex space-x-3">
                                {transaction.paymentReference ? (
                                  <span className="font-mono font-bold uppercase">
                                    {transaction.paymentReference}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">
                                    No Reference
                                  </span>
                                )}
                                <span
                                  className={`rounded-full py-0.5 text-xs px-2 ${
                                    STATUS_BG_COLOR[transaction.paymentStatus]
                                  }`}
                                >
                                  {STATUS_CODES[transaction.paymentStatus]}
                                </span>
                              </h4>
                              <p className="font-mono text-xs text-gray-400 lowercase">
                                {transaction.transactionId}
                              </p>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <div>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: transaction.currency,
                              }).format(transaction.amount)}
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <div>
                              {transaction.payment ? (
                                new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: transaction.currency,
                                }).format(transaction.payment)
                              ) : (
                                <h4 className="text-lg font-bold text-gray-300">
                                  -
                                </h4>
                              )}
                              {transaction.balance ? (
                                <p className="font-mono text-xs text-gray-400 lowercase">
                                  bal: {transaction.balance}
                                </p>
                              ) : (
                                <p className="font-mono text-xs text-gray-400 lowercase"></p>
                              )}
                            </div>
                          </td>
                          <td className="p-2 space-x-2 text-xs text-center">
                            <button
                              className="px-3 py-1 text-white rounded bg-cyan-600"
                              onClick={openUpdateModal(transaction)}
                            >
                              View Details
                            </button>
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
            {(remainingPayments && (
              <p className="text-lg font-semibold text-primary-500 py-5">
                Total remaining payment: {remainingPayments}
              </p>
            )) ||
              null}
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
