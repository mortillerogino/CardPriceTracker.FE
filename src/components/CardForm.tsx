import { useState } from 'react';
import type { FormEvent } from 'react';
import type { CreateCardInput } from '../types/card';

interface CardFormProps {
  onSubmit: (input: CreateCardInput) => void;
  isSubmitting: boolean;
}

const emptyForm: CreateCardInput = { name: '', setName: '', cardNumber: '' };

export function CardForm({ onSubmit, isSubmitting }: CardFormProps) {
  const [form, setForm] = useState<CreateCardInput>(emptyForm);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(form);
    setForm(emptyForm);
  }

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        placeholder="Set"
        value={form.setName}
        onChange={(e) => setForm({ ...form, setName: e.target.value })}
        required
      />
      <input
        placeholder="Card number"
        value={form.cardNumber}
        onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
        required
      />
      <button type="submit" disabled={isSubmitting}>
        Add card
      </button>
    </form>
  );
}
