export function Input({ label, error, hint, ...props }) {
  return <label className="field">
    <span>{label}</span>
    <input {...props} aria-invalid={Boolean(error)} />
    {hint && !error ? <small>{hint}</small> : null}
    {error ? <small className="field-error">{error}</small> : null}
  </label>
}

export function Textarea({ label, error, hint, ...props }) {
  return <label className="field">
    <span>{label}</span>
    <textarea {...props} aria-invalid={Boolean(error)} />
    {hint && !error ? <small>{hint}</small> : null}
    {error ? <small className="field-error">{error}</small> : null}
  </label>
}
