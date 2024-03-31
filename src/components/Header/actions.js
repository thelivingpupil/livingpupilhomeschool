import { Fragment, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useWorkspaces } from '@/hooks/data/index';
import { useWorkspace } from '@/providers/workspace';

const Actions = ({ show }) => {
  const { data, isLoading } = useWorkspaces();
  const { workspace, setWorkspace } = useWorkspace();
  const router = useRouter();

  const handleWorkspaceChange = (workspace) => {
    setWorkspace(workspace);
    router.replace(`/account/${workspace?.slug}`);
  };


  return (
    <div className="flex flex-col items-stretch justify-center space-y-3 mr-2">
      <Listbox value={workspace} onChange={handleWorkspaceChange}>
        <div className="relative tourSelect">
          <Listbox.Button className="relative w-64 py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default">
            <span className="block text-gray-600 truncate">
              {isLoading
                ? 'Fetching students...'
                : data?.workspaces.length === 0
                ? 'No records found'
                : workspace === null
                ? 'Select a student record...'
                : workspace.name}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <SelectorIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          {data?.workspaces.length > 0 && (
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute w-full py-1 pl-2 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60">
                {data?.workspaces.map((workspace, index) => (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      `${active ? 'text-white bg-primary-200' : 'text-gray-800'}
                          cursor-pointer select-none relative py-2`
                    }
                    value={workspace}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`${
                            selected ? 'font-bold' : 'font-normal'
                          } block truncate`}
                        >
                          {workspace.name}
                        </span>
                        {selected ? (
                          <span
                            className={`${
                              active ? 'text-white' : 'text-primary-600'
                            }
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                          >
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          )}
        </div>
      </Listbox>
    </div>
  );
};

export default Actions;
