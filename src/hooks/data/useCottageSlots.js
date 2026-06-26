import useSWR from 'swr';

const useCottageSlots = () => {
  const apiRoute = '/api/admin/cottage-slots';
  const { data, error, mutate } = useSWR(apiRoute);

  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export default useCottageSlots;
