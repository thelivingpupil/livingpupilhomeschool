import useSWR from 'swr';

const useUsersCount = (startDate, endDate) => {
  const apiRoute =
    startDate && endDate
      ? `/api/users/count?startDate=${startDate}&endDate=${endDate}`
      : `/api/users/count`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useUsersCount;
