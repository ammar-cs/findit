import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi'
import Card from '../../UI/card/Card'
import CardBody from '../../UI/card/CardBody'
import TextInput from '../../UI/form/TextInput'

const DEFAULT_CATEGORIES = [
  'Electronics', 'Wallet/Bag', 'Keys', 'Documents', 'Clothing', 'Pets', 'Other',
]

// ── Modal ─────────────────────────────────────────────────────────────────────

function CategoryModal({ mode, initialName, onSave, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: initialName ?? '' },
  })

  const onSubmit = (data) => {
    onSave(data.name.trim())
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-secondary">
            {mode === 'add' ? 'Add Category' : 'Edit Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-secondary transition-colors"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <TextInput
            label="Category name"
            name="name"
            placeholder="e.g. Jewellery"
            register={register('name', {
              required: 'Category name is required.',
              minLength: { value: 2, message: 'Name must be at least 2 characters.' },
            })}
            error={errors.name}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-secondary border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [modal, setModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', index, name }

  const openAdd = () => setModal({ mode: 'add' })
  const openEdit = (index) => setModal({ mode: 'edit', index, name: categories[index] })
  const closeModal = () => setModal(null)

  const handleSave = (name) => {
    if (modal.mode === 'add') {
      if (!categories.includes(name)) {
        setCategories((prev) => [...prev, name])
      }
    } else {
      setCategories((prev) =>
        prev.map((c, i) => (i === modal.index ? name : c))
      )
    }
    closeModal()
  }

  const handleDelete = (index) => {
    if (!window.confirm(`Delete category "${categories[index]}"?`)) return
    setCategories((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary">Category Management</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={15} />
          Add Category
        </button>
      </div>

      {/* Categories list */}
      <div className="space-y-2">
        {categories.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No categories yet. Add one above.</p>
        )}
        {categories.map((cat, index) => (
          <Card key={cat + index}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-secondary">{cat}</p>
                  <p className="text-xs text-gray-400 mt-0.5">0 items</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(index)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-error border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <FiTrash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <CategoryModal
          mode={modal.mode}
          initialName={modal.name}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
