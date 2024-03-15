import { useState } from 'react';
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import {
  BadgeCheckIcon,
  LightningBoltIcon,
  UserIcon,
} from '@heroicons/react/solid';
import { UserType } from '@prisma/client';
import formatDistance from 'date-fns/formatDistance';
import Image from 'next/image';
import Link from 'next/link';
import {Button } from '@mui/material';
import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import { useUsers } from '@/hooks/data';
import toast from 'react-hot-toast';

const Users = () => {
  const { data, isLoading } = useUsers();
  const [showModal, setModalVisibility] = useState(false);
  const [isSubmitting, setSubmittingState] = useState(false);
  const toggleModal = () => setModalVisibility(!showModal);

  const myFunction = () => (console.log(data));


  myFunction();

  function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  );
}

  const openMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const deactivateAccount = async (userId) => {
  try {
    setSubmittingState(true);

    const response = await fetch('/api/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to deactivate account');
    }

    setSubmittingState(false);
    toast.success('Account has been deactivated!');
  } catch (error) {
    setSubmittingState(false);
    toast.error(`Error deactivating account: ${error.message}`);
  }
};


const reactivateAccount = async (userId) => {
  try {
    setSubmittingState(true);

    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to reactivate account');
    }

    setSubmittingState(false);
    toast.success('Account has been reactivated!');
  } catch (error) {
    setSubmittingState(false);
    toast.error(`Error reactivating account: ${error.message}`);
  }
};


  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Users" />
      <SideModal show={showModal} toggle={toggleModal} />
      <Content.Title
        title="Users List"
        subtitle="View and manage all user details and related data"
      />
      <Card>
        <Card.Body title="List of Account Users" b>
          <div>
            <Link href="/account/admin/users/users-export">
              <a className="items-center px-3 py-2 space-x-2 text-sm text-white rounded bg-primary-500 hover:bg-primary-600">
                Generate Users Master List
              </a>
            </Link>
          </div> 
          <div>
            {/* <table className="w-full">
              <thead>
                <tr className="bg-gray-200 border-t border-b border-t-gray-300 border-b-gray-300">
                  <th className="p-2 font-medium text-left">Name</th>
                  <th className="p-2 font-medium text-center">Joined</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading ? (
                  data ? (
                    data.users.map((user, index) => (
                      <tr
                        key={index}
                        className="text-sm border-t border-b hover:bg-gray-100 border-b-gray-300"
                      >
                        <td className="flex p-2 space-x-3 text-left">
                          <div className="relative flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-300 rounded-full">
                            {user.image ? (
                              <Image
                                alt={user.name}
                                layout="fill"
                                loading="lazy"
                                objectFit="contain"
                                src={user.image}
                              />
                            ) : (
                              <UserIcon className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="flex items-center text-xl font-medium capitalize text-primary-500">
                              <span>{`${user.name || '-'}`}</span>
                              {user.userType === UserType.ADMIN && (
                                <span className="flex items-center justify-center w-4 h-4 ml-1 bg-red-600 rounded-full">
                                  <LightningBoltIcon className="w-3 h-3 text-white" />
                                </span>
                              )}
                              {user.emailVerified && (
                                <span className="ml-1">
                                  <BadgeCheckIcon className="w-5 h-5 text-green-600" />
                                </span>
                              )}
                            </h4>
                            <h5 className="flex items-center font-bold">
                              <span className="text-xs">{user.email}</span>
                            </h5>
                          </div>
                        </td>
                        <td className="p-2 space-x-3 text-xs text-center">
                          {user.createdAt
                            ? formatDistance(
                                new Date(user.createdAt),
                                new Date(),
                                {
                                  addSuffix: true,
                                }
                              )
                            : 'Invited'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2}>No records found...</td>
                    </tr>
                  )
                ) : (
                  <tr>
                    <td className="px-3 py-1 text-center" colSpan={2}>
                      Fetching records
                    </td>
                  </tr>
                )}
              </tbody>
            </table> */}
                  
            <DataGrid
            autoHeight
            rows={data ? data.users : []}
            columns={[
              
              {
                field: 'name',
                headerName: 'Name',
                flex: 1,
                renderCell: (params) => (
                  <div className="flex items-center space-x-3 text-left p-1">
                    <div className="relative flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-300 rounded-full">
                      {params.row.image ? (
                        <Image
                          alt={params.row.name}
                          layout="fill"
                          loading="lazy"
                          objectFit="contain"
                          src={params.row.image}
                        />
                      ) : (
                        <UserIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="flex items-center text-s capitalize text-primary-500">
                        <span>{`${params.row.name || '-'}`}</span>
                        {params.row.userType === UserType.ADMIN && (
                          <span className="flex items-center justify-center w-4 h-4 ml-1 bg-red-600 rounded-full">
                            <LightningBoltIcon className="w-3 h-3 text-white" />
                          </span>
                        )}
                        {params.row.emailVerified && (
                          <span className="ml-1">
                            <BadgeCheckIcon className="w-5 h-5 text-green-600" />
                          </span>
                        )}
                      </h4>
                      <h5 className="flex items-center font-bold">
                        <span className="text-xs">{params.row.email}</span>
                      </h5>
                    </div>
                  </div>
                ),
              },
              {
                field: 'createdAt',
                headerName: 'Joined',
                flex: 1,
                headerAlign: 'center',
                align: 'center',
                renderCell: (params) => (
                  <span className="text-xs text-center">
                    {params.row.createdAt
                      ? formatDistance(
                          new Date(params.row.createdAt),
                          new Date(),
                          {
                            addSuffix: true,
                          }
                        )
                      : 'Invited'}
                  </span>
                ),
              },
              {
                field: 'deletedAt',
                headerName: 'Status',
                flex: 1,
                headerAlign: 'center',
                align: 'center',
                renderCell: (params) => (
                  <div>
                    {params.row.deletedAt !== null ? (
                      <span className="text-xs text-center">
                        Deactivated
                      </span>
                    ) : (
                      <span className="text-xs text-center ">
                        Active
                      </span>
                    )}
                  </div>
                  
                ),
              },
              {
                field: 'actions',
                headerName: 'Actions',
                flex: 1,
                headerAlign: 'center',
                align: 'center',
                hide: true,
                renderCell: (params) => (
                  <div>
                    {params.row.deletedAt !== null ? (
                      <button
                        className="px-3 py-1 text-white rounded bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          reactivateAccount(params.row.id);
                        }}
                      >
                        Reactivate
                      </button>
                      // <Button onClick={() => reactivateAccount(params.row.id)}>
                      //   Reactivate
                      // </Button>
                    ) : (
                      <button
                        className="px-3 py-1 text-white rounded bg-red-600 hover:bg-red-700"
                        onClick={() => {
                          deactivateAccount(params.row.id);
                        }}
                      >
                        Deactivate
                      </button>
                      // <Button onClick={() => deactivateAccount(params.row.id)}>
                      //   Deactivate
                      // </Button>
                    )}
                  </div>
              ),
              },
            ]}
            loading={isLoading}
            pageSize={10}
            slots={{ toolbar: CustomToolbar }}
            density="comfortable"
            disableSelectionOnClick
          />

          


          </div>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default Users;
