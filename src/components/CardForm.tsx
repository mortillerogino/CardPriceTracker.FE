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
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div className="field" style={{ flex: 1, minWidth: 140 }}>
        <label htmlFor="new-card-name">Name</label>
        <input
          id="new-card-name"
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div className="field" style={{ flex: 1, minWidth: 140 }}>
        <label htmlFor="new-card-set">Set</label>
        <input
          id="new-card-set"
          className="input"
          value={form.setName}
          onChange={(e) => setForm({ ...form, setName: e.target.value })}
          required
        />
      </div>
      <div className="field" style={{ flex: 1, minWidth: 140 }}>
        <label htmlFor="new-card-number">Catalog no.</label>
        <input
          id="new-card-number"
          className="input"
          value={form.cardNumber}
          onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
          required
        />
      </div>
      <button type="submit" className="btn btn-secondary blueprint" disabled={isSubmitting}>
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        Add to catalog
      </button>
    </form>
  );
}
