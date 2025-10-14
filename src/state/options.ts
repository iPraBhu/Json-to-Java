import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_OPTIONS, GeneratorOptions, optionsSchema } from '../core/options';
import { sanitizeJavaIdentifier, sanitizePackageName } from '../core/nameResolver';

const STORAGE_KEY = 'json-to-pojo::options';

type OptionsState = {
  options: GeneratorOptions;
  hydrated: boolean;
  setOptions: (options: Partial<GeneratorOptions>) => void;
  reset: () => void;
  setHydrated: () => void;
};

const sanitizeOptions = (options: Partial<GeneratorOptions>): Partial<GeneratorOptions> => {
  const copy = { ...options };
  if (copy.packageName !== undefined) {
    copy.packageName = sanitizePackageName(copy.packageName) ?? undefined;
  }
  if (copy.rootClassName !== undefined) {
    copy.rootClassName = sanitizeJavaIdentifier(copy.rootClassName, { pascal: true });
  }
  return copy;
};

export const useOptionsStore = create<OptionsState>()(
  persist(
    (set) => ({
      options: DEFAULT_OPTIONS,
      hydrated: false,
      setOptions: (partial) =>
        set((state) => {
          const sanitized = sanitizeOptions(partial);
          const merged = { ...state.options, ...sanitized };
          const validated = optionsSchema.parse(merged);
          return { options: validated };
        }),
      reset: () => set({ options: DEFAULT_OPTIONS }),
      setHydrated: () => set({ hydrated: true })
    }),
    {
      name: STORAGE_KEY,
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => window.localStorage)
          : undefined,
      partialize: (state) => ({ options: state.options }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      }
    }
  )
);

export const hydrateOptionsStore = (): void => {
  if (typeof window === 'undefined') return;
  useOptionsStore.persist.rehydrate();
};
