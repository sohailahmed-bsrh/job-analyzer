import { Link } from 'react-router-dom'
export function NotFoundPage(){return <div className="page-center"><div className="card card-pad"><div className="eyebrow">404</div><h1>That page is not here.</h1><p className="muted">Return to the homepage and continue from there.</p><Link className="hero-primary" to="/">Back home</Link></div></div>}
