import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { CaseModel } from '../models/Case.js';
const memory=new Map();
export const persistent=()=>mongoose.connection.readyState===1;
export async function saveCase(ownerSessionId,scenario,difficulty,doc) {
  if(persistent()) { const item=await CaseModel.create({ownerSessionId,scenario,difficulty,status:'ready',...doc}); return item; }
  const item={_id:randomBytes(12).toString('hex'),ownerSessionId,scenario,difficulty,status:'ready',...doc,createdAt:new Date(),accusation:null}; memory.set(item._id,item); return item;
}
export async function findOwnedCase(id,ownerSessionId) {
  if(persistent()) return CaseModel.findOne({_id:id,ownerSessionId}).lean();
  const item=memory.get(id); return item?.ownerSessionId===ownerSessionId?item:null;
}
export async function recordAccusation(item,suspectId,correct) {
  if(persistent()) {
    const updated=await CaseModel.findOneAndUpdate({_id:item._id,ownerSessionId:item.ownerSessionId,'accusation.suspectId':{$exists:false}},{$set:{accusation:{suspectId,correct,submittedAt:new Date()}}},{new:true}).lean();
    return updated;
  }
  if(item.accusation) return null;
  item.accusation={suspectId,correct,submittedAt:new Date()}; return item;
}
