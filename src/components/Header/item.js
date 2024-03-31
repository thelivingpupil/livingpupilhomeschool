import { ExternalLinkIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Item = ({ data, isLoading }) => {
  const router = useRouter();

  return isLoading ? (
    <div className="h-6 mb-3 bg-gray-600 rounded animate-pulse" />
  ) : (
    <li className={`pl-1 flex flex-row items-center ${data.className || ''}`}>
      {data.icon && <data.icon className="w-5 h-5 mr-5 text-white" />}
      <Link href={data.path}>
        <a
          className={`hover:text-gray-500 ${
            router.pathname === data.path
              ? 'text-secondary-900 underline underline-offset-2'
              : 'text-gray-900'
          }`}
          target={data.isExternal ? '_blank' : '_self'}
        >
          {data.name}
        </a>
      </Link>
      {data.isExternal && (
        <ExternalLinkIcon className="w-3 h-3 ml-2 text-gray-200" />
      )}
    </li>
  );
};

Item.defaultProps = {
  data: null,
  isLoading: false,
};

export default Item;
