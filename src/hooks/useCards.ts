import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCard,
  decrementCardQuantity,
  deleteCard,
  getOwnedCards,
  incrementCardQuantity,
  searchCards,
} from '../api/cards';
import type { CreateCardInput } from '../types/card';

const cardsQueryKey = (searchTerm: string) => ['cards', searchTerm] as const;
const ownedQueryKey = ['cards', 'owned'] as const;

function invalidateCardQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['cards'] });
}

export function useCards(searchTerm: string) {
  return useQuery({
    queryKey: cardsQueryKey(searchTerm),
    queryFn: () => searchCards(searchTerm),
  });
}

export function useOwnedCards() {
  return useQuery({
    queryKey: ownedQueryKey,
    queryFn: getOwnedCards,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCardInput) => createCard(input),
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

export function useIncrementCardQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => incrementCardQuantity(id),
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
