import { useMemo, useState } from 'react';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import format from 'date-fns/format';

import { AdminLayout } from '@/layouts/index';
import Meta from '@/components/Meta';
import { useInventoryMovements, useProducts } from '@/hooks/data';

const MOVEMENT_TYPES = [
  'RESERVE',
  'COMMIT',
  'RELEASE',
  'RESTOCK',
  'ADJUST',
];

const InventoryLedgerAdmin = () => {
  const [productId, setProductId] = useState('');
  const [type, setType] = useState('');
  const { data: productsData } = useProducts();
  const { data, isLoading } = useInventoryMovements({
    productId: productId || undefined,
    type: type || undefined,
  });

  const products = productsData?.products || [];

  const rows = useMemo(
    () =>
      data?.movements?.map((movement) => ({
        id: movement.movementId,
        ...movement,
        productCode: movement.product?.code || '',
        productName: movement.product?.name || '',
        userLabel:
          movement.user?.name || movement.user?.email || movement.userId || '—',
      })) || [],
    [data?.movements]
  );

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    );
  }

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Inventory Ledger" />
      <Typography variant="h4" gutterBottom>
        Inventory Ledger
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Audit trail of stock movements (restock, adjust, reserve, commit,
        release).
      </Typography>

      <div className="flex flex-col mb-4 space-y-3 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex flex-col w-full md:w-1/3">
          <label className="mb-1 text-sm font-medium">Product</label>
          <select
            className="px-3 py-2 border rounded"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">All products</option>
            {products.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.code} — {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm font-medium">Type</label>
          <select
            className="px-3 py-2 border rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All types</option>
            {MOVEMENT_TYPES.map((movementType) => (
              <option key={movementType} value={movementType}>
                {movementType}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Box sx={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={rows}
          loading={isLoading}
          columns={[
            {
              field: 'createdAt',
              headerName: 'Date',
              width: 170,
              valueFormatter: (value) =>
                value ? format(new Date(value), 'MMM d, yyyy h:mm a') : '—',
            },
            {
              field: 'type',
              headerName: 'Type',
              width: 120,
            },
            {
              field: 'productCode',
              headerName: 'Code',
              width: 130,
            },
            {
              field: 'productName',
              headerName: 'Product',
              flex: 1,
              minWidth: 180,
            },
            {
              field: 'quantity',
              headerName: 'Qty',
              width: 90,
              align: 'center',
              headerAlign: 'center',
            },
            {
              field: 'reason',
              headerName: 'Reason',
              flex: 1,
              minWidth: 180,
              valueFormatter: (value) => value || '—',
            },
            {
              field: 'userLabel',
              headerName: 'By',
              width: 180,
            },
          ]}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          slots={{ toolbar: CustomToolbar }}
          disableRowSelectionOnClick
        />
      </Box>
    </AdminLayout>
  );
};

export default InventoryLedgerAdmin;
