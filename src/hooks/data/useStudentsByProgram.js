import useSWR from 'swr';

const useStudentsByProgram = () => {
  const apiRoute = `/api/students/program`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useStudentsByProgram;
