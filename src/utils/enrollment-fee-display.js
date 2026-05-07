/**
 * Fee summary numbers aligned with `src/pages/account/enrollment.js` (display parity).
 */

export function formatEnrollmentPhp(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(amount) || 0);
}

export function getEnrollmentFeeLineAmount(fee) {
  if (!fee) return 0;
  return (
    (fee._type === 'fullTermPayment' ? fee.fullPayment : fee.downPayment) || 0
  );
}

/** Amount shown on the Discount row (negative when a discount applies). */
export function getDiscountDisplayNumber(fee, discount) {
  if (!discount || !fee) return 0;
  if (discount.type === 'VALUE') {
    if (discount?.code?.toLowerCase().includes('pastor')) {
      return (
        (Math.ceil(
          fee?._type === 'fullTermPayment'
            ? fee?.fullPayment
            : fee?._type === 'threeTermPayment'
              ? fee?.downPayment +
                fee?.secondPayment +
                fee?.thirdPayment
              : fee?._type === 'fourTermPayment'
                ? fee?.downPayment +
                  fee?.secondPayment +
                  fee?.thirdPayment +
                  fee?.fourthPayment
                : fee?.downPayment +
                  fee?.secondPayment +
                  fee?.thirdPayment +
                  fee?.fourthPayment +
                  fee?.fifthPayment +
                  fee?.sixthPayment +
                  fee?.seventhPayment +
                  fee?.eighthPayment +
                  fee?.ninthPayment
        ) -
          discount.value) *
        -1
      );
    }
    return Number(discount.value) * -1;
  }
  return (
    Math.ceil(
      fee?._type === 'fullTermPayment'
        ? fee?.fullPayment
        : fee?._type === 'threeTermPayment'
          ? fee?.downPayment +
            fee?.secondPayment +
            fee?.thirdPayment
          : fee?._type === 'fourTermPayment'
            ? fee?.downPayment +
              fee?.secondPayment +
              fee?.thirdPayment +
              fee?.fourthPayment
            : fee?.downPayment +
              fee?.secondPayment +
              fee?.thirdPayment +
              fee?.fourthPayment +
              fee?.fifthPayment +
              fee?.sixthPayment +
              fee?.seventhPayment +
              fee?.eighthPayment +
              fee?.ninthPayment
    ) *
    (discount.value / 100) *
    -1
  );
}

/** Bottom-line Initial Fee / Total Payable (before checkbox). */
export function getInitialFeeTotalNumber(fee, discount, paymentMethod, feesMap) {
  if (!fee) return feesMap[paymentMethod] || 0;
  return (
    (fee?._type === 'fullTermPayment'
      ? fee?.fullPayment -
        (discount
          ? discount?.type === 'VALUE'
            ? discount?.code?.toLowerCase().includes('pastor')
              ? Math.ceil(
                  fee?._type === 'fullTermPayment'
                    ? fee?.fullPayment
                    : fee?._type === 'threeTermPayment'
                      ? fee?.downPayment +
                        fee?.secondPayment +
                        fee?.thirdPayment
                      : fee?._type === 'fourTermPayment'
                        ? fee?.downPayment +
                          fee?.secondPayment +
                          fee?.thirdPayment +
                          fee?.fourthPayment
                        : fee?.downPayment +
                          fee?.secondPayment +
                          fee?.thirdPayment +
                          fee?.fourthPayment +
                          fee?.fifthPayment +
                          fee?.sixthPayment +
                          fee?.seventhPayment +
                          fee?.eighthPayment +
                          fee?.ninthPayment
                ) - discount.value
              : discount.value
            : (discount.value / 100) * fee?.fullPayment
          : 0)
      : fee?.downPayment) +
      (feesMap[paymentMethod] || 0) +
      (fee?._type === 'fullTermPayment' ? 500 : 0) || 0
  );
}

/** Same field order as `payments` in `src/pages/account/enrollment.js` (index 1 = 2nd installment). */
export const FEE_SCHEDULE_KEYS = [
  'downPayment',
  'secondPayment',
  'thirdPayment',
  'fourthPayment',
  'fifthPayment',
  'sixthPayment',
  'seventhPayment',
  'eighthPayment',
  'ninthPayment',
];

function tuitionSumUncapped(fee) {
  if (!fee) return 0;
  if (fee._type === 'fullTermPayment') return fee.fullPayment || 0;
  if (fee._type === 'threeTermPayment') {
    return (
      (fee.downPayment || 0) +
      (fee.secondPayment || 0) +
      (fee.thirdPayment || 0)
    );
  }
  if (fee._type === 'fourTermPayment') {
    return (
      (fee.downPayment || 0) +
      (fee.secondPayment || 0) +
      (fee.thirdPayment || 0) +
      (fee.fourthPayment || 0)
    );
  }
  return (
    (fee.downPayment || 0) +
    (fee.secondPayment || 0) +
    (fee.thirdPayment || 0) +
    (fee.fourthPayment || 0) +
    (fee.fifthPayment || 0) +
    (fee.sixthPayment || 0) +
    (fee.seventhPayment || 0) +
    (fee.eighthPayment || 0) +
    (fee.ninthPayment || 0)
  );
}

/**
 * Grand total line from enrollment review modal (`Total School Fees`),
 * including misc ₱500, per-term gateway fees, and discount.
 */
export function getTotalSchoolFeesNumber(
  fee,
  discount,
  paymentMethod,
  monthIndex,
  feesMap
) {
  if (!fee) return 0;
  const gw = feesMap[paymentMethod] || 0;
  const gatewayBundle =
    fee._type === 'fullTermPayment'
      ? gw
      : fee._type === 'threeTermPayment'
        ? gw * 3
        : fee._type === 'fourTermPayment'
          ? gw * 4
          : fee._type === 'nineTermPayment'
            ? gw * ((monthIndex ?? 0) + 1)
            : gw;

  const discountPart = discount
    ? discount.type === 'VALUE'
      ? discount.code?.toLowerCase().includes('pastor')
        ? Math.ceil(tuitionSumUncapped(fee)) - discount.value
        : discount.value
      : (discount.value / 100) * tuitionSumUncapped(fee)
    : 0;

  return (
    Math.ceil(tuitionSumUncapped(fee)) +
      500 +
      gatewayBundle -
      discountPart || 0
  );
}
