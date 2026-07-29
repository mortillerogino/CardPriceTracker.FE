import { apiClient } from './client';
import type { Card, CatalogSearchResult, CreateCardInput, UpdateCardInput } from '../types/card';

export async function getCardById(id: string): Promise<Card> {
  const { data } = await apiClient.get<Card>(`/cards/${id}`);
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

export async function decrementCardQuantity(id: string): Promise<Card> {
  const { data } = await apiClient.post<Card>(`/cards/${id}/decrement-quantity`);
  return data;
}

export async function catalogSearch(query: string): Promise<CatalogSearchResult[]> {
  const { data } = await apiClient.get<CatalogSearchResult[]>('/cards/catalog-search', {
    params: { query },
  });
  return data;
}

export async function addFromCatalog(input: CreateCardInput): Promise<Card> {
  const { data } = await apiClient.post<Card>('/cards/catalog-search/add', input);
  return data;
}
