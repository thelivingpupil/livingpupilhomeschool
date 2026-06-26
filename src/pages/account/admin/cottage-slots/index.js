import { useState } from 'react';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { Box, Button, Typography } from '@mui/material';
import { AdminLayout } from '@/layouts/index';
import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { useCottageSlots } from '@/hooks/data';
import api from '@/lib/common/api';
import toast from 'react-hot-toast';
import {
  COTTAGE_SLOT_FORM_TARGETS,
  COTTAGE_SLOT_GRADE_TARGETS,
  GRADE_LEVEL,
  GRADE_LEVEL_HEADER,
  REGISTRAR_SCHOOL_YEARS,
} from '@/utils/constants';

const emptyForm = {
  cottageSlotName: '',
  schoolYear: REGISTRAR_SCHOOL_YEARS[0] || '',
  targetType: 'grade',
  gradeTarget: '',
  timeslot: '',
  slots: 0,
};

const getGradeTargetLabel = (gradeTarget) =>
  GRADE_LEVEL[gradeTarget] || GRADE_LEVEL_HEADER[gradeTarget] || gradeTarget;

const CottageSlotsAdmin = () => {
  const { data, isLoading, mutate } = useCottageSlots();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const rows =
    data?.cottageSlots?.map((slot) => ({
      ...slot,
      gradeTargetLabel: getGradeTargetLabel(slot.gradeTarget),
    })) || [];

  const openCreateModal = () => {
    setEditingSlot(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (slot) => {
    const isFormTarget = COTTAGE_SLOT_FORM_TARGETS.includes(slot.gradeTarget);
    setEditingSlot(slot);
    setForm({
      cottageSlotName: slot.cottageSlotName,
      schoolYear: slot.schoolYear,
      targetType: isFormTarget ? 'form' : 'grade',
      gradeTarget: slot.gradeTarget,
      timeslot: slot.timeslot,
      slots: slot.slots,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlot(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.cottageSlotName || !form.schoolYear || !form.gradeTarget || !form.timeslot) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        cottageSlotName: form.cottageSlotName.trim(),
        schoolYear: form.schoolYear,
        gradeTarget: form.gradeTarget,
        timeslot: form.timeslot.trim(),
        slots: Number(form.slots) || 0,
      };

      const response = editingSlot
        ? await api('/api/admin/cottage-slots', {
            method: 'PUT',
            body: { id: editingSlot.id, ...payload },
          })
        : await api('/api/admin/cottage-slots', {
            method: 'POST',
            body: payload,
          });

      if (response.status >= 400) {
        throw new Error(response.errors?.error?.msg || 'Failed to save cottage slot');
      }

      toast.success(
        editingSlot ? 'Cottage slot updated successfully' : 'Cottage slot created successfully',
      );
      await mutate();
      closeModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save cottage slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingSlot) {
      return;
    }

    if (!window.confirm(`Delete "${editingSlot.cottageSlotName}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await api('/api/admin/cottage-slots', {
        method: 'DELETE',
        body: { id: editingSlot.id },
      });

      if (response.status >= 400) {
        throw new Error(response.errors?.error?.msg || 'Failed to delete cottage slot');
      }

      toast.success('Cottage slot deleted successfully');
      await mutate();
      closeModal();
    } catch (error) {
      toast.error(error.message || 'Failed to delete cottage slot');
    } finally {
      setIsDeleting(false);
    }
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <Button size="small" onClick={openCreateModal}>
          Add Cottage Slot
        </Button>
      </GridToolbarContainer>
    );
  }

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Cottage Slots" />
      <Typography variant="h4" gutterBottom>
        Cottage Slots
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage cottage time slots and available capacity per school year, grade, or form.
      </Typography>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          loading={isLoading}
          columns={[
            {
              field: 'cottageSlotName',
              headerName: 'Name',
              flex: 1,
              minWidth: 180,
            },
            {
              field: 'schoolYear',
              headerName: 'School Year',
              width: 130,
            },
            {
              field: 'gradeTargetLabel',
              headerName: 'Grade/Form',
              flex: 1,
              minWidth: 180,
            },
            {
              field: 'timeslot',
              headerName: 'Time Slot',
              flex: 1,
              minWidth: 180,
            },
            {
              field: 'slots',
              headerName: 'Available Slots',
              width: 140,
              align: 'center',
              headerAlign: 'center',
            },
            {
              field: 'enrolledCount',
              headerName: 'Enrolled',
              width: 110,
              align: 'center',
              headerAlign: 'center',
            },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 120,
              sortable: false,
              filterable: false,
              renderCell: (params) => (
                <button
                  type="button"
                  className="px-3 py-1 text-xs text-white rounded-md bg-primary-500 hover:bg-primary-400"
                  onClick={() => openEditModal(params.row)}
                >
                  Edit
                </button>
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

      <SideModal
        title={editingSlot ? 'Edit Cottage Slot' : 'Add Cottage Slot'}
        show={showModal}
        toggle={closeModal}
      >
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="font-medium">Name *</label>
            <input
              className="px-3 py-2 border rounded"
              value={form.cottageSlotName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, cottageSlotName: e.target.value }))
              }
              placeholder="eg. Form 1A"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">School Year *</label>
            <select
              className="px-3 py-2 border rounded"
              value={form.schoolYear}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, schoolYear: e.target.value }))
              }
            >
              <option value="">Select school year...</option>
              {REGISTRAR_SCHOOL_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-medium">Target Type *</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={form.targetType === 'grade'}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      targetType: 'grade',
                      gradeTarget: '',
                    }))
                  }
                />
                <span>Individual Grade</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={form.targetType === 'form'}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      targetType: 'form',
                      gradeTarget: '',
                    }))
                  }
                />
                <span>Form</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">
              {form.targetType === 'form' ? 'Form' : 'Grade'} *
            </label>
            <select
              className="px-3 py-2 border rounded"
              value={form.gradeTarget}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, gradeTarget: e.target.value }))
              }
            >
              <option value="">Select target...</option>
              {(form.targetType === 'form'
                ? COTTAGE_SLOT_FORM_TARGETS
                : COTTAGE_SLOT_GRADE_TARGETS
              ).map((target) => (
                <option key={target} value={target}>
                  {getGradeTargetLabel(target)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Time Slot *</label>
            <input
              className="px-3 py-2 border rounded"
              value={form.timeslot}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, timeslot: e.target.value }))
              }
              placeholder="08:00am - 12pm"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Available Slots *</label>
            <input
              type="number"
              min="0"
              className="px-3 py-2 border rounded"
              value={form.slots}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, slots: e.target.value }))
              }
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            {editingSlot ? (
              <button
                type="button"
                className="px-4 py-2 text-white rounded bg-red-600 hover:bg-red-400 disabled:opacity-50"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            ) : (
              <span />
            )}
            <div className="flex space-x-2">
              <button
                type="button"
                className="px-4 py-2 border rounded"
                onClick={closeModal}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-white rounded bg-primary-500 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? 'Saving...' : editingSlot ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </SideModal>
    </AdminLayout>
  );
};

export default CottageSlotsAdmin;
