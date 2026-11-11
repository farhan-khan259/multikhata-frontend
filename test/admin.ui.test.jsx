import React from 'react';
import {it,expect,vi} from 'vitest';
import {render,screen,within,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
vi.mock('../src/lib/api',()=>({api:vi.fn()}));
import {api} from '../src/lib/api';
import SuperAdmin from '../src/components/SuperAdmin';
import ChangePassword from '../src/components/ChangePassword';
HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};
it('super admin creates an account and receives credentials, then suspends it',async()=>{
 const user=userEvent.setup(),accounts=[{id:'owner',name:'Owner',email:'admin@example.com',role:'superadmin',status:'active'}];
 api.mockImplementation(async(path,body,token,method)=>{
  if(path==='/admin/accounts'&&!body)return {accounts:[...accounts]};
  if(path==='/admin/accounts'){const account={id:'new',name:body.name,email:body.email,role:'user',status:'active',mustChangePassword:true};accounts.push(account);return {user:account};}
  accounts[1].status=body.status;return {user:accounts[1]};
 });
 const view=render(<SuperAdmin session={{token:'admin-token',user:{name:'Owner'}}} onLogout={()=>{}}/>);
 await user.click(screen.getByRole('button',{name:'Create account'}));
 let dialog=screen.getByRole('dialog');await user.type(within(dialog).getByLabelText('Business / user name'),'HM Traders');await user.type(within(dialog).getByLabelText('Email address'),'hm@example.com');
 const temporary=within(dialog).getByLabelText('Temporary password').value;expect(temporary.length).toBeGreaterThanOrEqual(10);
 await user.click(within(dialog).getByRole('button',{name:'Create account'}));
 await screen.findByRole('heading',{name:'Login details are ready'});
 expect(within(screen.getByRole('dialog')).getByLabelText('Temporary password').value).toBe(temporary);
 await user.click(screen.getByRole('button',{name:'Done'}));await screen.findByText('hm@example.com');
 await user.click(screen.getByRole('button',{name:'Suspend'}));await user.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Confirm'}));
 await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/accounts/new',{status:'suspended'},'admin-token','PATCH'));
 expect(await screen.findByText('Suspended')).toBeTruthy();view.unmount();
});
it('first-login password form refuses mismatched confirmation and saves matching credentials',async()=>{
 const user=userEvent.setup(),onSession=vi.fn();api.mockResolvedValue({token:'new',user:{mustChangePassword:false}});
 render(<ChangePassword session={{token:'old'}} onSession={onSession} onLogout={()=>{}}/>);
 await user.type(screen.getByLabelText('Temporary / current password'),'Temp-password-123');await user.type(screen.getByLabelText('New password'),'New-password-123');await user.type(screen.getByLabelText('Confirm new password'),'Wrong-password-123');
 await user.click(screen.getByRole('button',{name:'Set password & continue'}));expect(screen.getByRole('alert').textContent).toContain('do not match');
 await user.clear(screen.getByLabelText('Confirm new password'));await user.type(screen.getByLabelText('Confirm new password'),'New-password-123');await user.click(screen.getByRole('button',{name:'Set password & continue'}));
 await waitFor(()=>expect(onSession).toHaveBeenCalled());
});
