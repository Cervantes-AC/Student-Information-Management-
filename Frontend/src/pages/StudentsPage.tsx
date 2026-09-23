import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { programsApi, studentsApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import { useCollection } from '../hooks/useCollection'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationBar } from '../components/PaginationBar'
import { ListToolbar } from '../components/ListToolbar'
import { PageHeader } from '../components/ui/Page'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SelectField, TextInput, toLocalErrors } from '../components/ui/Form'
import { ErrorState } from '../components/ui/States'
import { Spinner } from '../components/ui/Feedback'
import { useToast } from '../components/ui/Toast'
import { ordinalYear, recordStatusInfo } from '../utils/format'
import type { Program, Student, StudentPayload } from '../types'

export default function StudentsPage(): React.JSX.Element {
  const { showToast } = useToast()
  const collection = useCollection((query) => studentsApi.list(query), { defaultSort: 'student_number' })
  const { items, meta, loading, error, search, setSearch, page, setPage, perPage, setPerPage, sort, order, reload } =
    collection

  const [programs, setPrograms] = useState<Program[]>([])
  const [programFilter, setProgramFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')

  useEffect(() => {
    programsApi
      .list({ per_page: 100 })
      .then((result) => setPrograms(result.items))
      .catch(() => setPrograms([]))
  }, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<StudentPayload>({
    student_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    birth_date: '',
    email: '',
    contact_number: '',
    address: '',
    program_id: 0,
    year_level: 1,
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openCreate = (): void => {
    setForm({
      student_number: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      birth_date: '',
      email: '',
      contact_number: '',
      address: '',
      program_id: programs[0]?.id ?? 0,
      year_level: 1,
    })
    setFieldErrors({})
    setModalOpen(true)
  }

  const closeModal = (): void => {
    if (saving) return
    setModalOpen(false)
  }

  const save = async (): Promise<void> => {
    setSaving(true)
    setFieldErrors({})
    try {
      await studentsApi.create(form)
      showToast('Student registered.', 'success')
      setModalOpen(false)
      reload()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) setFieldErrors(toLocalErrors(err.errors))
        else showToast(err.message, 'error')
      } else {
        showToast('Failed to save student.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await studentsApi.remove(deleteTarget.id)
      showToast('Student deactivated.', 'success')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to deactivate student.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns: Column<Student>[] = [
    {
      key: 'full_name',
      header: 'Name',
      sortable: true,
      render: (student) => (
        <Link to={`/students/${student.id}`} className="table-link">
          {student.full_name}
        </Link>
      ),
    },
    { key: 'student_number', header: 'Student no.', sortable: true },
    {
      key: 'program',
      header: 'Program',
      render: (student) => student.program?.code ?? '—',
    },
    { key: 'year_level', header: 'Year', sortable: true, render: (student) => ordinalYear(student.year_level) },
    { key: 'email', header: 'Email' },
    {
      key: 'status',
      header: 'Status',
      render: (student) => {
        const info = recordStatusInfo(student.status)
        return <Badge tone={info.tone}>{info.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'col-actions',
      render: (student) => (
        <div className="row-actions">
          <Link className="btn btn-sm" to={`/students/${student.id}`}>
            View
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-danger-ghost"
            onClick={() => setDeleteTarget(student)}
            disabled={student.status === 'inactive'}
          >
            Deactivate
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Students"
        subtitle="Registered students and their program details."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Register student
          </button>
        }
      />

      <ListToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search name, number, email…">
        <SelectField
          label="Program"
          value={programFilter}
          onChange={(event) => {
            setProgramFilter(event.target.value)
            collection.setFilter('program_id', event.target.value)
          }}
        >
          <option value="">All programs</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.code}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Year level"
          value={yearFilter}
          onChange={(event) => {
            setYearFilter(event.target.value)
            collection.setFilter('year_level', event.target.value)
          }}
        >
          <option value="">All years</option>
          {[1, 2, 3, 4, 5].map((year) => (
            <option key={year} value={year}>
              {ordinalYear(year)}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Status"
          value={collection.filters?.status ?? ''}
          onChange={(event) => collection.setFilter('status', event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </SelectField>
      </ListToolbar>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(student) => student.id}
            loading={loading}
            sort={sort}
            order={order}
            onSort={collection.setSort}
            emptyTitle="No students found"
            emptyMessage="Adjust your search or register a new student."
            ariaLabel="Students"
          />
          <PaginationBar meta={meta} page={page} onPageChange={setPage} perPage={perPage} onPerPageChange={setPerPage} />
        </>
      )}

      <Modal
        open={modalOpen}
        title="Register a new student"
        onClose={closeModal}
        wide
        footer={
          <>
            <button type="button" className="btn" onClick={closeModal} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" /> Saving…
                </>
              ) : (
                'Register student'
              )}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <TextInput
            label="Student number"
            required
            value={form.student_number}
            error={fieldErrors.student_number}
            placeholder="e.g. 2026-00001"
            maxLength={20}
            onChange={(event) => setForm((f) => ({ ...f, student_number: event.target.value }))}
          />
          <TextInput
            label="First name"
            required
            value={form.first_name}
            error={fieldErrors.first_name}
            onChange={(event) => setForm((f) => ({ ...f, first_name: event.target.value }))}
          />
          <TextInput
            label="Middle name"
            value={form.middle_name ?? ''}
            error={fieldErrors.middle_name}
            onChange={(event) => setForm((f) => ({ ...f, middle_name: event.target.value }))}
          />
          <TextInput
            label="Last name"
            required
            value={form.last_name}
            error={fieldErrors.last_name}
            onChange={(event) => setForm((f) => ({ ...f, last_name: event.target.value }))}
          />
          <SelectField
            label="Program"
            required
            value={form.program_id}
            error={fieldErrors.program_id}
            onChange={(event) => setForm((f) => ({ ...f, program_id: Number(event.target.value) }))}
          >
            <option value={0} disabled>
              Select program…
            </option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.code} — {program.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Year level"
            required
            value={form.year_level}
            error={fieldErrors.year_level}
            onChange={(event) => setForm((f) => ({ ...f, year_level: Number(event.target.value) }))}
          >
            {[1, 2, 3, 4, 5].map((year) => (
              <option key={year} value={year}>
                {ordinalYear(year)}
              </option>
            ))}
          </SelectField>
          <TextInput
            label="Birth date"
            type="date"
            value={form.birth_date ?? ''}
            error={fieldErrors.birth_date}
            onChange={(event) => setForm((f) => ({ ...f, birth_date: event.target.value }))}
          />
          <TextInput
            label="Email"
            type="email"
            value={form.email ?? ''}
            error={fieldErrors.email}
            onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
          />
          <TextInput
            label="Contact number"
            value={form.contact_number ?? ''}
            error={fieldErrors.contact_number}
            onChange={(event) => setForm((f) => ({ ...f, contact_number: event.target.value }))}
          />
          <div className="field field-wide">
            <label className="field-label" htmlFor="student-address">
              Address
            </label>
            <textarea
              id="student-address"
              className="input"
              rows={2}
              value={form.address ?? ''}
              maxLength={1000}
              onChange={(event) => setForm((f) => ({ ...f, address: event.target.value }))}
            />
            {fieldErrors.address ? (
              <p className="field-error-msg" role="alert">
                {fieldErrors.address}
              </p>
            ) : null}
          </div>
          {fieldErrors.birth_date ? <p className="field-error-msg">{fieldErrors.birth_date}</p> : null}
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Deactivate student"
        message={`Deactivate student ${deleteTarget?.student_number ?? ''} (${deleteTarget?.full_name ?? ''})? The record is kept for history.`}
        confirmLabel="Deactivate"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}