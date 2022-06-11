import useSWR from 'swr';

const useTransactions = () => {
  const apiRoute = `/api/transactions`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useTransactions;
