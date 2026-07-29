import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCard, deleteCard, searchCards } from '../api/cards';
import type { CreateCardInput } from '../types/card';

const cardsQueryKey = (searchTerm: string) => ['cards', searchTerm] as const;

export function useCards(searchTerm: string) {
  return useQuery({
    queryKey: cardsQueryKey(searchTerm),
    queryFn: () => searchCards(searchTerm),
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCardInput) => createCard(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}
