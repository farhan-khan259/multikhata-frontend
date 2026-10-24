import 'fake-indexeddb/auto';
import {openDB} from 'idb';
import {test} from 'node:test';
import assert from 'node:assert/strict';
test('upgrading v2 offline data adds indexes and converts saved-rate entries while archiving originals',async()=>{
 const old=await openDB('multi-khata-v1',2,{upgrade(d){d.createObjectStore('records',{keyPath:'key'});d.createObjectStore('outbox',{keyPath:'key'});d.createObjectStore('meta',{keyPath:'user'});}});
 const row={key:'legacy:entry',user:'legacy',id:crypto.randomUUID(),kind:'entry',data:{currency:'USDT',partyId:crypto.randomUUID(),direction:'given',date:'2026-10-17',exchangeRate:'280',amount:'100'},dirty:true};
 await old.put('records',row);await old.put('outbox',{...row,opId:crypto.randomUUID()});old.close();
 const {db,readAll,pending}=await import('../src/lib/db.js');
 assert.equal((await readAll('legacy'))[0].data.amount,'28000.00');assert.equal((await readAll('legacy'))[0].data.currency,'PKR');assert.equal((await (await db()).get('meta','legacy')).pkrUpgradeBackup[0].data.exchangeRate,'280');assert.equal((await pending('legacy')).length,1);assert.equal((await readAll('other')).length,0);
 const current=await db();assert.equal(current.version,3);assert.ok(current.transaction('records').store.indexNames.contains('user'));
});
