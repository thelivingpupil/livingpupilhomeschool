import useSWR from 'swr';

const useTransactionSales = (startDate, endDate) => {
  const apiRoute =
    startDate && endDate
      ? `/api/transactions/sales?startDate=${startDate}&endDate=${endDate}`
      : `/api/transactions/sales`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useTransactionSales;
