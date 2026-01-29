import { createContext, useContext } from 'react';

export interface SuratContextType {
  mode: 'edit' | 'preview';
  data: {
    surat?: any;
    desa?: any;
    penduduk?: any;
    form_data?: any;
    pamong?: any;
  };
}

export const SuratContext = createContext<SuratContextType>({
  mode: 'edit',
  data: {},
});

export const useSuratContext = () => useContext(SuratContext);
