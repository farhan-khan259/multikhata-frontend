import {postings} from '../../../shared/accounting.js';
import {minor} from './amount.js';
export {minor} from './amount.js';
export const currencies=['PKR'];
export const currencyInfo={PKR:{name:'Pakistani Rupee',symbol:'Rs',flag:'PK'}};
export function money(value){const n=typeof value==='bigint'?value:minor(value);const abs=n<0n?-n:n;return (n<0n?'-':'')+(abs/100n).toLocaleString('en-US')+'.'+String(abs%100n).padStart(2,'0');}
export const calculationLabel=data=>data.calculation?data.calculation+' = PKR '+money(data.amount):'';
export function balanceIndex(records){const result=new Map();for(const r of records){if(r.kind!=='entry'||r.deleted)continue;if(r.data.currency!=='PKR')throw new Error('Convert the legacy data to PKR before opening this khata.');const n=(r.data.direction==='given'?1n:-1n)*minor(r.data.amount);result.set(r.data.partyId,{PKR:(result.get(r.data.partyId)?.PKR||0n)+n});}return result;}
export function totals(records,partyId){const t={given:0n,received:0n,receivable:0n,payable:0n},balances=new Map();for(const r of records){if(r.kind!=='entry'||r.deleted||(partyId&&r.data.partyId!==partyId))continue;if(r.data.currency!=='PKR')throw new Error('Convert the legacy data to PKR before opening this khata.');const n=minor(r.data.amount);t[r.data.direction]+=n;balances.set(r.data.partyId,(balances.get(r.data.partyId)||0n)+(r.data.direction==='given'?n:-n));}for(const n of balances.values())t[n>=0n?'receivable':'payable']+=n>=0n?n:-n;return {PKR:t};}
export function accountTotals(records){const cash={received:0n,given:0n,balance:0n},bank={received:0n,given:0n,balance:0n},flow={received:0n,given:0n};for(const r of records){if(r.deleted)continue;for(const leg of postings(r)){const t=leg.account==='cash'?cash:bank;t.balance+=leg.in-leg.out;if(r.kind!=='transfer'){t.received+=leg.in;t.given+=leg.out}}if(['entry','bankentry','cashentry'].includes(r.kind))flow[['received','in'].includes(r.data.direction)?'received':'given']+=minor(r.data.amount);}return {cash,bank,flow};}
export const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
