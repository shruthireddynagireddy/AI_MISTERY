import { randomBytes } from 'node:crypto';
export const COOKIE_NAME='mystery_session';
export function ensureSession(req,res,next) {
  let token=req.cookies?.[COOKIE_NAME];
  if(!token || !/^[a-f0-9]{64}$/.test(token)) {
    token=randomBytes(32).toString('hex');
    res.cookie(COOKIE_NAME,token,{httpOnly:true,sameSite:'lax',secure:process.env.SESSION_COOKIE_SECURE==='true',maxAge:30*24*60*60*1000,path:'/'});
  }
  req.sessionToken=token; next();
}
