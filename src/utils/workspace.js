import { TransactionStatus } from '@prisma/client';

export const hasPaidSchoolFees = (workspace) =>
  workspace?.schoolFees?.some(
    (fee) =>
      fee.deletedAt == null &&
      fee.transaction?.deletedAt == null &&
      fee.transaction?.paymentStatus === TransactionStatus.S
  );
