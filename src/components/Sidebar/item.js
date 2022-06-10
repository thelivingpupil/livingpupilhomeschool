import { ExternalLinkIcon } from '@heroicons/react/outline';
import Link from 'next/link';

const Item = ({ data, isLoading }) => {
  return isLoading ? (
    <div className="h-6 mb-3 bg-gray-600 rounded animate-pulse" />
  ) : (
    <li className="flex flex-row items-center">
      {data.icon && <data.icon className="w-5 h-5 mr-5 text-white" />}
      <Link href={data.path}>
        <a
          className="text-gray-300 hover:text-white"
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
