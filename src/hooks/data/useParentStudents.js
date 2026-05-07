import useSWR from 'swr';

/** Mirrors useWorkspaces: API returns { data: { students } }; spread matches SWR shape. */
const useParentStudents = () => {
  const { data, error, mutate } = useSWR('/api/account/students');
  return {
    ...data,
    mutate,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useParentStudents;
