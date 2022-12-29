import useSWR from 'swr';

const useTransactions = () => {
  const apiRoute = `/api/transactions`;
  const { data, error } = useSWR(`${apiRoute}`);

  const sortedItems = data.sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return {
    ...sortedItems,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useTransactions;
