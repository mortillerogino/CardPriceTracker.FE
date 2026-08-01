import { apiClient } from './client';
import type { Card, CatalogSearchResult, CatalogSet, CreateCardInput, UpdateCardInput } from '../types/card';

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

export async function catalogSearch(query: string, setId: string): Promise<CatalogSearchResult[]> {
  const { data } = await apiClient.get<CatalogSearchResult[]>('/cards/catalog-search', {
    params: { query, setId },
  });
  return data;
}

export async function getCatalogSets(): Promise<CatalogSet[]> {
  const { data } = await apiClient.get<CatalogSet[]>('/cards/catalog-sets');
  return data;
}

export async function addFromCatalog(input: CreateCardInput): Promise<Card> {
  const { data } = await apiClient.post<Card>('/cards/catalog-search/add', input);
  return data;
}

export async function refreshPrices(): Promise<number> {
  const { data } = await apiClient.post<number>('/cards/refresh-prices');
  return data;
}
