import { useState } from 'react';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import {
  BadgeCheckIcon,
  LightningBoltIcon,
  UserIcon,
} from '@heroicons/react/solid';
import { UserType } from '@prisma/client';
import formatDistance from 'date-fns/formatDistance';
import Image from 'next/image';
import Link from 'next/link';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import { useUsers } from '@/hooks/data';
import api from '@/lib/common/api';
import toast from 'react-hot-toast';

const Users = () => {
  const { data, isLoading, mutate } = useUsers();
  const [showModal, setModalVisibility] = useState(false);
  const [isSubmitting, setSubmittingState] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuUser, setMenuUser] = useState(null);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
      </GridToolbarContainer>
    );
  }

  const openActionsMenu = (event, user) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  // menuUser is kept on close so the menu labels stay put while the closing
  // animation plays; opening another row overwrites it.
  const closeActionsMenu = () => setMenuAnchorEl(null);

  const isMenuOpenFor = (userId) =>
    Boolean(menuAnchorEl) && menuUser?.id === userId;

  const openEmailModal = (user) => {
    setEditingUser(user);
    setNewEmail(user.email || '');
    setModalVisibility(true);
  };

  const closeEmailModal = () => {
    setModalVisibility(false);
    setEditingUser(null);
    setNewEmail('');
  };

  const updateEmail = async () => {
    const email = newEmail.trim().toLowerCase();

    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    if (email === (editingUser?.email || '').toLowerCase()) {
      toast.error('The new email address is the same as the current one');
      return;
    }

    if (
      !window.confirm(
        `Change the account email of ${
          editingUser?.name || editingUser?.email
        } to ${email}? They will need to sign in again using the new address.`
      )
    ) {
      return;
    }

    setSubmittingState(true);

    try {
      const response = await api('/api/admin/users/email', {
        method: 'PUT',
        body: { userId: editingUser.id, email },
      });

      if (response.status >= 400) {
        throw new Error(
          response.errors?.error?.msg || 'Failed to update email address'
        );
      }

      toast.success('Account email has been updated!');
      await mutate();
      closeEmailModal();
    } catch (error) {
      toast.error(error.message || 'Failed to update email address');
    } finally {
      setSubmittingState(false);
    }
  };

  const deactivateAccount = async (user) => {
    if (
      !window.confirm(
        `Deactivate the account of ${
          user.name || user.email
        }? They will no longer be able to use it.`
      )
    ) {
      return;
    }

    setSubmittingState(true);

    try {
      const response = await api('/api/users', {
        method: 'DELETE',
        body: { userId: user.id },
      });

      if (response.status >= 400) {
        throw new Error(
          response.errors?.error?.msg || 'Failed to deactivate account'
        );
      }

      toast.success('Account has been deactivated!');
      await mutate();
    } catch (error) {
      toast.error(`Error deactivating account: ${error.message}`);
    } finally {
      setSubmittingState(false);
    }
  };

  const reactivateAccount = async (user) => {
    if (
      !window.confirm(`Reactivate the account of ${user.name || user.email}?`)
    ) {
      return;
    }

    setSubmittingState(true);

    try {
      const response = await api('/api/users', {
        method: 'PUT',
        body: { userId: user.id },
      });

      if (response.status >= 400) {
        throw new Error(
          response.errors?.error?.msg || 'Failed to reactivate account'
        );
      }

      toast.success('Account has been reactivated!');
      await mutate();
    } catch (error) {
      toast.error(`Error reactivating account: ${error.message}`);
    } finally {
      setSubmittingState(false);
    }
  };

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Users" />
      <SideModal
        title="Update Account Email"
        show={showModal}
        toggle={closeEmailModal}
      >
        <div className="space-y-4">
          <div className="p-3 text-sm bg-gray-100 rounded">
            <p className="font-medium capitalize">
              {editingUser?.name || 'Unnamed user'}
            </p>
            <p className="text-xs text-gray-600">
              Current email: {editingUser?.email || '-'}
            </p>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">New Email Address *</label>
            <input
              type="email"
              className="px-3 py-2 border rounded"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="parent@example.com"
            />
          </div>

          <div className="p-3 text-xs text-yellow-900 bg-yellow-50 border border-yellow-200 rounded space-y-1">
            <p className="font-medium">Please take note:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                This is the address the account signs in with. The user will be
                signed out and must log in again using the new email.
              </li>
              <li>
                Workspace memberships, invites, and payment records are moved to
                the new address automatically.
              </li>
              <li>
                The account will be marked as unverified until the user signs in
                with the new email.
              </li>
              <li>
                A notification is sent to both the old and the new email
                address.
              </li>
            </ul>
          </div>

          <div className="flex justify-end pt-2 space-x-2">
            <button
              type="button"
              className="px-4 py-2 border rounded"
              onClick={closeEmailModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-white rounded bg-primary-500 hover:bg-primary-600 disabled:opacity-50"
              onClick={updateEmail}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Email'}
            </button>
          </div>
        </div>
      </SideModal>
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
                      </div>
                    </div>
                  ),
                },
                {
                  field: 'email',
                  headerName: 'Email',
                  flex: 1,
                  headerAlign: 'center',
                  align: 'center',
                  renderCell: (params) => (
                    <div className="inline-flex items-center justify-center">
                      <span className="text-xs text-center">
                        <h5 className="flex items-center font-bold">
                          <span className="text-xs">{params.row.email}</span>
                        </h5>
                      </span>
                    </div>
                  ),
                },
                {
                  field: 'createdAt',
                  headerName: 'Joined',
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
                  headerAlign: 'center',
                  align: 'center',
                  renderCell: (params) => (
                    <div>
                      {params.row.deletedAt !== null ? (
                        <span className="text-xs text-center">Deactivated</span>
                      ) : (
                        <span className="text-xs text-center ">Active</span>
                      )}
                    </div>
                  ),
                },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  width: 80,
                  headerAlign: 'center',
                  align: 'center',
                  sortable: false,
                  filterable: false,
                  renderCell: (params) => (
                    <IconButton
                      size="small"
                      aria-label="User actions"
                      aria-controls={
                        isMenuOpenFor(params.row.id)
                          ? 'user-actions-menu'
                          : undefined
                      }
                      aria-haspopup="true"
                      aria-expanded={
                        isMenuOpenFor(params.row.id) ? 'true' : undefined
                      }
                      onClick={(event) => openActionsMenu(event, params.row)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
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

      <Menu
        id="user-actions-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeActionsMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            const user = menuUser;
            closeActionsMenu();
            if (user) openEmailModal(user);
          }}
        >
          Change Email
        </MenuItem>
        {menuUser?.deletedAt ? (
          <MenuItem
            onClick={() => {
              const user = menuUser;
              closeActionsMenu();
              if (user) reactivateAccount(user);
            }}
          >
            Reactivate
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              const user = menuUser;
              closeActionsMenu();
              if (user) deactivateAccount(user);
            }}
          >
            Deactivate
          </MenuItem>
        )}
      </Menu>
    </AdminLayout>
  );
};

export default Users;
