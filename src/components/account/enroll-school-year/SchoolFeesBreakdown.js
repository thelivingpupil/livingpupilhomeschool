import { InformationCircleIcon } from '@heroicons/react/outline';

import {
  FEE_SCHEDULE_KEYS,
  formatEnrollmentPhp,
  getDiscountDisplayNumber,
  getTotalSchoolFeesNumber,
} from '@/utils/enrollment-fee-display';

/**
 * Matches the “School Fees Breakdown” table in the main enrollment review modal
 * (`src/pages/account/enrollment.js`).
 */
const SchoolFeesBreakdown = ({
  fee,
  discount,
  discountCode,
  paymentMethod,
  monthlyPayment,
  monthIndex,
  feesMap,
}) => {
  if (!fee) return null;

  const gw = feesMap[paymentMethod] || 0;

  const installmentCount =
    fee?._type === 'fullTermPayment'
      ? 0
      : fee?._type === 'threeTermPayment'
        ? 2
        : fee?._type === 'fourTermPayment'
          ? 3
          : fee?._type === 'nineTermPayment'
            ? monthIndex ?? 0
            : 0;

  const rowLabel = (index) => {
    if (fee?._type === 'threeTermPayment') {
      return `Three (3) Term Payment #${index + 1}`;
    }
    if (fee?._type === 'fourTermPayment') {
      return `Four (4) Term Payment #${index + 1}`;
    }
    if (fee?._type === 'nineTermPayment') {
      return `Monthly Term Payment #${index + 1}`;
    }
    return `Payment #${index + 1}`;
  };

  const cellBaseAmount = (index) => {
    if (fee?._type === 'fullTermPayment') return 0;
    if (fee?._type === 'nineTermPayment') return monthlyPayment || 0;
    const key = FEE_SCHEDULE_KEYS[index + 1];
    return (fee && fee[key]) || 0;
  };

  const totalSchoolFees = getTotalSchoolFeesNumber(
    fee,
    discount,
    paymentMethod,
    monthIndex,
    feesMap
  );

  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="font-semibold text-gray-800">School Fees Breakdown</p>
        <table className="mt-3 w-full border border-gray-200 text-sm">
          <tbody>
            <tr>
              <td className="border border-gray-200 px-3 py-2">
                {fee?._type === 'fullTermPayment' ? 'Total Fee' : 'Initial Fee'}
              </td>
              <td className="border border-gray-200 px-3 py-2 text-right">
                {formatEnrollmentPhp(
                  (fee?._type === 'fullTermPayment'
                    ? fee?.fullPayment
                    : fee?.downPayment) + gw
                )}
              </td>
            </tr>
            {Array.from({ length: installmentCount }, (_, index) => (
              <tr key={index}>
                <td className="border border-gray-200 px-3 py-2">
                  {rowLabel(index)}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right">
                  {formatEnrollmentPhp(cellBaseAmount(index) + gw)}{' '}
                  {discount && discount?.code?.toLowerCase().includes('pastor') ? (
                    <span className="text-red-600">
                      (-
                      {formatEnrollmentPhp(
                        fee?._type === 'nineTermPayment'
                          ? monthlyPayment -
                              (discount?.value - fee?.downPayment) / 9
                          : fee &&
                              fee[FEE_SCHEDULE_KEYS[index + 1]] -
                                (discount?.value - fee?.downPayment) / 3
                      )}
                      )
                    </span>
                  ) : (
                    index === 0 &&
                    discount && (
                      <span className="text-red-600">
                        (-
                        {formatEnrollmentPhp(
                          discount?.type === 'VALUE'
                            ? discount?.value
                            : (discount?.value / 100) *
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
                                )
                        )}
                        )
                      </span>
                    )
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-gray-200 px-3 py-2">
                Miscellaneous:{' '}
              </td>
              <td className="border border-gray-200 px-3 py-2 text-right text-primary-600">
                {formatEnrollmentPhp(500)}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-3 py-2 align-top">
                <div className="font-medium">Total Discounts</div>
                <p className="mt-1 text-xs text-gray-500">
                  Based on applied discount code:{' '}
                  <strong className="text-green-600">
                    {discountCode || '-'}
                    {discount
                      ? ` (${Number(discount.value).toFixed(2)}${
                          discount.type === 'VALUE' ? 'Php' : '%'
                        })`
                      : ''}
                  </strong>
                </p>
                {discount && fee?._type !== 'fullTermPayment' && (
                  <p className="mt-2 text-xs font-semibold text-primary-600">
                    <strong>NOTE:</strong> Discount will be applied on the
                    second payment.
                  </p>
                )}
              </td>
              <td
                className={`border border-gray-200 px-3 py-2 text-right align-top ${
                  discount ? 'text-red-600' : ''
                }`}
              >
                {formatEnrollmentPhp(getDiscountDisplayNumber(fee, discount))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-base font-bold md:text-lg">
        Total School Fees:{' '}
        <span className="text-primary-600">
          {formatEnrollmentPhp(totalSchoolFees)}
        </span>
      </h4>

      <div className="flex items-center gap-3 rounded border-2 border-blue-600 bg-blue-50 px-3 py-3 text-xs text-blue-700">
        <InformationCircleIcon className="h-5 w-5 shrink-0" />
        <p>
          <strong>NOTE</strong>: Succeeding payments will always incur payment
          gateway fees per transaction.
        </p>
      </div>
    </div>
  );
};

export default SchoolFeesBreakdown;
