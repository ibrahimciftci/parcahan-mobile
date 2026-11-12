import React, { createContext, useContext, useEffect, useState } from 'react';
import { request, session } from '@/services/api';
export type User = { id: number; firstName: string; lastName: string; email: string; role: 'CUSTOMER'|'SELLER'|'ADMIN'; createdAt: string };
type Ctx = { user: User|null; ready: boolean; message: string; setMessage: (s:string)=>void; login: (email:string,password:string)=>Promise<void>; register: (firstName:string,lastName:string,email:string,password:string)=>Promise<void>; logout: ()=>Promise<void>; refresh: ()=>Promise<void> };
const Context=createContext<Ctx|null>(null);
export function SessionProvider({children}:{children:React.ReactNode}){const [user,setUser]=useState<User|null>(null);const [ready,setReady]=useState(false);const [message,setMessage]=useState('');
 const refresh=async()=>{if(!await session.get()){setUser(null);return}try{setUser(await request<User>('/api/users/me'))}catch{await session.clear();setUser(null);setMessage('Oturum doğrulanamadı. Yeniden giriş yapın.')}};
 useEffect(()=>{refresh().finally(()=>setReady(true))},[]);
 const login=async(email:string,password:string)=>{const d=await request<{token:string;tokenType:string;expiresIn:number;user:User}>('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})});await session.save(d.token);setUser(d.user);setMessage('')};
 const register=async(firstName:string,lastName:string,email:string,password:string)=>{await request<User>('/api/auth/register',{method:'POST',body:JSON.stringify({firstName,lastName,email,password})});await login(email,password)};
 const logout=async()=>{await session.clear();setUser(null)};
 return <Context.Provider value={{user,ready,message,setMessage,login,register,logout,refresh}}>{children}</Context.Provider>}
export const useSession=()=>{const value=useContext(Context);if(!value)throw new Error('SessionProvider is missing');return value};
