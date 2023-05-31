import useSWR from 'swr';

const useStudentsCount = (startDate, endDate) => {
  const apiRoute =
    startDate && endDate
      ? `/api/students/count?startDate=${startDate}&endDate=${endDate}`
      : `/api/students/count`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useStudentsCount;
