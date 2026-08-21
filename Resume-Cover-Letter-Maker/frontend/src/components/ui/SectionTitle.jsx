export function SectionTitle({ eyebrow, title, description, action }) {
  return <div className="section-title">
    <div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>
    {action ? <div>{action}</div> : null}
  </div>
}
