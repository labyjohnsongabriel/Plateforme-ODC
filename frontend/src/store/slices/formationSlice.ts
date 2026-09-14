import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { formationApi } from '@/services/formation.api';
import type { Formation, FormationFilters } from '@/types/formation.types';

interface FormationState {
  formations: Formation[];
  selectedFormation: Formation | null;
  loading: boolean;
  error: string | null;
  filters: FormationFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: FormationState = {
  formations: [],
  selectedFormation: null,
  loading: false,
  error: null,
  filters: { page: 1, limit: 12 },
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
};

export const fetchFormations = createAsyncThunk(
  'formations/fetchAll',
  async (filters: FormationFilters, { rejectWithValue }) => {
    try {
      return await formationApi.list(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur');
    }
  }
);

export const fetchFormationById = createAsyncThunk(
  'formations/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await formationApi.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur');
    }
  }
);

export const deleteFormation = createAsyncThunk(
  'formations/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await formationApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur');
    }
  }
);

const formationSlice = createSlice({
  name: 'formations',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FormationFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { page: 1, limit: 12 };
    },
    clearSelected: (state) => {
      state.selectedFormation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFormations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormations.fulfilled, (state, action) => {
        state.loading = false;
        state.formations = action.payload.data;
        state.pagination = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
          totalPages: action.payload.pagination.totalPages,
        };
      })
      .addCase(fetchFormations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchFormationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFormationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFormation = action.payload;
      })
      .addCase(fetchFormationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder.addCase(deleteFormation.fulfilled, (state, action) => {
      state.formations = state.formations.filter((f) => f.id !== action.payload);
    });
  },
});

export const { setFilters, resetFilters, clearSelected } = formationSlice.actions;
export default formationSlice.reducer;