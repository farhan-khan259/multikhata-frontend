import React,{useState} from 'react';
import {it,expect} from 'vitest';
import {render,screen,within,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PartyLedger from '../src/components/PartyLedger';
import EntryForm from '../src/components/EntryForm';
HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};
it('PKR party accepts partial and full PKR payments, preserves history and reopens the debt after deleting payment',async()=>{
 const user=userEvent.setup(),party={id:crypto.randomUUID(),kind:'party',data:{name:'PKR Settlement Party',phone:''}};
 function Harness(){const [rows,setRows]=useState([{id:crypto.randomUUID(),kind:'entry',data:{partyId:party.id,currency:'PKR',direction:'given',amount:'280000',date:'2026-10-01',note:'Original PKR payment'}}]),[modal,setModal]=useState(null);return <><PartyLedger party={party} records={rows} entries={rows} onBack={()=>{}} onEditParty={()=>{}} onAdd={(direction,currency)=>setModal({direction,currency})} onEdit={()=>{}} onDelete={r=>setRows(old=>old.filter(x=>x.id!==r.id))} onPDF={()=>{}} onExcel={()=>{}} onWhatsApp={()=>{}}/>{modal&&<EntryForm parties={[party]} partyId={party.id} initialDirection={modal.direction} initialCurrency={modal.currency} onClose={()=>setModal(null)} onSave={async r=>setRows(old=>[...old,r])}/>}</>}
 render(<Harness/>);expect(screen.getByLabelText('Ledger currency').disabled).toBe(true);expect(screen.getByText('PKR 280,000.00',{selector:'.ledger-summary strong'})).toBeTruthy();
 await user.click(screen.getByRole('button',{name:'YOU GOT PKR'}));let dialog=screen.getByRole('dialog');expect(within(dialog).getByLabelText('Currency').value).toBe('PKR');await user.type(within(dialog).getByLabelText('Amount'),'140000');await user.type(within(dialog).getByLabelText(/Note/),'PKR partial payment');await user.click(within(dialog).getByRole('button',{name:'Save entry'}));await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());expect(screen.getByText('PKR 140,000.00',{selector:'.ledger-summary strong'})).toBeTruthy();
 await user.click(screen.getByRole('button',{name:'YOU GOT PKR'}));dialog=screen.getByRole('dialog');await user.type(within(dialog).getByLabelText('Amount'),'140000');await user.type(within(dialog).getByLabelText(/Note/),'PKR final payment');await user.click(within(dialog).getByRole('button',{name:'Save entry'}));await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());expect(screen.getByText('All settled')).toBeTruthy();expect(screen.getByText('PKR 280,000.00')).toBeTruthy();expect(screen.getByText('PKR final payment')).toBeTruthy();
 const last=screen.getByText('PKR final payment').closest('.ledger-entry');await user.click(within(last).getByRole('button',{name:'Delete entry'}));expect(screen.getByText('PKR 140,000.00',{selector:'.ledger-summary strong'})).toBeTruthy();
});
