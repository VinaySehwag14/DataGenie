import { create } from 'zustand'

interface DataSource {
    id: string
    name: string
    row_count: number
    created_at: string
}

interface DataStore {
    dataSources: DataSource[]
    currentDataSource: DataSource | null
    loading: boolean
    setDataSources: (sources: DataSource[]) => void
    setCurrentDataSource: (source: DataSource | null) => void
    setLoading: (loading: boolean) => void
}

export const useDataStore = create<DataStore>((set) => ({
    dataSources: [],
    currentDataSource: null,
    loading: false,
    setDataSources: (sources) => set({ dataSources: sources }),
    setCurrentDataSource: (source) => set({ currentDataSource: source }),
    setLoading: (loading) => set({ loading }),
}))
