import useSWR from 'swr';

const useTransactionSales = () => {
  const apiRoute = `/api/transactions/sales`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useTransactionSales;
