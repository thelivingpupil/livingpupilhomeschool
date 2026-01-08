import Item from './item';
import React, { useState } from 'react';
import { Listbox } from '@headlessui/react'; // Assuming you're using @headlessui for Listbox
import { SelectorIcon } from '@heroicons/react/solid';

const Menus = ({
  data,
  isLoading,
  menuCondition,
  showMenu,
  validate = false,
  workspace = null,
}) => {
  return showMenu ? (
    <div className="space-y-2 my-1">
      {/* <h5 className="text-sm font-bold text-secondary-500">{data.name}</h5> */}
      <div className="mr-2 relative tourSelect">
        <Listbox>
          <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default">
            <span className="block truncate">{data.name}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <SelectorIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto bg-white rounded-md shadow-lg max-h-60">
            {data.menuItems.map((entry, index) =>
              (entry.showDefault && (
                <Listbox.Option key={index} value={entry} disabled={isLoading || (typeof entry.validateItem === 'function' ? !entry.validateItem(validate, workspace) : false)}>

                  <Item
                    data={entry}
                    isLoading={isLoading}
                    className={`cursor-pointer select-none relative py-2 pl-10 pr-4`}
                  />

                </Listbox.Option>
              )) ||
                (menuCondition &&
                  typeof entry.validateItem === 'function' &&
                  entry.validateItem(validate, workspace)) ? (
                <Listbox.Option key={index} value={entry} disabled={isLoading || (typeof entry.validateItem === 'function' ? !entry.validateItem(validate, workspace) : false)}>
                  {({ active, selected }) => (
                    <Item
                      data={entry}
                      isLoading={isLoading}
                      className={`${active ? 'bg-secondary-100 text-secondary-900' : 'text-black'} cursor-default select-none relative py-2 pl-10 pr-4`}
                    />
                  )}
                </Listbox.Option>
              ) : null
            )}
          </Listbox.Options>
        </Listbox>
      </div>
    </div>
  ) : null;
};

Menus.defaultProps = {
  isLoading: false,
  showMenu: false,
};

export default Menus;
