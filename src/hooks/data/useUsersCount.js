import useSWR from 'swr';

const useUsersCount = (startDate, endDate) => {
  const apiRoute = `/api/users/count?startDate=${startDate}&endDate=${endDate}`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useUsersCount;
