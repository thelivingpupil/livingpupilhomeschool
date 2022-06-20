import useSWR from 'swr';

const useStudentsByGradeLevel = () => {
  const apiRoute = `/api/students/grade-level`;
  const { data, error } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useStudentsByGradeLevel;
