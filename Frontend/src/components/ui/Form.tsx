import { cloneElement, isValidElement, useId } from 'react'
import type { ChangeEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

interface BaseFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
}

/**
 * Label + control wrapper. The id is injected into the control so the label is
 * properly associated (also enables queries like getByLabelText in tests).
 */
export function Field({ label, error, hint, required, children }: BaseFieldProps & { children: ReactNode }): React.JSX.Element {
  const fieldId = useId()
  const control = isValidElement(children)
    ? cloneElement(children, { id: fieldId } as Record<string, unknown>)
    : children
  return (
    <div className={`field ${error ? 'field-error' : ''}`}>
      <label className="field-label" htmlFor={fieldId}>
        {label}
        {required ? <span className="required-mark"> *</span> : null}
      </label>
      {control}
      {hint && !error ? <p className="field-hint">{hint}</p> : null}
      {error ? <p className="field-error-msg" role="alert">{error}</p> : null}
    </div>
  )
}

type TextInputProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>

export function TextInput({ label, error, hint, required, className, ...rest }: TextInputProps): React.JSX.Element {
  return (
    <Field label={label} error={error} hint={hint} required={required}>
      <input className={`input ${className ?? ''}`} aria-invalid={error ? true : undefined} {...rest} />
    </Field>
  )
}

type SelectProps = BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement>

export function SelectField({
  label,
  error,
  hint,
  required,
  children,
  className,
  ...rest
}: SelectProps): React.JSX.Element {
  return (
    <Field label={label} error={error} hint={hint} required={required}>
      <select className={`input ${className ?? ''}`} aria-invalid={error ? true : undefined} {...rest}>
        {children}
      </select>
    </Field>
  )
}

/** Collect all field messages from a 422 error object into local state. */
export function fieldError(
  serverErrors: Record<string, string[]> | undefined,
  field: string,
): string | undefined {
  const messages = serverErrors?.[field]
  return messages?.length ? messages[0] : undefined
}

/**
 * Flatten a server 422 errors map into a Record<string, string> (first message
 * per field). When `fields` is omitted, every error key is used.
 */
export function toLocalErrors(
  serverErrors: Record<string, string[]> | undefined,
  fields?: string[],
): Record<string, string> {
  const result: Record<string, string> = {}
  if (!serverErrors) return result
  const keys = fields ?? Object.keys(serverErrors)
  for (const field of keys) {
    const message = fieldError(serverErrors, field)
    if (message) result[field] = message
  }
  return result
}

export function inputValue(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): string {
  return event.target.value
}