'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { addGlobalFaq, updateGlobalFaq, deleteGlobalFaq, updateGlobalFaqOrders } from '@/actions/global_faqs'

type Faq = {
  id: string
  question: string
  answer: string
  display_order: number
}

export function GlobalFaqsEditor({ initialFaqs }: { initialFaqs: Faq[] }) {
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await addGlobalFaq(formData)
    if (res.success && res.data) {
      setFaqs([...faqs, res.data])
      setIsAdding(false)
    } else {
      alert('Error adding FAQ')
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this global FAQ?')) return
    setLoading(true)
    const res = await deleteGlobalFaq(id)
    if (res.success) {
      setFaqs(faqs.filter(f => f.id !== id))
    } else {
      alert('Error deleting FAQ')
    }
    setLoading(false)
  }

  async function handleUpdate(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateGlobalFaq(id, formData)
    if (res.success && res.data) {
      setFaqs(faqs.map(f => f.id === id ? res.data : f))
      alert('Saved!')
    } else {
      alert('Error updating FAQ')
    }
    setLoading(false)
  }

  const moveUp = async (index: number) => {
    if (index === 0) return
    const newFaqs = [...faqs]
    const temp = newFaqs[index].display_order
    newFaqs[index].display_order = newFaqs[index - 1].display_order
    newFaqs[index - 1].display_order = temp
    newFaqs.sort((a, b) => a.display_order - b.display_order)
    setFaqs(newFaqs)
    
    // Save to DB
    await updateGlobalFaqOrders([
      { id: newFaqs[index].id, display_order: newFaqs[index].display_order },
      { id: newFaqs[index - 1].id, display_order: newFaqs[index - 1].display_order }
    ])
  }

  const moveDown = async (index: number) => {
    if (index === faqs.length - 1) return
    const newFaqs = [...faqs]
    const temp = newFaqs[index].display_order
    newFaqs[index].display_order = newFaqs[index + 1].display_order
    newFaqs[index + 1].display_order = temp
    newFaqs.sort((a, b) => a.display_order - b.display_order)
    setFaqs(newFaqs)

    // Save to DB
    await updateGlobalFaqOrders([
      { id: newFaqs[index].id, display_order: newFaqs[index].display_order },
      { id: newFaqs[index + 1].id, display_order: newFaqs[index + 1].display_order }
    ])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">Global FAQs</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            These FAQs will be shown on any product that has "Use Global FAQs" enabled.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <Plus className="-ml-0.5 h-5 w-5" />
          Add Global FAQ
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <form key={faq.id} onSubmit={(e) => handleUpdate(faq.id, e)} className="relative flex items-start gap-4 p-4 border rounded-lg bg-gray-50 group">
            <div className="flex flex-col gap-1 pt-2">
              <button type="button" onClick={() => moveUp(index)} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <GripVertical className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => moveDown(index)} disabled={index === faqs.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <GripVertical className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <input
                  type="text"
                  name="question"
                  defaultValue={faq.question}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
              <div>
                <textarea
                  name="answer"
                  rows={2}
                  defaultValue={faq.answer}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDelete(faq.id)}
                disabled={loading}
                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Save
              </button>
            </div>
          </form>
        ))}

        {isAdding && (
          <form onSubmit={handleAdd} className="relative flex items-start gap-4 p-4 border rounded-lg bg-white border-indigo-200">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Question</label>
                <input
                  type="text"
                  name="question"
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Answer</label>
                <textarea
                  name="answer"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
