import type { Metadata } from 'next'
import CategoryForm from '../_components/CategoryForm'

export const metadata: Metadata = {
  title: 'New Category',
}

export default function NewCategoryPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">New Category</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Create a new product category
        </p>
      </div>
      <CategoryForm />
    </div>
  )
}
