import { QueryClient } from '@tanstack/react-query';

export const dsPreviewQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});
