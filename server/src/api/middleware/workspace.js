import { AppError } from '../../utils/AppError.js'

export function requireWorkspace(req, _res, next) {
  try {
    const workspaceId = req.headers['x-workspace-id']
    if (!workspaceId) throw new AppError('Workspace ID required.', 401, null, 'WORKSPACE_REQUIRED')
    req.workspaceId = workspaceId
    next()
  } catch (err) {
    next(err)
  }
}
