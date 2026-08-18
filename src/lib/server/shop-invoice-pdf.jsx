import path from 'path';
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import { SHOP_SHIPPING_TYPE } from '@/utils/constants';

const SHOP_PAYMENT_TYPE = {
  FULL_PAYMENT: 'Full Payment',
  INSTALLMENT: 'Installment',
};

const EMAIL_IMG_DIR = path.join(process.cwd(), 'public/images/email-img');

// Helvetica (default @react-pdf font) cannot render ₱ — use ASCII "PHP".
const money = (value) =>
  `PHP ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const toNumber = (value) =>
  value && typeof value.toNumber === 'function'
    ? value.toNumber()
    : Number(value || 0);

export const buildInvoicePayload = (order) => {
  const items = (order.orderItems || []).map((item) => ({
    name: item.name,
    quantity: item.quantity,
    basePrice: toNumber(item.basePrice),
    totalPrice: toNumber(item.totalPrice),
  }));

  const booksTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const fees = order.orderFees || [];
  const orderTotal = toNumber(order.total);
  const isInstallment = order.paymentType === 'INSTALLMENT';
  const isPickup = order.shippingType === 'PICK_UP';

  let shippingFee = 0;
  let interest = 0;
  let grandTotal = orderTotal;

  if (isInstallment) {
    // Checkout stores order.total as books + shipping (no interest).
    // Customer pays books * 1.10 + shipping across installments.
    interest = booksTotal * 0.1;
    if (!isPickup && fees.length === 6) {
      shippingFee = toNumber(fees[0]?.transaction?.amount);
    } else if (!isPickup) {
      shippingFee = Math.max(0, orderTotal - booksTotal);
    }
    const feesSum = fees.reduce(
      (sum, fee) => sum + toNumber(fee.transaction?.amount),
      0
    );
    grandTotal =
      feesSum > 0 ? feesSum : booksTotal + interest + shippingFee;
  } else if (!isPickup) {
    shippingFee = Math.max(0, orderTotal - booksTotal);
    grandTotal = orderTotal;
  }

  const isPaid = (fees || []).some(
    (fee) => fee.transaction?.paymentStatus === 'S'
  );

  const customerName =
    order.user?.guardianInformation?.primaryGuardianName ||
    order.user?.name ||
    'Customer';

  return {
    orderCode: order.orderCode,
    orderDate: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '',
    customerName,
    customerEmail: order.user?.email || '',
    deliveryAddress: order.deliveryAddress || '—',
    contactNumber: order.contactNumber || '—',
    shippingType:
      SHOP_SHIPPING_TYPE[order.shippingType] || order.shippingType || '—',
    paymentType:
      SHOP_PAYMENT_TYPE[order.paymentType] ||
      String(order.paymentType || '').replace(/_/g, ' '),
    items,
    booksTotal,
    shippingFee,
    interest,
    isInstallment,
    grandTotal,
    isPaid,
  };
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 32,
    paddingHorizontal: 0,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827',
  },
  headerImage: {
    width: '100%',
    marginBottom: 16,
  },
  body: {
    paddingHorizontal: 36,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#2e3494',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    width: 110,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  metaValue: {
    flex: 1,
    color: '#111827',
  },
  paidBadge: {
    marginTop: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#2e3494',
  },
  table: {
    borderWidth: 1,
    borderColor: '#374151',
    borderStyle: 'solid',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tableRowLast: {
    flexDirection: 'row',
    borderBottomWidth: 0,
  },
  colItem: {
    width: '46%',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#374151',
  },
  colQty: {
    width: '12%',
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: '#374151',
  },
  colPrice: {
    width: '21%',
    textAlign: 'right',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#374151',
  },
  colTotal: {
    width: '21%',
    textAlign: 'right',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  headerText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#1e293b',
  },
  totalsBlock: {
    marginTop: 12,
    alignSelf: 'flex-end',
    width: '45%',
    borderWidth: 1,
    borderColor: '#374151',
    borderStyle: 'solid',
  },
  totalRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  totalRowLast: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    backgroundColor: '#eef2ff',
  },
  totalLabel: {
    width: '50%',
    color: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#374151',
  },
  totalValue: {
    width: '50%',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  grandTotalLabel: {
    width: '50%',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#2e3494',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#374151',
  },
  grandTotalValue: {
    width: '50%',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#2e3494',
    textAlign: 'right',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  footer: {
    marginTop: 28,
    paddingHorizontal: 36,
    alignItems: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  socialIcon: {
    width: 16,
    height: 16,
    marginHorizontal: 14,
  },
  footerLink: {
    fontSize: 10,
    color: '#2e3494',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 1.4,
  },
});

const InvoiceDocument = ({ payload }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image
        src={path.join(EMAIL_IMG_DIR, 'lp-email-header.jpg')}
        style={styles.headerImage}
      />

      <View style={styles.body}>
        <Text style={styles.title}>Invoice {payload.orderCode}</Text>

        {payload.isPaid ? <Text style={styles.paidBadge}>PAID</Text> : null}

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Order Date</Text>
          <Text style={styles.metaValue}>{payload.orderDate}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Customer</Text>
          <Text style={styles.metaValue}>{payload.customerName}</Text>
        </View>
        {payload.customerEmail ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Email</Text>
            <Text style={styles.metaValue}>{payload.customerEmail}</Text>
          </View>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Payment Type</Text>
          <Text style={styles.metaValue}>{payload.paymentType}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Shipping</Text>
          <Text style={styles.metaValue}>{payload.shippingType}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Delivery Address</Text>
          <Text style={styles.metaValue}>{payload.deliveryAddress}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Contact</Text>
          <Text style={styles.metaValue}>{payload.contactNumber}</Text>
        </View>

        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colItem, styles.headerText]}>Item</Text>
            <Text style={[styles.colQty, styles.headerText]}>Qty</Text>
            <Text style={[styles.colPrice, styles.headerText]}>Price</Text>
            <Text style={[styles.colTotal, styles.headerText]}>Subtotal</Text>
          </View>
          {payload.items.map((item, index) => {
            const isLast = index === payload.items.length - 1;
            return (
              <View
                key={`${item.name}-${index}`}
                style={isLast ? styles.tableRowLast : styles.tableRow}
              >
                <Text style={styles.colItem}>{item.name}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{money(item.basePrice)}</Text>
                <Text style={styles.colTotal}>{money(item.totalPrice)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Books/Merch</Text>
            <Text style={styles.totalValue}>{money(payload.booksTotal)}</Text>
          </View>
          {payload.isInstallment ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Interest (10%)</Text>
              <Text style={styles.totalValue}>{money(payload.interest)}</Text>
            </View>
          ) : null}
          {payload.shippingFee > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery Fee</Text>
              <Text style={styles.totalValue}>
                {money(payload.shippingFee)}
              </Text>
            </View>
          ) : null}
          <View style={styles.totalRowLast}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {money(payload.grandTotal)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.socialRow}>
          <Image
            src={path.join(EMAIL_IMG_DIR, 'facebook.png')}
            style={styles.socialIcon}
          />
          <Image
            src={path.join(EMAIL_IMG_DIR, 'instagram.png')}
            style={styles.socialIcon}
          />
          <Image
            src={path.join(EMAIL_IMG_DIR, 'youtube.png')}
            style={styles.socialIcon}
          />
        </View>
        <Text style={styles.footerLink}>www.livingpupilhomeschool.com</Text>
        <Text style={styles.footerText}>
          Living Pupil Homeschool, Lot 49, Sector 6, Greenview Subdivision
          Pagsabungan, Mandaue City, Cebu 6014
        </Text>
        <Text style={styles.footerText}>
          (032) 252 7568 • (+63) 917 1199 351 • info@livingpupilhomeschool.com
        </Text>
      </View>
    </Page>
  </Document>
);

export const renderInvoicePdf = async (orderOrPayload) => {
  const payload =
    orderOrPayload?.booksTotal != null && Array.isArray(orderOrPayload?.items)
      ? orderOrPayload
      : buildInvoicePayload(orderOrPayload);

  const buffer = await renderToBuffer(
    <InvoiceDocument payload={payload} />
  );
  return Buffer.from(buffer);
};
