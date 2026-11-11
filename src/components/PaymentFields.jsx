import {paymentMethods,paymentMethod,accountType,localClock} from '../../../shared/payments.js';
export function initialPayment(d={},fresh=false){const method=d.paymentMethod||(fresh?'Naqd':paymentMethod(d));return {...d,paymentMethod:method,accountType:accountType({...d,paymentMethod:method}),...(fresh?{time:localClock(),timezoneOffset:new Date().getTimezoneOffset()}: {})};}
export default function PaymentFields({data,set}){
 // Offered labels only. 'Cash' and 'Bank' are legacy: old records still show
 // as a disabled saved value, but new entries can no longer pick them.
 // 'Naqd' and 'Transfer' are labels only, like WeChat/Alipay — picking one
 // never posts to the cashbook or links a bank account.
 const methods=paymentMethods.filter(m=>!['Cash','Bank'].includes(m));
 function choose(v){set({...data,paymentMethod:v,accountType:'other',bankId:null})}
 return <label>Payment method<select aria-label="Payment method" value={data.paymentMethod} onChange={e=>choose(e.target.value)}>{['Cash','Bank'].includes(data.paymentMethod)&&<option value={data.paymentMethod} disabled>{data.paymentMethod} (saved entry)</option>}{methods.map(m=><option key={m}>{m}</option>)}</select></label>}
export function DateTimeFields({data,set,fresh=false,compact=false}){return <><div className="form-row"><label>Date<input required type="date" value={data.date} onChange={e=>set({...data,date:e.target.value})}/></label><label>Time<input aria-label="Time" required={fresh||!!data.time} type="time" inputMode="none" onClick={e=>{try{e.currentTarget.showPicker?.()}catch{}}} value={data.time||''} onChange={e=>{const next={...data,timezoneOffset:new Date().getTimezoneOffset()};if(e.target.value)next.time=e.target.value;else delete next.time;set(next)}}/></label></div>{!compact&&!fresh&&!data.time&&<p className="hint">Historical time was not recorded.</p>}{!compact&&<label>Reference (optional)<input maxLength={200} value={data.reference||''} onChange={e=>set({...data,reference:e.target.value})}/></label>}</>}
