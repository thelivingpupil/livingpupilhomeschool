import useSWR from 'swr';

const usePurchaseHistory = () => {
  const apiRoute = `/api/shop/purchases`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default usePurchaseHistory;
