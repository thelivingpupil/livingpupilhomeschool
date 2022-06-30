import useSWR from 'swr';

const usePurchases = () => {
  const apiRoute = `/api/transactions/purchases`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default usePurchases;
