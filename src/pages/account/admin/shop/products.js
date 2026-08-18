import { useState } from 'react';
import crypto from 'crypto';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import toast from 'react-hot-toast';

import { AdminLayout } from '@/layouts/index';
import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { useProducts } from '@/hooks/data';
import api from '@/lib/common/api';
import { storage } from '@/lib/client/firebase';

const emptyForm = {
  code: '',
  name: '',
  description: '',
  price: '',
  isActive: true,
  initialStock: 0,
  reorderLevel: 0,
  imageUrl: '',
  imagePath: '',
};

const ProductsAdmin = () => {
  const { data, isLoading, mutate } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [restockReason, setRestockReason] = useState('');
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustDirection, setAdjustDirection] = useState('decrease');
  const [adjustReason, setAdjustReason] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuProduct, setMenuProduct] = useState(null);

  const rows =
    data?.products?.map((product) => ({
      id: product.productId,
      ...product,
      quantityOnHand: product.inventory?.quantityOnHand ?? 0,
      quantityReserved: product.inventory?.quantityReserved ?? 0,
      reorderLevel: product.inventory?.reorderLevel ?? 0,
    })) || [];

  const openActionsMenu = (event, product) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuProduct(product);
  };

  const closeActionsMenu = () => {
    setMenuAnchorEl(null);
    setMenuProduct(null);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setImageFile(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      code: product.code || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      isActive: product.isActive !== false,
      initialStock: 0,
      reorderLevel: product.inventory?.reorderLevel ?? 0,
      imageUrl: product.imageUrl || '',
      imagePath: product.imagePath || '',
    });
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setImageFile(null);
  };

  const openRestockModal = (product) => {
    setRestockProduct(product);
    setRestockQuantity('');
    setRestockReason('');
    setShowRestockModal(true);
  };

  const closeRestockModal = () => {
    setShowRestockModal(false);
    setRestockProduct(null);
    setRestockQuantity('');
    setRestockReason('');
  };

  const handleRestock = async () => {
    const quantity = Number(restockQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error('Enter a positive whole number to restock');
      return;
    }

    setIsRestocking(true);

    try {
      const response = await api('/api/admin/products', {
        method: 'PATCH',
        body: {
          action: 'restock',
          productId: restockProduct.productId,
          quantity,
          reason: restockReason.trim() || undefined,
        },
      });

      if (response.status >= 400) {
        throw new Error(
          response.errors?.error?.msg || 'Failed to restock product'
        );
      }

      toast.success(`Restocked ${quantity} unit(s)`);
      await mutate();
      closeRestockModal();
    } catch (error) {
      toast.error(error.message || 'Failed to restock product');
    } finally {
      setIsRestocking(false);
    }
  };

  const openAdjustModal = (product) => {
    setAdjustTarget(product);
    setAdjustQuantity('');
    setAdjustDirection('decrease');
    setAdjustReason('');
    setShowAdjustModal(true);
  };

  const closeAdjustModal = () => {
    setShowAdjustModal(false);
    setAdjustTarget(null);
    setAdjustQuantity('');
    setAdjustDirection('decrease');
    setAdjustReason('');
  };

  const handleAdjust = async () => {
    const quantity = Number(adjustQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error('Enter a positive whole number to adjust');
      return;
    }

    setIsAdjusting(true);

    try {
      const response = await api('/api/admin/products', {
        method: 'PATCH',
        body: {
          action: 'adjust',
          productId: adjustTarget.productId,
          quantity,
          direction: adjustDirection,
          reason: adjustReason.trim() || undefined,
        },
      });

      if (response.status >= 400) {
        throw new Error(
          response.errors?.error?.msg || 'Failed to adjust inventory'
        );
      }

      toast.success(
        `Adjusted ${adjustDirection === 'increase' ? '+' : '-'}${quantity}`
      );
      await mutate();
      closeAdjustModal();
    } catch (error) {
      toast.error(error.message || 'Failed to adjust inventory');
    } finally {
      setIsAdjusting(false);
    }
  };

  const uploadProductImage = (file) => {
    const extension = file.name?.split('.').pop() || 'jpg';
    const folderId = crypto
      .createHash('md5')
      .update(`${file.name}${Date.now()}${Math.random()}`)
      .digest('hex')
      .substring(0, 12);
    const fileName = `files/shop/products/${folderId}/${Date.now()}.${extension}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          reject(
            new Error(error?.message || error?.code || 'Failed to upload image')
          );
        },
        async () => {
          try {
            const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ imageUrl, imagePath: fileName });
          } catch (error) {
            reject(new Error(error?.message || 'Failed to get image URL'));
          }
        }
      );
    });
  };

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.name.trim() || form.price === '') {
      toast.error('Please fill in code, name, and price');
      return;
    }

    const parsedPrice = Number(form.price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('Price must be a non-negative number');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = form.imageUrl || null;
      let imagePath = form.imagePath || null;

      if (imageFile) {
        setIsUploading(true);
        const uploaded = await uploadProductImage(imageFile);
        imageUrl = uploaded.imageUrl;
        imagePath = uploaded.imagePath;
        setIsUploading(false);
      }

      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description,
        price: parsedPrice,
        imageUrl,
        imagePath,
        isActive: form.isActive,
        reorderLevel: Number(form.reorderLevel) || 0,
      };

      const response = editingProduct
        ? await api('/api/admin/products', {
            method: 'PUT',
            body: { productId: editingProduct.productId, ...payload },
          })
        : await api('/api/admin/products', {
            method: 'POST',
            body: {
              ...payload,
              initialStock: Number(form.initialStock) || 0,
            },
          });

      if (response.status >= 400) {
        throw new Error(
          response.errors?.error?.msg || 'Failed to save product'
        );
      }

      toast.success(
        editingProduct
          ? 'Product updated successfully'
          : 'Product created successfully'
      );
      await mutate();
      closeModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <Button size="small" onClick={openCreateModal}>
          Add Product
        </Button>
      </GridToolbarContainer>
    );
  }

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Shop Products" />
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage shop catalog, images, and inventory levels.
      </Typography>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          loading={isLoading}
          columns={[
            {
              field: 'imageUrl',
              headerName: 'Image',
              width: 90,
              sortable: false,
              filterable: false,
              renderCell: (params) =>
                params.value ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={params.value}
                    alt={params.row.name}
                    className="object-cover w-10 h-10 rounded"
                  />
                ) : (
                  <span className="text-xs text-gray-400">None</span>
                ),
            },
            {
              field: 'code',
              headerName: 'Code',
              width: 130,
            },
            {
              field: 'name',
              headerName: 'Name',
              flex: 1,
              minWidth: 180,
            },
            {
              field: 'price',
              headerName: 'Price',
              width: 110,
              valueFormatter: (value) =>
                Number(value || 0).toLocaleString('en-PH', {
                  style: 'currency',
                  currency: 'PHP',
                }),
            },
            {
              field: 'quantityOnHand',
              headerName: 'On Hand',
              width: 100,
              align: 'center',
              headerAlign: 'center',
            },
            {
              field: 'quantityReserved',
              headerName: 'Reserved',
              width: 100,
              align: 'center',
              headerAlign: 'center',
            },
            {
              field: 'available',
              headerName: 'Available',
              width: 100,
              align: 'center',
              headerAlign: 'center',
            },
            {
              field: 'isActive',
              headerName: 'Active',
              width: 90,
              align: 'center',
              headerAlign: 'center',
              valueFormatter: (value) => (value ? 'Yes' : 'No'),
            },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 80,
              align: 'center',
              headerAlign: 'center',
              sortable: false,
              filterable: false,
              renderCell: (params) => (
                <IconButton
                  size="small"
                  aria-label="Product actions"
                  aria-controls={
                    menuProduct?.productId === params.row.productId
                      ? 'product-actions-menu'
                      : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={
                    menuProduct?.productId === params.row.productId
                      ? 'true'
                      : undefined
                  }
                  onClick={(event) => openActionsMenu(event, params.row)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              ),
            },
          ]}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          slots={{ toolbar: CustomToolbar }}
          disableRowSelectionOnClick
        />
      </Box>

      <Menu
        id="product-actions-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeActionsMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            const product = menuProduct;
            closeActionsMenu();
            if (product) openEditModal(product);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            const product = menuProduct;
            closeActionsMenu();
            if (product) openRestockModal(product);
          }}
        >
          Restock
        </MenuItem>
        <MenuItem
          onClick={() => {
            const product = menuProduct;
            closeActionsMenu();
            if (product) openAdjustModal(product);
          }}
        >
          Adjust
        </MenuItem>
      </Menu>

      <SideModal
        title={
          adjustTarget ? `Adjust — ${adjustTarget.name}` : 'Adjust Inventory'
        }
        show={showAdjustModal}
        toggle={closeAdjustModal}
      >
        <div className="space-y-4">
          {adjustTarget && (
            <p className="text-sm text-gray-600">
              Current on hand:{' '}
              <span className="font-semibold">
                {adjustTarget.quantityOnHand ?? 0}
              </span>
              {' · '}
              Reserved:{' '}
              <span className="font-semibold">
                {adjustTarget.quantityReserved ?? 0}
              </span>
            </p>
          )}

          <div className="flex flex-col space-y-2">
            <label className="font-medium">Direction *</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={adjustDirection === 'increase'}
                  onChange={() => setAdjustDirection('increase')}
                />
                <span>Increase</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={adjustDirection === 'decrease'}
                  onChange={() => setAdjustDirection('decrease')}
                />
                <span>Decrease</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Quantity *</label>
            <input
              type="number"
              min="1"
              step="1"
              className="px-3 py-2 border rounded"
              value={adjustQuantity}
              onChange={(e) => setAdjustQuantity(e.target.value)}
              placeholder="eg. 1"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Reason</label>
            <input
              className="px-3 py-2 border rounded"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="eg. Damaged / cycle count"
            />
          </div>

          <div className="flex items-center justify-end pt-4 space-x-2">
            <button
              type="button"
              className="px-4 py-2 border rounded"
              onClick={closeAdjustModal}
              disabled={isAdjusting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-white rounded bg-amber-600 disabled:opacity-50"
              onClick={handleAdjust}
              disabled={isAdjusting}
            >
              {isAdjusting ? 'Adjusting...' : 'Adjust'}
            </button>
          </div>
        </div>
      </SideModal>

      <SideModal
        title={
          restockProduct
            ? `Restock — ${restockProduct.name}`
            : 'Restock Product'
        }
        show={showRestockModal}
        toggle={closeRestockModal}
      >
        <div className="space-y-4">
          {restockProduct && (
            <p className="text-sm text-gray-600">
              Current on hand:{' '}
              <span className="font-semibold">
                {restockProduct.quantityOnHand ?? 0}
              </span>
              {' · '}
              Available:{' '}
              <span className="font-semibold">
                {restockProduct.available ?? 0}
              </span>
            </p>
          )}

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Quantity to add *</label>
            <input
              type="number"
              min="1"
              step="1"
              className="px-3 py-2 border rounded"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(e.target.value)}
              placeholder="eg. 10"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Reason</label>
            <input
              className="px-3 py-2 border rounded"
              value={restockReason}
              onChange={(e) => setRestockReason(e.target.value)}
              placeholder="eg. Supplier delivery"
            />
          </div>

          <div className="flex items-center justify-end pt-4 space-x-2">
            <button
              type="button"
              className="px-4 py-2 border rounded"
              onClick={closeRestockModal}
              disabled={isRestocking}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-white rounded bg-green-600 disabled:opacity-50"
              onClick={handleRestock}
              disabled={isRestocking}
            >
              {isRestocking ? 'Restocking...' : 'Restock'}
            </button>
          </div>
        </div>
      </SideModal>

      <SideModal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        show={showModal}
        toggle={closeModal}
      >
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="font-medium">Code *</label>
            <input
              className="px-3 py-2 border rounded"
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, code: e.target.value }))
              }
              placeholder="eg. BOOK-MATH"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Name *</label>
            <input
              className="px-3 py-2 border rounded"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Product name"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Description</label>
            <textarea
              className="px-3 py-2 border rounded"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Price (PHP) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="px-3 py-2 border rounded"
              value={form.price}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, price: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Image</label>
            {(form.imageUrl || imageFile) && (
              <div className="mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    imageFile ? URL.createObjectURL(imageFile) : form.imageUrl
                  }
                  alt="Product preview"
                  className="object-cover w-24 h-24 rounded border"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          {!editingProduct && (
            <div className="flex flex-col space-y-1">
              <label className="font-medium">Initial Stock</label>
              <input
                type="number"
                min="0"
                className="px-3 py-2 border rounded"
                value={form.initialStock}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, initialStock: e.target.value }))
                }
              />
            </div>
          )}

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Reorder Level</label>
            <input
              type="number"
              min="0"
              className="px-3 py-2 border rounded"
              value={form.reorderLevel}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reorderLevel: e.target.value }))
              }
            />
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            <span>Active</span>
          </label>

          <div className="flex items-center justify-end pt-4 space-x-2">
            <button
              type="button"
              className="px-4 py-2 border rounded"
              onClick={closeModal}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-white rounded bg-primary-500 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
            >
              {isUploading
                ? 'Uploading...'
                : isSubmitting
                  ? 'Saving...'
                  : editingProduct
                    ? 'Update'
                    : 'Create'}
            </button>
          </div>
        </div>
      </SideModal>
    </AdminLayout>
  );
};

export default ProductsAdmin;
