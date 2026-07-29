import useSWR from 'swr';

const useUsers = () => {
  const apiRoute = `/api/users`;
  const { data, error, mutate } = useSWR(`${apiRoute}`);
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export default useUsers;
