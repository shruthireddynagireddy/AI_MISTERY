import mongoose from 'mongoose';
import { createRequestSchema } from '../schemas/caseSchema.js';
import { buildValidatedCase } from '../services/caseGenerationService.js';
import { findOwnedCase, recordAccusation, saveCase } from '../services/storage.js';
function publicCase(item) {
  return {id:String(item._id),title:item.title,difficulty:item.difficulty,status:item.status,briefing:item.briefing,incident:item.incident,suspects:item.suspects,evidence:item.evidence.map(({id,type,title,description,content,media,createdAt,eventTime,suspectIds,clueType})=>({id,type,title,description,content,media,createdAt,eventTime,suspectIds,clueType})),timeline:item.timeline,createdAt:item.createdAt};
}
export async function create(req,res,next) {
  try {
    const input=createRequestSchema.parse(req.body);
    const generated=await buildValidatedCase(input);
    const item=await saveCase(req.sessionToken,input.scenario,input.difficulty,generated);
    res.status(201).json({case:publicCase(item)});
  } catch(error) { next(error); }
}
export async function retrieve(req,res,next) {
  try {
    if(mongoose.connection.readyState===1&&!mongoose.isValidObjectId(req.params.caseId)) return res.status(404).json({error:{code:'CASE_NOT_FOUND',message:'This case was not found.'}});
    const item=await findOwnedCase(req.params.caseId,req.sessionToken);
    if(!item) return res.status(404).json({error:{code:'CASE_NOT_FOUND',message:'This case was not found.'}});
    res.json({case:publicCase(item)});
  } catch(error) { next(error); }
}
export async function retrieveEvidence(req,res,next) {
  try { const item=await findOwnedCase(req.params.caseId,req.sessionToken); const evidence=item?.evidence?.find(e=>e.id===req.params.evidenceId); if(!evidence)return res.status(404).json({error:{code:'EVIDENCE_NOT_FOUND',message:'This evidence was not found.'}}); res.json({evidence:{id:evidence.id,type:evidence.type,title:evidence.title,description:evidence.description,content:evidence.content,media:evidence.media,eventTime:evidence.eventTime,suspectIds:evidence.suspectIds,clueType:evidence.clueType}}); } catch(error) { next(error); }
}
export async function accuse(req,res,next) {
  try {
    const item=await findOwnedCase(req.params.caseId,req.sessionToken);
    if(!item) return res.status(404).json({error:{code:'CASE_NOT_FOUND',message:'This case was not found.'}});
    if(item.status!=='ready') return res.status(409).json({error:{code:'CASE_NOT_READY',message:'This case is not ready for an accusation.'}});
    const suspectId=req.body?.suspectId;
    if(typeof suspectId!=='string'||!item.suspects.some(s=>s.id===suspectId)) return res.status(400).json({error:{code:'INVALID_SUSPECT',message:'Choose a suspect from this case.'}});
    const correct=suspectId===item.solution.culpritId;
    const updated=await recordAccusation(item,suspectId,correct);
    if(!updated) return res.status(409).json({error:{code:'DUPLICATE_ACCUSATION',message:'A final accusation has already been submitted for this case.'}});
    const culprit=item.suspects.find(s=>s.id===item.solution.culpritId);
    res.json({verdict:{correct,selectedSuspectId:suspectId,culprit:{id:culprit.id,name:culprit.name},explanation:item.solution.explanation,evidenceIds:item.solution.evidenceIds,suspectEliminations:item.solution.suspectEliminations}});
  } catch(error) { next(error); }
}
