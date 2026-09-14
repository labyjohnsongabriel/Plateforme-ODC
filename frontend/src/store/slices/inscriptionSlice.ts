import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { inscriptionApi } from '@/services/inscription.api';
import type { Inscription, InscriptionFilters } from '@/types/inscription.types';

interface InscriptionState {
  inscriptions: Inscription[];
  selectedInscription: Inscription | null;
  loading: boolean;
  error: string | null;
  filters: InscriptionFilters;
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
}

const initialState: InscriptionState = {
  inscriptions: [],
  selectedInscription: null,
  loading: false,
  error: null,
  filters: { page: 1, limit: 20 },
  pagination: { page: 1, total: 0, totalPages: 0 },
};

export const fetchInscriptions = createAsyncThunk(
  'inscriptions/fetchAll',
  async (filters: InscriptionFilters, { rejectWithValue }) => {
    try {
      return await inscriptionApi.list(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur');
    }
  }
);

export const fetchInscriptionById = createAsyncThunk(
  'inscriptions/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await inscriptionApi.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur');
    }
  }
);

const inscriptionSlice = createSlice({
  name: 'inscriptions',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<InscriptionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateInscription: (state, action: PayloadAction<Inscription>) => {
      const index = state.inscriptions.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) state.inscriptions[index] = action.payload;
    },
    removeInscription: (state, action: PayloadAction<string>) => {
      state.inscriptions = state.inscriptions.filter((i) => i.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInscriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.inscriptions = action.payload.data;
        state.pagination = {
          page: action.payload.pagination.page,
          total: action.payload.pagination.total,
          totalPages: action.payload.pagination.totalPages,
        };
      })
      .addCase(fetchInscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder.addCase(fetchInscriptionById.fulfilled, (state, action) => {
      state.selectedInscription = action.payload;
    });
  },
});

export const { setFilters, updateInscription, removeInscription } =
  inscriptionSlice.actions;
export default inscriptionSlice.reducer;