import { useMemo, useState } from 'react';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Image from 'next/image';
import format from 'date-fns/format';
import toast from 'react-hot-toast';

import { AdminLayout } from '@/layouts/index';
import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import CenteredModal from '@/components/Modal/centered-modal';
import { useShopOrdersV2 } from '@/hooks/data';
import api from '@/lib/common/api';
import { STATUS_CODES } from '@/lib/server/dragonpay';
import { SHOP_PAYMENT_TYPE } from '@/providers/cart';
import {
  ORDER_STATUS,
  ORDER_STATUS_BG_COLOR,
  SHOP_SHIPPING_TYPE,
  STATUS_BG_COLOR,
} from '@/utils/constants';
import {
  getOrderFeeDeadline,
  getOrderFeeDeadlineWithDelivery,
} from '@/utils/index';

const ORDER_STATUSES = [
  'ORDER_PLACED',
  'PROCESSING',
  'SHIPPED',
  'COMPLETED',
];

const V2_TO_LEGACY_STATUS = {
  ORDER_PLACED: 'Order_Placed',
  PROCESSING: 'Processing',
  SHIPPED: 'For_Delivery',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const legacyOrderStatus = (status) =>
  V2_TO_LEGACY_STATUS[status] || 'Order_Placed';

const orderStatusBadge = (order) => {
  if (order?.cancelRequestedAt && order?.status !== 'CANCELLED') {
    return {
      label: 'Cancel requested',
      className: 'bg-amber-600 text-white',
    };
  }
  const legacy = legacyOrderStatus(order?.status);
  return {
    label: ORDER_STATUS[legacy] || legacy,
    className: ORDER_STATUS_BG_COLOR[legacy] || 'bg-gray-600 text-white',
  };
};

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(value || 0));

const paymentLabel = (fee, fees, paymentType) => {
  if (paymentType === 'FULL_PAYMENT') {
    return 'Full Payment';
  }
  if (fees.length === 6 && fee.installment === 0) {
    return 'Delivery Fee';
  }
  if (fees.length === 6) {
    return `Payment #${fee.installment}`;
  }
  return `Payment #${fee.installment + 1}`;
};

const feeDueDateLabel = (fee, fees, paymentType, dateOrdered) => {
  if (!dateOrdered) return '';

  try {
    if (fees.length === 6) {
      if (fee.installment === 0) return '';
      return getOrderFeeDeadlineWithDelivery(
        fee.installment,
        paymentType,
        dateOrdered
      ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    return getOrderFeeDeadline(
      fee.installment,
      paymentType,
      dateOrdered
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

const ShopOrdersAdmin = () => {
  const { data, isLoading, mutate } = useShopOrdersV2();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuOrder, setMenuOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [statusOrder, setStatusOrder] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);
  const [isReviewingCancel, setIsReviewingCancel] = useState(false);
  const [isPrintingInvoice, setIsPrintingInvoice] = useState(false);

  const orderHasSuccessfulPayment = (order) =>
    (order?.orderFees || []).some(
      (fee) => fee.transaction?.paymentStatus === 'S'
    );

  const handlePrintInvoice = async (order) => {
    if (!order?.orderCode) return;
    setIsPrintingInvoice(true);
    try {
      const response = await fetch(
        `/api/admin/shop/invoice?orderCode=${encodeURIComponent(
          order.orderCode
        )}`
      );
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.errors?.error?.msg || 'Failed to download invoice'
        );
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${order.orderCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message || 'Failed to download invoice');
    } finally {
      setIsPrintingInvoice(false);
    }
  };

  const rows = useMemo(
    () =>
      data?.orders?.map((order) => ({
        id: order.orderId,
        ...order,
        userLabel:
          order.user?.guardianInformation?.primaryGuardianName ||
          order.user?.name ||
          order.user?.email ||
          order.userId,
        shippingLabel:
          SHOP_SHIPPING_TYPE[order.shippingType] || order.shippingType || '—',
        statusLabel: orderStatusBadge(order).label,
        statusBadge: orderStatusBadge(order),
        itemCount: (order.orderItems || []).reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        ),
      })) || [],
    [data?.orders]
  );

  const booksTotal = useMemo(() => {
    if (!viewOrder) return 0;
    return (viewOrder.orderItems || []).reduce(
      (sum, item) => sum + Number(item.totalPrice || 0),
      0
    );
  }, [viewOrder]);

  const deliveryFeeAmount = useMemo(() => {
    if (!viewOrder || viewOrder.shippingType === 'PICK_UP') return 0;
    const fees = viewOrder.orderFees || [];
    if (viewOrder.paymentType === 'INSTALLMENT' && fees.length === 6) {
      return Number(fees[0]?.transaction?.amount || 0);
    }
    if (viewOrder.paymentType === 'FULL_PAYMENT') {
      return Math.max(0, Number(viewOrder.total || 0) - booksTotal);
    }
    return Math.max(0, Number(viewOrder.total || 0) - booksTotal * 1.1);
  }, [viewOrder, booksTotal]);

  const openActionsMenu = (event, order) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuOrder(order);
  };

  const closeActionsMenu = () => {
    setMenuAnchorEl(null);
    setMenuOrder(null);
  };

  const refreshViewOrder = async () => {
    const refreshed = await mutate();
    const orders = refreshed?.data?.orders || refreshed?.orders || [];
    if (!viewOrder?.orderId) return;
    const next = orders.find((o) => o.orderId === viewOrder.orderId);
    if (next) {
      setViewOrder({
        ...next,
        userLabel:
          next.user?.guardianInformation?.primaryGuardianName ||
          next.user?.name ||
          next.user?.email ||
          next.userId,
        shippingLabel:
          SHOP_SHIPPING_TYPE[next.shippingType] || next.shippingType || '—',
      });
      if (selectedTransaction?.transactionId) {
        const fee = (next.orderFees || []).find(
          (f) =>
            f.transaction?.transactionId ===
            selectedTransaction.transactionId
        );
        if (fee?.transaction) {
          setSelectedTransaction(fee.transaction);
          setSelectedFee(fee);
        }
      }
    }
  };

  const handleCancel = async () => {
    if (!cancelOrder?.orderCode) return;
    setIsCancelling(true);
    try {
      const response = await api('/api/admin/shop/orders', {
        method: 'PATCH',
        body: { orderCode: cancelOrder.orderCode, action: 'cancel' },
      });
      if (response.errors) {
        throw new Error(response.errors?.error?.msg || 'Cancel failed');
      }
      toast.success(`Cancelled ${cancelOrder.orderCode}`);
      setCancelOrder(null);
      setViewOrder(null);
      mutate();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleApproveCancel = async (order) => {
    if (!order?.orderCode) return;
    setIsReviewingCancel(true);
    try {
      const response = await api('/api/admin/shop/orders', {
        method: 'PATCH',
        body: { orderCode: order.orderCode, action: 'approveCancel' },
      });
      if (response.errors) {
        throw new Error(response.errors?.error?.msg || 'Approve failed');
      }
      toast.success(`Approved cancel for ${order.orderCode}`);
      await refreshViewOrder();
      mutate();
    } catch (error) {
      toast.error(error.message || 'Failed to approve cancel');
    } finally {
      setIsReviewingCancel(false);
    }
  };

  const handleRejectCancel = async (order) => {
    if (!order?.orderCode) return;
    setIsReviewingCancel(true);
    try {
      const response = await api('/api/admin/shop/orders', {
        method: 'PATCH',
        body: { orderCode: order.orderCode, action: 'rejectCancel' },
      });
      if (response.errors) {
        throw new Error(response.errors?.error?.msg || 'Reject failed');
      }
      toast.success(`Rejected cancel request for ${order.orderCode}`);
      await refreshViewOrder();
      mutate();
    } catch (error) {
      toast.error(error.message || 'Failed to reject cancel');
    } finally {
      setIsReviewingCancel(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusOrder?.orderCode || !nextStatus) return;
    setIsUpdatingStatus(true);
    try {
      const response = await api('/api/admin/shop/orders', {
        method: 'PATCH',
        body: {
          orderCode: statusOrder.orderCode,
          action: 'updateStatus',
          status: nextStatus,
        },
      });
      if (response.errors) {
        throw new Error(response.errors?.error?.msg || 'Update failed');
      }
      toast.success(`Updated ${statusOrder.orderCode} to ${nextStatus}`);
      setStatusOrder(null);
      setNextStatus('');
      await refreshViewOrder();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const viewPaymentDetails = (transaction, fee) => {
    setSelectedTransaction(transaction);
    setSelectedFee(fee);
    setShowPaymentDetails(true);
  };

  const togglePaymentDetailsModal = () => {
    setShowPaymentDetails((open) => !open);
    if (showPaymentDetails) {
      setSelectedTransaction(null);
      setSelectedFee(null);
    }
  };

  const updatePaymentStatus = async () => {
    if (!selectedTransaction?.transactionId) return;
    setIsUpdatingPaymentStatus(true);
    try {
      const response = await api('/api/admin/shop/orders', {
        method: 'PATCH',
        body: {
          action: 'markPaid',
          transactionId: selectedTransaction.transactionId,
        },
      });
      if (response.errors) {
        throw new Error(response.errors?.error?.msg || 'Mark paid failed');
      }
      toast.success(
        selectedFee?.installment === 0
          ? 'Marked as paid — reserved inventory committed'
          : 'Payment status updated successfully'
      );
      await refreshViewOrder();
    } catch (error) {
      toast.error(error.message || 'Failed to update payment status');
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    );
  }

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Shop Orders" />
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Order V2 shop checkouts (reserve / commit / release inventory).
      </Typography>

      <Box sx={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={rows}
          loading={isLoading}
          slots={{ toolbar: CustomToolbar }}
          columns={[
            {
              field: 'orderCode',
              headerName: 'Order Code',
              width: 150,
            },
            {
              field: 'userLabel',
              headerName: 'Customer',
              flex: 1,
              minWidth: 180,
            },
            {
              field: 'total',
              headerName: 'Total',
              width: 110,
              valueFormatter: (value) =>
                value != null
                  ? `₱${Number(value).toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                    })}`
                  : '—',
            },
            {
              field: 'paymentType',
              headerName: 'Payment',
              width: 130,
              valueFormatter: (value) => SHOP_PAYMENT_TYPE[value] || value,
            },
            {
              field: 'shippingLabel',
              headerName: 'Shipping',
              width: 150,
            },
            {
              field: 'statusLabel',
              headerName: 'Status',
              width: 170,
              renderCell: (params) => {
                const badge = params.row.statusBadge || orderStatusBadge(params.row);
                return (
                  <span
                    className={`rounded-full py-0.5 px-2 text-xs font-semibold ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                );
              },
            },
            {
              field: 'itemCount',
              headerName: 'Items',
              width: 80,
            },
            {
              field: 'createdAt',
              headerName: 'Created',
              width: 170,
              valueFormatter: (value) =>
                value ? format(new Date(value), 'MMM d, yyyy h:mm a') : '—',
            },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 90,
              sortable: false,
              filterable: false,
              renderCell: (params) => (
                <IconButton
                  size="small"
                  aria-label="Order actions"
                  aria-controls={
                    menuAnchorEl ? 'shop-order-actions-menu' : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={menuAnchorEl ? 'true' : undefined}
                  onClick={(event) => openActionsMenu(event, params.row)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              ),
            },
          ]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      <Menu
        id="shop-order-actions-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeActionsMenu}
      >
        <MenuItem
          onClick={() => {
            setViewOrder(menuOrder);
            closeActionsMenu();
          }}
        >
          View
        </MenuItem>
        <MenuItem
          disabled={menuOrder?.status === 'CANCELLED'}
          onClick={() => {
            setStatusOrder(menuOrder);
            setNextStatus(
              menuOrder?.status === 'ORDER_PLACED'
                ? 'PROCESSING'
                : menuOrder?.status || ''
            );
            closeActionsMenu();
          }}
        >
          Update status
        </MenuItem>
        {menuOrder?.cancelRequestedAt &&
          menuOrder?.status !== 'CANCELLED' && (
            <>
              <MenuItem
                disabled={isReviewingCancel}
                onClick={() => {
                  handleApproveCancel(menuOrder);
                  closeActionsMenu();
                }}
              >
                Approve cancel
              </MenuItem>
              <MenuItem
                disabled={isReviewingCancel}
                onClick={() => {
                  handleRejectCancel(menuOrder);
                  closeActionsMenu();
                }}
              >
                Reject cancel
              </MenuItem>
            </>
          )}
        <MenuItem
          disabled={menuOrder?.status === 'CANCELLED'}
          onClick={() => {
            setCancelOrder(menuOrder);
            closeActionsMenu();
          }}
        >
          Cancel
        </MenuItem>
      </Menu>

      <SideModal
        show={Boolean(viewOrder)}
        toggle={() => setViewOrder(null)}
        title={viewOrder?.orderCode || 'Order'}
      >
        {viewOrder && (
          <div className="space-y-5">
            <div className="flex flex-col space-y-1">
              <h5 className="font-medium">
                Purchased by:{' '}
                <span className="text-xs text-gray-400">
                  {viewOrder.user?.guardianInformation?.primaryGuardianName ||
                    viewOrder.user?.name ||
                    '—'}{' '}
                  - {viewOrder.user?.email || 'No email available'}
                </span>
              </h5>
              <h5 className="font-medium">
                Delivery Address:{' '}
                <span className="text-xs text-gray-400">
                  {viewOrder.deliveryAddress || '—'}
                </span>
              </h5>
              <h5 className="font-medium">
                Shipping Type:{' '}
                <span className="text-xs text-gray-400">
                  {SHOP_SHIPPING_TYPE[viewOrder.shippingType] ||
                    viewOrder.shippingType ||
                    '—'}
                </span>
              </h5>
              <h5 className="font-medium">
                Contact Information:{' '}
                <span className="text-xs text-gray-400">
                  {viewOrder.contactNumber || 'Not provided by guardian'}
                </span>
              </h5>
              <h5 className="flex flex-wrap items-center gap-2 font-medium">
                Order Status:{' '}
                {(() => {
                  const badge = orderStatusBadge(viewOrder);
                  return (
                    <span
                      className={`rounded-full py-0.5 px-2 text-xs font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  );
                })()}
              </h5>
              {viewOrder.cancelRequestedAt &&
                viewOrder.status !== 'CANCELLED' && (
                  <div className="p-3 mt-2 space-y-2 rounded bg-amber-50">
                    <h5 className="font-medium text-amber-800">
                      Cancellation request
                    </h5>
                    <p className="text-sm text-amber-900">
                      <span className="font-medium">Reason:</span>{' '}
                      {viewOrder.cancelReason || '—'}
                    </p>
                    <p className="text-xs text-amber-700">
                      Requested{' '}
                      {format(
                        new Date(viewOrder.cancelRequestedAt),
                        'MMM d, yyyy h:mm a'
                      )}
                    </p>
                    <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                      <button
                        type="button"
                        className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-500 disabled:opacity-50"
                        disabled={isReviewingCancel}
                        onClick={() => handleApproveCancel(viewOrder)}
                      >
                        {isReviewingCancel
                          ? 'Working...'
                          : 'Approve cancel'}
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50"
                        disabled={isReviewingCancel}
                        onClick={() => handleRejectCancel(viewOrder)}
                      >
                        Reject cancel
                      </button>
                    </div>
                  </div>
                )}
            </div>

            <div className="flex flex-col space-y-3">
              <h4 className="text-xl font-medium text-primary-500">
                Ordered {(viewOrder.orderItems || []).length} Item(s)
              </h4>
              {(viewOrder.orderItems || []).map((item) => (
                <div
                  key={item.orderItemId}
                  className="flex items-center p-3 space-x-3 border rounded"
                >
                  <div className="relative w-1/4 h-20">
                    <Image
                      alt={item.name}
                      layout="fill"
                      loading="lazy"
                      objectFit="contain"
                      src={
                        item.image || '/images/livingpupil-homeschool-logo.png'
                      }
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary-500">
                      {item.name} (x{item.quantity})
                    </h3>
                    <p className="text-xs">Price: {money(item.basePrice)}</p>
                    <p className="text-xs font-bold">
                      Subtotal: {money(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-2 border-gray-600" />

            <div className="flex items-center justify-between">
              <h4 className="font-medium text-left">Payment Type</h4>
              <h5 className="font-bold text-right">
                {SHOP_PAYMENT_TYPE[viewOrder.paymentType] ||
                  viewOrder.paymentType}
              </h5>
            </div>

            {viewOrder.paymentType === 'INSTALLMENT' ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-left">Books/Merch</h4>
                  <h5 className="font-bold text-right text-green-600">
                    {money(booksTotal)}
                  </h5>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-left">Interest (10%)</h4>
                  <h5 className="font-bold text-right text-green-600">
                    {money(booksTotal * 0.1)}
                  </h5>
                </div>
                {deliveryFeeAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-left">Delivery Fee</h4>
                    <h5 className="font-bold text-right text-green-600">
                      {money(deliveryFeeAmount)}
                    </h5>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-left">Books/Merch</h4>
                  <h5 className="font-bold text-right text-green-600">
                    {money(booksTotal)}
                  </h5>
                </div>
                {deliveryFeeAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-left">Delivery Fee</h4>
                    <h5 className="font-bold text-right text-green-600">
                      {money(deliveryFeeAmount)}
                    </h5>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center justify-between">
              <h4 className="font-medium text-left">Order Total</h4>
              <h5 className="font-bold text-right text-green-600">
                {money(viewOrder.total)}
              </h5>
            </div>

            <div className="flex flex-col w-full space-y-4">
              <hr className="border-gray-600 border-dashed border-1" />
              {(viewOrder.orderFees || []).map((fee) => {
                const fees = viewOrder.orderFees || [];
                const label = paymentLabel(
                  fee,
                  fees,
                  viewOrder.paymentType
                );
                const dueDate = feeDueDateLabel(
                  fee,
                  fees,
                  viewOrder.paymentType,
                  fee.createdAt || viewOrder.createdAt
                );
                return (
                  <div key={fee.orderFeeId}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start">
                        <h6 className="text-sm font-bold text-gray-400">
                          {label}
                        </h6>
                        <h6 className="text-sm font-bold text-green-600">
                          {money(fee.transaction?.amount)}
                        </h6>
                        {dueDate ? (
                          <h6 className="text-sm font-bold text-gray-400">
                            {dueDate}
                          </h6>
                        ) : null}
                      </div>
                      {viewOrder.status !== 'CANCELLED' ? (
                        <button
                          type="button"
                          onClick={() =>
                            viewPaymentDetails(fee.transaction, fee)
                          }
                          className="px-3 py-1 text-xs text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
                        >
                          View Payment Details
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="px-3 py-1 text-xs text-white bg-red-600 rounded"
                        >
                          Cancelled
                        </button>
                      )}
                    </div>
                    <hr className="mt-4 border-gray-600 border-dashed border-1" />
                  </div>
                );
              })}

              <div className="flex flex-col p-3 space-y-2">
                {orderHasSuccessfulPayment(viewOrder) && (
                  <button
                    type="button"
                    className="px-3 py-1 my-1 text-white bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50"
                    disabled={isPrintingInvoice}
                    onClick={() => handlePrintInvoice(viewOrder)}
                  >
                    {isPrintingInvoice ? 'Preparing...' : 'Print invoice'}
                  </button>
                )}
                <button
                  type="button"
                  className="px-3 py-1 my-1 text-white rounded bg-primary-600 hover:bg-primary-400 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={viewOrder.status === 'CANCELLED'}
                  onClick={() => {
                    setStatusOrder(viewOrder);
                    setNextStatus(
                      viewOrder.status === 'ORDER_PLACED'
                        ? 'PROCESSING'
                        : viewOrder.status
                    );
                  }}
                >
                  Update Order Status
                </button>
                {viewOrder.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    className="px-3 py-1 my-1 text-white bg-red-600 rounded hover:bg-red-400"
                    onClick={() => setCancelOrder(viewOrder)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </SideModal>

      {selectedTransaction && (
        <CenteredModal
          show={showPaymentDetails}
          toggle={togglePaymentDetailsModal}
          title="Payment Details"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-50">
              <h4 className="mb-2 font-semibold text-gray-800">
                Transaction Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">Transaction ID:</span>
                  <span className="font-mono text-right break-all">
                    {selectedTransaction.transactionId}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="font-medium">Reference Number:</span>
                  <span className="font-mono text-right break-all">
                    {selectedTransaction.referenceNumber || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-bold text-green-600">
                    {money(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Payment Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      STATUS_BG_COLOR[selectedTransaction.paymentStatus] ||
                      'bg-gray-400'
                    }`}
                  >
                    {STATUS_CODES[selectedTransaction.paymentStatus] ||
                      selectedTransaction.paymentStatus ||
                      '—'}
                  </span>
                </div>
              </div>
            </div>

            {selectedTransaction.paymentProofLink ? (
              <div className="p-4 rounded-lg bg-green-50">
                <h4 className="mb-2 font-semibold text-green-800">
                  Payment Proof
                </h4>
                <div className="space-y-3">
                  <div className="relative w-full h-64">
                    <Image
                      src={selectedTransaction.paymentProofLink}
                      alt="Payment Proof"
                      layout="fill"
                      objectFit="contain"
                      className="border rounded"
                    />
                  </div>
                  <a
                    href={selectedTransaction.paymentProofLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 text-white transition-colors bg-green-600 rounded hover:bg-green-700"
                  >
                    View Full Size
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-yellow-50">
                <h4 className="mb-2 font-semibold text-yellow-800">
                  Payment Proof
                </h4>
                <p className="text-sm text-yellow-700">
                  No payment proof uploaded yet.
                </p>
              </div>
            )}

            {selectedTransaction.paymentStatus !== 'S' &&
            viewOrder?.status !== 'CANCELLED' ? (
              <div className="p-4 rounded-lg bg-blue-50">
                <h4 className="mb-2 font-semibold text-blue-800">
                  Update Payment Status
                </h4>
                <p className="mb-3 text-sm text-blue-700">
                  Mark this payment as successful after verifying the payment
                  proof
                  {selectedFee?.installment === 0
                    ? '. This will also commit reserved inventory.'
                    : '.'}
                </p>
                <button
                  type="button"
                  onClick={updatePaymentStatus}
                  disabled={isUpdatingPaymentStatus}
                  className="w-full px-4 py-2 text-white transition-colors bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingPaymentStatus ? 'Updating...' : 'Mark as Paid'}
                </button>
              </div>
            ) : null}

            {selectedTransaction.paymentStatus === 'S' ? (
              <div className="p-4 rounded-lg bg-green-50">
                <h4 className="mb-2 font-semibold text-green-800">
                  Payment Status
                </h4>
                <p className="text-sm text-green-700">
                  This payment has been marked as successful.
                </p>
              </div>
            ) : null}
          </div>
        </CenteredModal>
      )}

      <CenteredModal
        show={Boolean(cancelOrder)}
        toggle={() => !isCancelling && setCancelOrder(null)}
        title="Cancel order"
      >
        <p className="mb-4 text-sm">
          Cancel <b>{cancelOrder?.orderCode}</b>? Reserved inventory will be
          released if not yet committed.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-3 py-1 border rounded"
            disabled={isCancelling}
            onClick={() => setCancelOrder(null)}
          >
            Keep
          </button>
          <button
            type="button"
            className="px-3 py-1 text-white bg-red-600 rounded disabled:opacity-50"
            disabled={isCancelling}
            onClick={handleCancel}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel order'}
          </button>
        </div>
      </CenteredModal>

      <CenteredModal
        show={Boolean(statusOrder)}
        toggle={() => !isUpdatingStatus && setStatusOrder(null)}
        title="Update order status"
      >
        <p className="flex flex-wrap items-center gap-2 mb-2 text-sm">
          Order <b>{statusOrder?.orderCode}</b> (current:{' '}
          {statusOrder ? (
            <span
              className={`rounded-full py-0.5 px-2 text-xs font-semibold ${
                orderStatusBadge(statusOrder).className
              }`}
            >
              {orderStatusBadge(statusOrder).label}
            </span>
          ) : null}
          )
        </p>
        <select
          className="w-full px-3 py-2 mb-4 border rounded"
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value)}
        >
          <option value="">Select status</option>
          {ORDER_STATUSES.map((status) => {
            const legacy = legacyOrderStatus(status);
            return (
              <option key={status} value={status}>
                {ORDER_STATUS[legacy] || status}
              </option>
            );
          })}
        </select>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-3 py-1 border rounded"
            disabled={isUpdatingStatus}
            onClick={() => setStatusOrder(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-3 py-1 text-white rounded bg-secondary-500 disabled:opacity-50"
            disabled={isUpdatingStatus || !nextStatus}
            onClick={handleUpdateStatus}
          >
            {isUpdatingStatus ? 'Saving...' : 'Save'}
          </button>
        </div>
      </CenteredModal>
    </AdminLayout>
  );
};

export default ShopOrdersAdmin;
