export class AppError extends Error {
  constructor(message, status=400, details=null, code='APP_ERROR') { super(message); this.status=status; this.details=details; this.code=code }
}
