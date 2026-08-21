export function Button({ children, variant='primary', size='md', icon, type='button', disabled=false, loading=false, ...props }) {
  return (
    <button type={type} className={`btn btn-${variant} btn-${size}`} disabled={disabled || loading} {...props}>
      {loading ? <span className="spinner" style={{ width: '1em', height: '1em', borderTopColor: 'currentColor' }}></span> : icon}
      {children}
    </button>
  );
}
