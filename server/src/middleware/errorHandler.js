import { ZodError } from 'zod';
export function errorHandler(error,req,res,next) {
  if(res.headersSent) return next(error);
  if(error instanceof ZodError) return res.status(400).json({error:{code:'INVALID_SCENARIO',message:'Check the scenario, difficulty, and evidence options, then try again.'}});
  if(error.code==='GENERATION_FAILED') return res.status(503).json({error:{code:'GENERATION_FAILED',message:error.message}});
  console.error('Unhandled API error:',error.message);
  return res.status(500).json({error:{code:'INTERNAL_ERROR',message:'Something went wrong. Please try again.'}});
}
