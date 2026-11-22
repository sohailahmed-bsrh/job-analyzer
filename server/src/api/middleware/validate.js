import { AppError } from '../../utils/AppError.js'
export function validate(schema, source='body'){return (req,_res,next)=>{const result=schema.safeParse(req[source]);if(!result.success)return next(new AppError('Invalid request.',422,result.error.flatten(),'VALIDATION_ERROR'));req[source]=result.data;next()}}
