'use client'

import { useFormStatus } from 'react-dom'

export default function CmsSubmitButton({ label = 'Save changes' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
    >
      {pending ? 'Saving…' : label}
    </button>
  )
}
