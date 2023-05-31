import useSWR from 'swr';

const useStudentsCount = (startDate, endDate) => {
  const apiRoute = `/api/students/count?startDate=${startDate}&endDate=${endDate}`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useStudentsCount;
