import useSWR from 'swr';

const useStudentsCount = () => {
  const apiRoute = `/api/students/count`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useStudentsCount;
