import { randomUUID } from 'node:crypto';
import { generatedCaseSchema } from '../schemas/caseSchema.js';
import { generateWithGemini } from './geminiService.js';
import { PROMPT_VERSION } from '../prompts/mysteryPrompt.js';
const counts={easy:[3,6],medium:[4,8],hard:[5,10]};
function demoCase({scenario,difficulty,evidencePreferences}) {
  const base=Date.now(), iso=(minutes)=>new Date(base+minutes*60000).toISOString();
  const people=[
    {id:'suspect_01',name:'Mara Voss',age:42,role:'Senior curator',background:'She has overseen the museum collection for twelve years and knows the east wing better than anyone.',motive:'A recent audit threatened to expose that she had borrowed against a family debt.',alibi:'She says she was in the archive cataloguing the east gallery collection.'},
    {id:'suspect_02',name:'Elliot Finch',age:36,role:'Security supervisor',background:'He controlled the camera console during the private viewing.',motive:'He was recently passed over for a promotion and had access to the service corridor.',alibi:'He claims he stayed in the security room throughout the evening.'},
    {id:'suspect_03',name:'Nina Vale',age:29,role:'Restoration artist',background:'She had been repairing the Moonstone’s display mount earlier that week.',motive:'Her restoration contract was ending, and she had argued with the curator over credit.',alibi:'She says she left the museum before the viewing began.'},
    {id:'suspect_04',name:'Jonas Reed',age:51,role:'Event patron',background:'A regular donor who requested a private look at the exhibit.',motive:'His family once owned the Moonstone and he believes it was taken from them.',alibi:'He says he remained in the west salon with the guests.'},
    {id:'suspect_05',name:'Bea Calder',age:33,role:'Museum conservator',background:'She monitors collection conditions and can enter the climate-control passages.',motive:'A funding dispute left her department facing closure.',alibi:'She says she was checking humidity readings in the lower gallery.'}
  ].slice(0,counts[difficulty][0]);
  const evidence=[
    {id:'evidence_01',type:'document',title:'East wing access log',description:'The service door was opened at 9:41 PM using a curator-level keycard.',eventTime:iso(-19),suspectIds:['suspect_01'],clueType:'access record',content:{text:'ENTRY 21:41 — EAST SERVICE DOOR — AUTHORIZED KEYCARD.'}},
    {id:'evidence_02',type:'chat',title:'A message from the archive',description:'A message sent from Mara’s phone places her near the east wing during her stated archive alibi.',eventTime:iso(-14),suspectIds:['suspect_01'],clueType:'contradiction',content:{messages:[{sender:'Mara',recipient:'Elliot',timestamp:iso(-14),text:'The east corridor is clear. I will return the key before the guests leave.'}]}},
    {id:'evidence_03',type:'cctv',title:'Corridor camera still',description:'A figure carrying a narrow portfolio enters the east wing. The display case remains closed.',eventTime:iso(-10),suspectIds:['suspect_01','suspect_03'],clueType:'observation',content:{camera:'E-04',location:'East corridor',text:'A figure with a narrow portfolio enters the corridor at 9:50 PM.'},media:{status:'failed'}},
    {id:'evidence_04',type:'witness',title:'Usher statement',description:'An usher recalls seeing Elliot leave the security room briefly to answer a call.',eventTime:iso(-7),suspectIds:['suspect_02'],clueType:'red herring',content:{text:'I saw the security supervisor in the north passage. It was only for a minute.'}},
    {id:'evidence_05',type:'image',title:'Display mount photograph',description:'A fictional scene photograph shows a fresh crescent of restoration wax beside the case latch.',eventTime:iso(-5),suspectIds:['suspect_03'],clueType:'physical clue',content:{altText:'A brass display latch with a pale crescent of wax.',text:'Illustrative image description: close view of a brass latch and pale restoration wax.'},media:{status:'failed'}},
    {id:'evidence_06',type:'document',title:'Guest room receipt',description:'A signed refreshment receipt puts Jonas in the west salon at the time the case was opened.',eventTime:iso(-4),suspectIds:['suspect_04'],clueType:'alibi support',content:{text:'WEST SALON — tea service for Jonas Reed — signed 9:53 PM.'}},
    {id:'evidence_07',type:'chat',title:'Restoration schedule',description:'Nina’s message confirms the wax she used was removed from the workshop before the viewing.',eventTime:iso(-3),suspectIds:['suspect_03'],clueType:'material clue',content:{messages:[{sender:'Nina',recipient:'Mara',timestamp:iso(-60),text:'I left the wax tin on your worktable after fitting the mount.'}]}},
    {id:'evidence_08',type:'document',title:'Conservation note',description:'The case latch can be opened without damage by pressing the wax impression left from its spare key.',eventTime:iso(-1),suspectIds:['suspect_01'],clueType:'decisive clue',content:{text:'A wax transfer can reproduce the shallow impression on the spare latch key.'}},
    {id:'evidence_09',type:'document',title:'Humidity control record',description:'The climate-control log shows no lower-gallery access during the theft window.',eventTime:iso(-2),suspectIds:['suspect_05'],clueType:'alibi support',content:{text:'Lower gallery climate sensors remained in calibration mode. No manual checks were recorded.'}},
    {id:'evidence_10',type:'witness',title:'Donor guest note',description:'A second guest confirms Jonas remained in the west salon through the viewing.',eventTime:iso(-1),suspectIds:['suspect_04'],clueType:'alibi support',content:{text:'Jonas was with us in the west salon when the Moonstone was discovered missing.'}}
  ].filter(item=>difficulty!=='easy'||!['evidence_03','evidence_04'].includes(item.id)).slice(0,counts[difficulty][1]);
  const timeline=[
    {id:'event_01',time:iso(-60),description:'The restoration workshop closes; a small tin of wax is left on the curator’s worktable.',suspectIds:['suspect_01','suspect_03'],evidenceIds:['evidence_07']},
    {id:'event_02',time:iso(-19),description:'A curator-level keycard opens the east service door.',suspectIds:['suspect_01'],evidenceIds:['evidence_01']},
    {id:'event_03',time:iso(-14),description:'Mara messages security from near the east corridor, contradicting her archive alibi.',suspectIds:['suspect_01','suspect_02'],evidenceIds:['evidence_02']},
    {id:'event_04',time:iso(-10),description:'A figure carrying a portfolio enters the east corridor.',suspectIds:['suspect_01','suspect_03'],evidenceIds:['evidence_03']},
    {id:'event_05',time:iso(-5),description:'Fresh restoration wax is found beside the display latch.',suspectIds:['suspect_01','suspect_03'],evidenceIds:['evidence_05','evidence_08']},
    {id:'event_06',time:iso(0),description:'The Moonstone is reported missing after the viewing.',suspectIds:people.map(p=>p.id),evidenceIds:['evidence_06']}
  ];
  const suspectIds=new Set(people.map(p=>p.id)), evidenceIds=new Set(evidence.map(e=>e.id));
  for(const item of evidence) item.suspectIds=item.suspectIds.filter(id=>suspectIds.has(id));
  for(const event of timeline) { event.suspectIds=event.suspectIds.filter(id=>suspectIds.has(id)); event.evidenceIds=event.evidenceIds.filter(id=>evidenceIds.has(id)); }
  const solutionEvidence=['evidence_01','evidence_02','evidence_05','evidence_08'].filter(id=>evidenceIds.has(id));
  return {title:'The Moonstone After Hours',briefing:`After a private viewing, the city museum's Moonstone vanished from a locked east-wing display. ${scenario.slice(0,180)}`,incident:{type:'Museum theft',location:'East Wing, Bellwether Museum',eventTime:iso(0),description:'The Moonstone disappeared during a private evening viewing.'},suspects:people,evidence,timeline,solution:{culpritId:'suspect_01',motive:'Mara needed money to settle a private family debt before the audit.',explanation:'Mara used her curator keycard to enter the east wing, then relied on a wax transfer of the spare latch key to open the display without breaking it. Her message places her in the corridor while she claimed to be in the archive. Fresh restoration wax at the latch connects the method to the workshop, and the access log confirms she could reach it. The other clues create plausible suspicion, but the guest receipt supports Jonas’s alibi, the camera-room detour does not put Elliot at the case, and Nina’s wax was left behind before the theft.',evidenceIds:solutionEvidence,suspectEliminations:people.filter(p=>p.id!=='suspect_01').map(p=>({suspectId:p.id,explanation:p.id==='suspect_02'?'His brief absence is suspicious, but no evidence places him at the display; his role alone does not establish access to the case.':p.id==='suspect_03'?'She handled the mount earlier, but her wax tin was left in the workshop and the access log records a curator keycard.':'The available timeline and access record do not place this suspect at the display during the theft.'}))}};
}
export async function buildValidatedCase(input) {
  let lastError;
  for(let attempt=1;attempt<=3;attempt++) {
    try {
      const raw=await generateWithGemini(input) ?? demoCase(input);
      const parsed=generatedCaseSchema.parse(raw);
      const [suspectCount,evidenceCount]=counts[input.difficulty];
      if(parsed.suspects.length!==suspectCount||parsed.evidence.length!==evidenceCount) throw new Error('Generated case does not match difficulty requirements');
      return {...parsed,generation:{model:process.env.GEMINI_API_KEY?(process.env.GEMINI_MODEL||'gemini-2.5-flash'):'demo-case-v1',promptVersion:PROMPT_VERSION,attempts:attempt,validatedAt:new Date()}};
    } catch(error) { lastError=error; console.warn(`Case validation/generation attempt ${attempt} failed`); }
  }
  throw Object.assign(new Error('We could not create a consistent case. Please try again.'),{code:'GENERATION_FAILED',cause:lastError});
}
