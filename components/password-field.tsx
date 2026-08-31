"use client"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
export function PasswordField({name,label,autoComplete="current-password"}:{name:string;label:string;autoComplete?:string}){
 const [show,setShow]=useState(false); return <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400">{label}</span><div className="relative"><input name={name} type={show?"text":"password"} required autoComplete={autoComplete} className="h-12 w-full rounded-xl border border-white/10 bg-[#070B15] px-4 pr-12 outline-none transition-all focus:border-cyan-300/50"/><button type="button" onClick={()=>setShow(v=>!v)} aria-label={show?"Sembunyikan password":"Lihat password"} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-cyan-300">{show?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div></label>
}
