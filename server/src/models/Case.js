import mongoose from 'mongoose';
const suspect = new mongoose.Schema({id:String,name:String,age:Number,role:String,background:String,motive:String,alibi:String,timeline:[String]},{_id:false});
const evidence = new mongoose.Schema({id:String,type:String,title:String,description:String,content:mongoose.Schema.Types.Mixed,media:{url:String,mimeType:String,status:String},createdAt:Date,eventTime:Date,suspectIds:[String],clueType:String,relevance:String},{_id:false});
const event = new mongoose.Schema({id:String,time:Date,description:String,suspectIds:[String],evidenceIds:[String]},{_id:false});
const model = new mongoose.Schema({name:String,promptVersion:String,attempts:Number,validatedAt:Date},{_id:false});
const schema = new mongoose.Schema({ownerSessionId:{type:String,required:true,index:true},title:{type:String,required:true},scenario:{type:String,required:true},difficulty:{type:String,enum:['easy','medium','hard'],required:true},status:{type:String,enum:['generating','ready','failed'],default:'ready'},briefing:String,incident:{type:mongoose.Schema.Types.Mixed},suspects:[suspect],evidence:[evidence],timeline:[event],solution:{culpritId:String,motive:String,explanation:String,evidenceIds:[String],suspectEliminations:[{suspectId:String,explanation:String,_id:false}]},generation:model,accusation:{suspectId:String,submittedAt:Date,correct:Boolean}},{timestamps:true});
schema.index({createdAt:1},{expireAfterSeconds:60*60*24*30});
export const CaseModel=mongoose.models.Case||mongoose.model('Case',schema);
