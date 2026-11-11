import React from 'react';
import 'fake-indexeddb/auto';
import {it,expect,vi} from 'vitest';
import {render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccountEntryForm from '../src/components/AccountEntryForm';
import Banks from '../src/components/Banks';
import Cashbook from '../src/components/Cashbook';
import App from '../src/App';
HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};

const bank={id:crypto.randomUUID(),kind:'bank',data:{name:'ABL',currency:'PKR',label:'Business'}};
const bankEntry={id:crypto.randomUUID(),kind:'bankentry',data:{bankId:bank.id,direction:'out',currency:'PKR',amount:'5000.00',date:'2026-11-08',note:'Bank\nnote line 2',paymentMethod:'Bank',accountType:'bank'}};
const cashEntry={id:crypto.randomUUID(),kind:'cashentry',data:{direction:'in',currency:'PKR',amount:'2000.00',date:'2026-11-08',note:'Cash note',paymentMethod:'Cash',accountType:'cash'}};

it('cash/bank entry form matches the party form: multiline note, direction-coloured save, yellow delete',async()=>{
  const user=userEvent.setup(),onDelete=vi.fn(),onSave=vi.fn();
  // Money paid (out) -> red save, like You Give.
  const {unmount}=render(<AccountEntryForm record={bankEntry} banks={[bank]} onSave={onSave} onClose={()=>{}} onDelete={onDelete}/>);
  const dialog=screen.getByRole('dialog');
  expect(within(dialog).getByLabelText('Note').tagName).toBe('TEXTAREA');
  expect(within(dialog).getByLabelText('Note')).toHaveProperty('rows',3);
  const saveOut=within(dialog).getByRole('button',{name:'Save bank entry'});
  expect(saveOut.className).toContain('red');
  await user.click(within(dialog).getByRole('button',{name:'Delete entry'}));
  expect(onDelete).toHaveBeenCalledWith(bankEntry);
  unmount();
  // Money received (in) -> green (primary) save, like You Got.
  const second=render(<AccountEntryForm record={cashEntry} banks={[bank]} onSave={onSave} onClose={()=>{}} onDelete={onDelete}/>);
  const dialog2=screen.getByRole('dialog');
  const saveIn=within(dialog2).getByRole('button',{name:'Save cash entry'});
  expect(saveIn.className).toContain('primary');
  expect(saveIn.className).not.toContain('red');
  second.unmount();
});

it('bank transaction rows open the edit form on row click, with no pencil/trash buttons',async()=>{
  const user=userEvent.setup(),onDelete=vi.fn();
  const {unmount}=render(<Banks records={[bank,bankEntry]} onSave={()=>{}} onDelete={onDelete} onEditEntry={()=>{}} onReport={()=>{}}/>);
  await user.click(screen.getByRole('button',{name:/Open bank khata/}));
  expect(screen.queryByRole('button',{name:'Edit bank entry'})).toBeTruthy();
  expect(screen.queryByRole('button',{name:'Delete bank entry'})).toBeNull();
  await user.click(screen.getByRole('button',{name:'Edit bank entry'}));
  const dialog=await screen.findByRole('dialog');
  expect(within(dialog).getByRole('button',{name:'Delete entry'})).toBeTruthy();
  await user.click(within(dialog).getByRole('button',{name:'Delete entry'}));
  expect(onDelete).toHaveBeenCalledWith(bankEntry);
  unmount();
});

it('cashbook rows open the edit form on row click, with no pencil/trash buttons',async()=>{
  const user=userEvent.setup();
  const {unmount}=render(<Cashbook records={[cashEntry]} onSave={()=>{}} onDelete={()=>{}} onEditEntry={()=>{}} onReport={()=>{}}/>);
  expect(screen.queryByRole('button',{name:'Edit cash entry'})).toBeTruthy();
  expect(screen.queryByRole('button',{name:'Delete cash entry'})).toBeNull();
  await user.click(screen.getByRole('button',{name:'Edit cash entry'}));
  const dialog=await screen.findByRole('dialog');
  expect(within(dialog).getByLabelText('Note').tagName).toBe('TEXTAREA');
  unmount();
});

it('web entries table rows open the edit form on row click, like the party ledger',async()=>{
  const user=userEvent.setup();
  const {unmount}=render(<App/>);
  await user.click(screen.getByRole('button',{name:/Explore sample khata/}));
  await screen.findByRole('heading',{name:/Your khata, at a glance/});
  const matches=await screen.findAllByText('Stock payment');
  const row=matches[0].closest('tr');
  expect(row.className).toContain('clickable-row');
  await user.click(row);
  const dialog=await screen.findByRole('dialog');
  expect(within(dialog).getByRole('button',{name:'Save entry'})).toBeTruthy();
  expect(within(dialog).getByRole('button',{name:'Delete entry'})).toBeTruthy();
  unmount();
});
