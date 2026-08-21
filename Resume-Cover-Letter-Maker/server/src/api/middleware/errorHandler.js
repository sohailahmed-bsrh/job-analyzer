export function errorHandler(err, req, res, _next) {
  console.error('[GlobalErrorHandler]', err);
  const status = err.status || 500
  const isDev = process.env.NODE_ENV === 'development';
  
  const responseError = { 
    code: err.code || (status === 500 ? 'INTERNAL_ERROR' : 'API_ERROR'), 
    message: status === 500 && !isDev ? 'An unexpected server error occurred.' : err.message, 
    details: err.details || null 
  }
  
  if (isDev && status === 500) {
    responseError.stack = err.stack;
  }
  
  res.status(status).json({ error: responseError })
}
