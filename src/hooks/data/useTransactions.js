import useSWR from 'swr';

const useTransactions = (options = {}) => {
  const { page = 1, pageSize = 10, filterBy = null, filterValue = null } = options;

  // Build query string
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());
  if (filterBy) params.append('filterBy', filterBy);
  if (filterValue) params.append('filterValue', filterValue);

  const apiRoute = `/api/transactions?${params.toString()}`;
  const { data, error } = useSWR(apiRoute);

  // Extract data from nested structure: API returns { data: { transactions, pagination } }
  const transactions = data?.data?.transactions || [];
  const pagination = data?.data?.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 0 };

  return {
    transactions,
    pagination,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useTransactions;
