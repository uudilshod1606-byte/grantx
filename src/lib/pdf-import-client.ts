/* Browser-side Gemini PDF question extraction. Gemini keys are supplied only to the admin UI. */

const MODEL = "gemini-2.5-flash";

export type ExtractedQuestion = {
  savol_turi:string; asosiy_matn:string; savol_matni:string;
  variant_a:string; variant_b:string; variant_c:string; variant_d:string; variant_e:string; variant_f:string;
  togri_javob:string; yechim:string; sahifa:number|null; rasm_bor:boolean;
  rasm_x:number|null; rasm_y:number|null; rasm_kengligi:number|null; rasm_balandligi:number|null;
};

const PROMPT = `Sen O'zbekiston imtihon savollarini raqamlashtiruvchi juda aniq PDF extraction yordamchisan.
Berilgan PDFdagi BARCHA haqiqiy savollarni to'liq ajratib ol. Matnni mazmunan o'zgartirma, qisqartirma va yangi ma'lumot o'ylab topma. FAQAT JSON massiv qaytar.
Har bir element: {"savol_turi":"yopiq|ochiq|moslashtirish|yozma","asosiy_matn":"","savol_matni":"","variant_a":"","variant_b":"","variant_c":"","variant_d":"","variant_e":"","variant_f":"","togri_javob":"","yechim":"","sahifa":1,"rasm_bor":false,"rasm_x":null,"rasm_y":null,"rasm_kengligi":null,"rasm_balandligi":null}.
Formulalarni [[LATEX: ...]] bilan yoz. Savol raqamini savol_matnidan olib tashla. Haqiqiy diagramma/grafik/chizma bo'lsa [RASM: qisqa tavsif] qo'y, rasm_bor=true va tight bounding box koordinatalarini 0-100% ber. Sof matn, formula yoki oddiy jadvalni rasm deb belgilama. Javob kaliti bo'lmasa togri_javob bo'sh va yechim "TEKSHIRISH KERAK" bo'lsin. FAQAT JSON qaytar.`;

const stripFences=(s:string)=>s.replace(/^\s*```(?:json)?/i,"").replace(/```\s*$/i,"").trim();
const parseLoose=(raw:string)=>{const s=stripFences(raw),a=s.indexOf("["),b=s.lastIndexOf("]");const body=a>=0&&b>a?s.slice(a,b+1):s;for(const x of [body,body.replace(/\\(?!["\\/bfnrtu])/g,"\\\\")]){try{return JSON.parse(x)}catch{}}throw new Error("AI JSONini o'qib bo'lmadi")};
const str=(v:unknown)=>typeof v==="string"?v.trim():v==null?"":String(v).trim();
const clean=(v:unknown)=>str(v).replace(/\s*\[RASM:\s*[^\]]*\]\s*/gi," ").replace(/\s{2,}/g," ").trim().replace(/\[\[\s*LATEX\s*:\s*([\s\S]*?)\]\]/gi,"[[LATEX: $1]]");

async function callGemini(url:string,body:RequestInit,keys:string[]){let last:Response|null=null;for(const key of keys){for(let attempt=0;attempt<2;attempt++){const r=await fetch(url,bodyFor(body,key));last=r;if(r.status!==429&&r.status!==503)return r;await new Promise(x=>setTimeout(x,600*(attempt+1)));}}return last as Response;}
function bodyFor(base:RequestInit,key:string):RequestInit{return{...base,headers:{...(base.headers as Record<string,string>),"x-goog-api-key":key}}}

export async function extractQuestionsFromPdf(input:{fileBase64:string;mimeType?:string;apiKeys:string[]}):Promise<ExtractedQuestion[]>{
  if(!input.fileBase64)throw new Error("Fayl bo'sh");
  if(input.fileBase64.length>25_000_000)throw new Error("PDF hajmi juda katta. Faylni bo'lib yuboring.");
  const keys=[...new Set((input.apiKeys??[]).map(x=>x.trim()).filter(Boolean))];if(!keys.length)throw new Error("GEMINI_API_KEY sozlanmagan");
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const base:RequestInit={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:PROMPT},{inline_data:{mime_type:input.mimeType||"application/pdf",data:input.fileBase64}}]}],generationConfig:{responseMimeType:"application/json",media_resolution:"MEDIA_RESOLUTION_MEDIUM"}})};
  const res=await callGemini(url,base,keys);if(!res.ok){const t=await res.text();let msg=t.slice(0,400);try{const j=JSON.parse(t);msg=j.error?.message??j.message??msg}catch{};throw new Error(`PDF AI xatosi (${res.status}): ${msg}`)}
  const j=await res.json();const content=j.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text??"").join("")??"";if(!content)throw new Error("AI bo'sh javob qaytardi");const parsed=parseLoose(content);if(!Array.isArray(parsed))throw new Error("AI JSON massiv qaytarmadi");
  return parsed.flatMap((r:Record<string,unknown>)=>{const q:ExtractedQuestion={savol_turi:str(r.savol_turi),asosiy_matn:clean(r.asosiy_matn),savol_matni:clean(r.savol_matni),variant_a:clean(r.variant_a),variant_b:clean(r.variant_b),variant_c:clean(r.variant_c),variant_d:clean(r.variant_d),variant_e:clean(r.variant_e),variant_f:clean(r.variant_f),togri_javob:clean(r.togri_javob),yechim:clean(r.yechim),sahifa:Number.isFinite(Number(r.sahifa))?Number(r.sahifa):null,rasm_bor:Boolean(r.rasm_bor),rasm_x:r.rasm_x==null?null:Number(r.rasm_x),rasm_y:r.rasm_y==null?null:Number(r.rasm_y),rasm_kengligi:r.rasm_kengligi==null?null:Number(r.rasm_kengligi),rasm_balandligi:r.rasm_balandligi==null?null:Number(r.rasm_balandligi)};return[q]});
}
