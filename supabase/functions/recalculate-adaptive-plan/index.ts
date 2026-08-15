import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const subjectName=(id:string)=>({math:"Matematika",physics:"Fizika",history:"Tarix",uzbek:"Ona tili",biology:"Biologiya",chemistry:"Kimyo",english:"Ingliz tili"}[id]??id);

function fallbackPlan(profile:any, mastery:any[]){
 const minutes=Math.max(20,Number(profile?.daily_study_minutes??45));
 const weak=[...mastery].sort((a,b)=>Number(a.mastery_score)-Number(b.mastery_score)).slice(0,4);
 const total=weak.reduce((s,x)=>s+Number(x.mastery_score),0); const avg=weak.length?total/weak.length:100;
 const plan=weak.length?weak.map((x,i)=>({subject:subjectName(x.subject_id),topic:x.topic,minutes:i===0?Math.round(minutes*.5):Math.max(10,Math.round(minutes*.5/(weak.length-1||1))),task:Number(x.mastery_score)<50?"Mavzuni qayta o'rganish + maqsadli savollar":Number(x.mastery_score)<75?"Aralash mashq va xatolar tahlili":"Tezkor mustahkamlash"})): [{subject:"INTIL",topic:"Boshlang'ich diagnostika",minutes,task:"Birinchi mashqlarni bajaring — AI keyin rejangizni moslashtiradi"}];
 return {title:"Moslashtirilgan AI reja",summary:`So'nggi natijalarga ko'ra reja yangilandi. Eng past mastery: ${Math.round(avg)}%.`,days:[{day:1,focus:weak[0]?`${subjectName(weak[0].subject_id)} · ${weak[0].topic}`:"Diagnostika",total_minutes:minutes,tasks:plan}],rules:["Eng past mastery mavzusi birinchi o'rinda.","Natijalar yangilanganda reja qayta hisoblanadi.","Faqat xato emas, vaqt sarfi ham kuzatiladi."]};
}

Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 try{
  const auth=req.headers.get("Authorization"); if(!auth)throw new Error("Unauthorized");
  const url=Deno.env.get("SUPABASE_URL")!,key=Deno.env.get("SUPABASE_ANON_KEY")!;
  const sb=createClient(url,key,{global:{headers:{Authorization:auth}}});
  const {data:{user}}=await sb.auth.getUser(); if(!user)throw new Error("Unauthorized");
  const {data:profile,error:pe}=await sb.from("student_profiles").select("*").eq("user_id",user.id).maybeSingle(); if(pe)throw pe;
  const {data:mastery,error:me}=await sb.from("topic_mastery").select("subject_id,topic,mastery_score,questions_seen,questions_correct,average_time_seconds,last_practiced_at").eq("user_id",user.id).order("mastery_score",{ascending:true}); if(me)throw me;
  const fallback=fallbackPlan(profile,mastery??[]);
  const apiKey=Deno.env.get("OPENAI_API_KEY"); let plan=fallback; let model="adaptive-fallback";
  if(apiKey){
   const prompt=`You are INTIL Adaptive AI. Replan ONE next study day using only the student's current data. Student profile: ${JSON.stringify(profile)}. Topic mastery sorted weakest first: ${JSON.stringify(mastery??[])}. Return ONLY JSON: {"title":string,"summary":string,"days":[{"day":1,"focus":string,"total_minutes":number,"tasks":[{"subject":string,"topic":string,"minutes":number,"task":string}]}],"rules":[string]}. Prioritize weak topics, recent performance, and time efficiency. Never invent scores or exam rules.`;
   const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:Deno.env.get("OPENAI_MODEL")??"gpt-4o-mini",temperature:.25,response_format:{type:"json_object"},messages:[{role:"system",content:"Return JSON only."},{role:"user",content:prompt}]})});
   if(r.ok){try{const d=await r.json();plan=JSON.parse(d.choices?.[0]?.message?.content??"");model=d.model??"openai";}catch{}}
  }
  const {data:saved,error:se}=await sb.from("study_plans").insert({user_id:user.id,title:plan.title??"Moslashtirilgan AI reja",summary:plan.summary??null,plan,model}).select("id,title,summary,plan,model,generated_at,updated_at").single(); if(se)throw se;
  return new Response(JSON.stringify(saved),{headers:{...corsHeaders,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:e instanceof Error?e.message:"Unknown error"}),{status:400,headers:{...corsHeaders,"Content-Type":"application/json"}})}
});
