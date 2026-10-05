import { configureStore } from '@reduxjs/toolkit';
import activeHostsReducer from './slices/activeHostsSlice';

export const store = configureStore({
    reducer: {
        activeHosts: activeHostsReducer
    }
});