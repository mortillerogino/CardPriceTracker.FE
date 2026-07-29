import { apiClient } from './client';
import type { Card, CreateCardInput, UpdateCardInput } from '../types/card';

export async function searchCards(searchTerm: string): Promise<Card[]> {
  const { data } = await apiClient.get<Card[]>('/cards', {
    params: searchTerm ? { searchTerm } : undefined,
  });
  return data;
}

export async function getCardById(id: string): Promise<Card> {
  const { data } = await apiClient.get<Card>(`/cards/${id}`);
  return data;
}

export async function createCard(input: CreateCardInput): Promise<Card> {
  const { data } = await apiClient.post<Card>('/cards', input);
  return data;
}

export async function updateCard(id: string, input: UpdateCardInput): Promise<void> {
  await apiClient.put(`/cards/${id}`, input);
}

export async function deleteCard(id: string): Promise<void> {
  await apiClient.delete(`/cards/${id}`);
}

export async function getOwnedCards(): Promise<Card[]> {
  const { data } = await apiClient.get<Card[]>('/cards/owned');
  return data;
}

export async function incrementCardQuantity(id: string): Promise<Card> {
  const { data } = await apiClient.post<Card>(`/cards/${id}/increment-quantity`);
  return data;
}

export async function decrementCardQuantity(id: string): Promise<Card> {
  const { data } = await apiClient.post<Card>(`/cards/${id}/decrement-quantity`);
  return data;
}
