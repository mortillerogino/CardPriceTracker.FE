import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addFromCatalog, catalogSearch, decrementCardQuantity, deleteCard, getOwnedCards } from '../api/cards';
import type { CreateCardInput } from '../types/card';

const ownedQueryKey = ['cards', 'owned'] as const;
const catalogSearchQueryKey = (query: string) => ['catalog-search', query] as const;

function invalidateCardQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['cards'] });
  queryClient.invalidateQueries({ queryKey: ['catalog-search'] });
}

export function useCatalogSearch(query: string) {
  return useQuery({
    queryKey: catalogSearchQueryKey(query),
    queryFn: () => catalogSearch(query),
    enabled: query.trim().length >= 5,
  });
}

export function useOwnedCards() {
  return useQuery({
    queryKey: ownedQueryKey,
    queryFn: getOwnedCards,
  });
}

export function useAddFromCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCardInput) => addFromCatalog(input),
    onSuccess: () => invalidateCardQueries(queryClient),
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCard(id),
    onSuccess: () => invalidateCardQueries(queryClient),
  });
}

export function useDecrementCardQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => decrementCardQuantity(id),
    onSuccess: () => invalidateCardQueries(queryClient),
  });
}
