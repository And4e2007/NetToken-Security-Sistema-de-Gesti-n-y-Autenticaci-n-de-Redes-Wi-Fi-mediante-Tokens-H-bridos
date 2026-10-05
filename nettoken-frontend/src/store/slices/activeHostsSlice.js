import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    hosts: [],       // Lista de dispositivos conectados
    loading: false,
    error: null
};

export const activeHostsSlice = createSlice({
    name: 'activeHosts',
    initialState,
    reducers: {
        setHosts: (state, action) => {
            state.hosts = action.payload;
        },
        updateHostQoS: (state, action) => {
            // Encuentra el host y actualiza su velocidad en el dashboard localmente
            const { mac, nuevaBajada, nuevaSubida } = action.payload;
            const host = state.hosts.find(h => h.direccion_mac === mac);
            if (host) {
                host.override_bajada_kbps = nuevaBajada;
                host.override_subida_kbps = nuevaSubida;
            }
        },
        kickHost: (state, action) => {
            // Remueve temporalmente el host de la vista
            state.hosts = state.hosts.filter(h => h.direccion_mac !== action.payload);
        }
    }
});

export const { setHosts, updateHostQoS, kickHost } = activeHostsSlice.actions;
export default activeHostsSlice.reducer;