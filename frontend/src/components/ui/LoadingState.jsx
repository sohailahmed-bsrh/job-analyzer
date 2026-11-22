export function LoadingState({ label='Working…' }) {
  return <div className="loading-state"><div className="spinner" /><span>{label}</span></div>
}
