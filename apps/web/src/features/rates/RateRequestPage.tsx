import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createRateRequest } from '../../lib/api';

const initialForm = {
  mode: 'SEA',
  type: 'FCL',
  podId: '',
  doorOrCy: 'CY',
  equipTypeId: '',
  salespersonId: '',
  customerId: '',
  detentionFreeTime: '7',
};

type FormState = typeof initialForm & { preferredLineId?: string };

export function RateRequestPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const mutation = useMutation({ mutationFn: createRateRequest });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-lg font-semibold">New Rate Request</h2>
      <form onSubmit={submit} className="space-y-4 rounded-lg bg-white p-6 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">
            POD
            <input
              value={form.podId}
              onChange={(event) => setForm({ ...form, podId: event.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Equipment Type
            <input
              value={form.equipTypeId}
              onChange={(event) => setForm({ ...form, equipTypeId: event.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Salesperson ID
            <input
              value={form.salespersonId}
              onChange={(event) => setForm({ ...form, salespersonId: event.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Customer ID
            <input
              value={form.customerId}
              onChange={(event) => setForm({ ...form, customerId: event.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              required
            />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">
            Preferred Line (optional)
            <input
              value={form.preferredLineId ?? ''}
              onChange={(event) => setForm({ ...form, preferredLineId: event.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Detention Free Time
            <select
              value={form.detentionFreeTime}
              onChange={(event) => setForm({ ...form, detentionFreeTime: event.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="21">21 days</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Submitting…' : 'Submit Request'}
        </button>
        {mutation.isSuccess && <p className="text-sm text-green-600">Rate request submitted!</p>}
      </form>
    </div>
  );
}
