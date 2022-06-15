import useSWR from 'swr';

const useStudents = () => {
  const apiRoute = `/api/students`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useStudents;
