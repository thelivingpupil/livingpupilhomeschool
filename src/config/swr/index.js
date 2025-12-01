import fetcher from '@/lib/client/fetcher';

const handleOnError = (error) => {
  // Don't throw - let SWR handle the error state
  // This prevents unhandled runtime errors
  console.error('SWR Error:', error);
};

const swrConfig = () => ({
  fetcher,
  onError: handleOnError,
  refreshInterval: 1000,
  // Don't revalidate on error - let the component handle it
  shouldRetryOnError: false,
});

export default swrConfig;
