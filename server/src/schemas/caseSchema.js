import { z } from 'zod';
const id = z.string().min(1);
const date = z.string().datetime({ offset: true }).or(z.string().min(1));
const messageSchema = z.object({ sender: z.string().min(1), timestamp: date, text: z.string().min(1) }).passthrough();
const evidenceSchema = z.object({
  id, type: z.enum(['chat','image','cctv','document','witness','other']), title: z.string().min(2), description: z.string().min(8),
  content: z.record(z.unknown()).default({}), createdAt: date.optional(), eventTime: date.optional(), suspectIds: z.array(id).default([]),
  clueType: z.string().default('lead'), relevance: z.string().default(''), media: z.object({url:z.string().optional(),mimeType:z.string().optional(),status:z.enum(['pending','ready','failed']).default('failed')}).optional()
}).passthrough();
export const generatedCaseSchema = z.object({
  title: z.string().min(3), briefing: z.string().min(20), incident: z.object({type:z.string(),location:z.string(),eventTime:date,description:z.string()}),
  suspects: z.array(z.object({id,name:z.string().min(2),age:z.number().optional(),role:z.string(),background:z.string(),motive:z.string(),alibi:z.string(),timeline:z.array(z.string()).default([])}).passthrough()).min(3).max(5),
  evidence: z.array(evidenceSchema).min(6).max(10),
  timeline: z.array(z.object({id,time:date,description:z.string(),suspectIds:z.array(id).default([]),evidenceIds:z.array(id).default([])}).passthrough()).min(3),
  solution: z.object({culpritId:id,motive:z.string(),explanation:z.string(),evidenceIds:z.array(id).min(1),suspectEliminations:z.array(z.object({suspectId:id,explanation:z.string()}))})
}).passthrough().superRefine((value,ctx)=>{
  const suspects=new Set(value.suspects.map(s=>s.id)), evidence=new Set(value.evidence.map(e=>e.id));
  if(suspects.size!==value.suspects.length) ctx.addIssue({code:'custom',message:'Suspect ids must be unique'});
  if(evidence.size!==value.evidence.length) ctx.addIssue({code:'custom',message:'Evidence ids must be unique'});
  if(!suspects.has(value.solution.culpritId)) ctx.addIssue({code:'custom',message:'Culprit must reference a suspect'});
  for(const sid of value.evidence.flatMap(e=>e.suspectIds)) if(!suspects.has(sid)) ctx.addIssue({code:'custom',message:'Evidence references unknown suspect'});
  for(const eid of value.solution.evidenceIds) if(!evidence.has(eid)) ctx.addIssue({code:'custom',message:'Solution references unknown evidence'});
  for(const row of value.solution.suspectEliminations) if(!suspects.has(row.suspectId)) ctx.addIssue({code:'custom',message:'Elimination references unknown suspect'});
  for(const event of value.timeline) for(const eid of event.evidenceIds) if(!evidence.has(eid)) ctx.addIssue({code:'custom',message:'Timeline references unknown evidence'});
});
export const createRequestSchema = z.object({scenario:z.string().trim().min(50).max(2000),difficulty:z.enum(['easy','medium','hard']).default('medium'),evidencePreferences:z.array(z.enum(['chat','image','cctv'])).max(3).default([])});
