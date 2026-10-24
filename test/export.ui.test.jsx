import React from 'react';
import {it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
vi.mock('../src/lib/export-report',()=>({exportReport:vi.fn().mockResolvedValue(undefined)}));
import {exportReport} from '../src/lib/export-report';
import Reports from '../src/components/Reports';
it('Excel action respects party, currency and date range including opening balance',async()=>{
 const user=userEvent.setup(),id=crypto.randomUUID();
 const row=(amount,date)=>({id:crypto.randomUUID(),kind:'entry',data:{partyId:id,currency:'PKR',direction:'received',amount,calculation:'',date,note:'Payment'}});
 render(<Reports records={[{id,kind:'party',data:{name:'FX Party'}},row('28000','2026-10-01'),row('14000','2026-10-02')]} business={{name:'HM'}} profile={{businessName:'HM'}} initialParty={id}/>);
 expect(screen.getByLabelText('Currency').value).toBe('PKR');fireEvent.change(screen.getByLabelText('From date'),{target:{value:'2026-10-02'}});
 await user.click(screen.getByRole('button',{name:'Download Excel report'}));await waitFor(()=>expect(exportReport).toHaveBeenCalled());
 const [format,options]=exportReport.mock.calls[0];expect(format).toBe('xlsx');expect(options.currency).toBe('PKR');expect(options.statement.opening).toBe(2800000n);expect(options.statement.rows.length).toBe(1);expect(options.statement.rows[0].record.data.currency).toBe('PKR');expect(options.statement.closing).toBe(4200000n);
});
