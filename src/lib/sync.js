import {pending,acknowledge,mergeRemote,readAll,ensureEpoch} from './db.js';
import {api} from './api.js';
let active,activeKey;
export function sync(session){const key=session.user.id+':'+(session.user.dataEpoch||0);if(active){if(activeKey===key)return active;return active.catch(()=>{}).then(()=>sync(session));}activeKey=key;active=run(session).finally(()=>{active=null;activeKey=null});return active;}
async function run(session){if(session.demo)throw new Error('Demo is local only. Sign in to sync your own ledger.');if(!navigator.onLine)throw new Error('You are offline. Changes are saved on this device.');
 // Send each snapshot once. Concurrent edits remain queued with the acknowledged revision.
 await ensureEpoch(session.user.id,session.user.dataEpoch||0);
 const rank=r=>['party','bank','profile'].includes(r.kind)?0:1;const queue=(await pending(session.user.id)).sort((a,b)=>rank(a)-rank(b));
 for(let i=0;i<queue.length;i+=100){const batch=queue.slice(i,i+100),operations=batch.map(({key,user,...o})=>o),{results}=await api('/sync',{operations,epoch:session.user.dataEpoch||0},session.token);for(const sent of batch){const result=results.find(r=>r.opId===sent.opId);if(!result)throw new Error('Incomplete server response. Retry sync.');await acknowledge(session.user.id,sent,result);}}
 const {records}=await api('/records',null,session.token);await mergeRemote(session.user.id,records);
 const all=await readAll(session.user.id);const conflicts=all.filter(r=>r.conflict).length;return {conflicts,pending:(await pending(session.user.id)).length};
}
export async function settleSync(){if(active)try{await active}catch{}}
