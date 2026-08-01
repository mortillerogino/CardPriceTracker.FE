import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addFromCatalog, catalogSearch, decrementCardQuantity, deleteCard, getCatalogSets, getOwnedCards } from '../api/cards';
import type { CreateCardInput } from '../types/card';

const ownedQueryKey = ['cards', 'owned'] as const;
const catalogSearchQueryKey = (query: string, setId: string) => ['catalog-search', query, setId] as const;
const catalogSetsQueryKey = ['catalog-sets'] as const;

function invalidateCardQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['cards'] });
  queryClient.invalidateQueries({ queryKey: ['catalog-search'] });
}

export function useCatalogSearch(query: string, setId: string) {
  return useQuery({
    queryKey: catalogSearchQueryKey(query, setId),
    queryFn: () => catalogSearch(query, setId),
    enabled: query.trim().length > 0 && setId.trim().length > 0,
  });
}

export function useCatalogSets() {
  return useQuery({
    queryKey: catalogSetsQueryKey,
    queryFn: getCatalogSets,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOwnedCards() {
  return useQuery({
    queryKey: ownedQueryKey,
    queryFn: getOwnedCards,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
