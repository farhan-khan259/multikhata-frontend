import {Delete} from 'lucide-react';
import {useRef} from 'react';
import {calculateAmount,minor} from '../lib/amount';
import {money} from '../lib/money';
const operator=/^[+−×÷]$/;
function appendKey(value,key){
 if(key==='AC')return '';
 const last=value.slice(-1);
 if(operator.test(key)){
  if(!value||value==='−')return key==='−'?'−':value;
  return operator.test(last)?value.slice(0,-1)+key:value.replace(/\.$/,'')+key;
 }
 if(key==='%')return /\d$/.test(value)?value+key:value;
 if(last==='%')return value;
 const operand=value.split(/[+−×÷]/).at(-1);
 if(key==='.')return operand.includes('.')?value:value+(operand?'.':'0.');
 return operand==='0'?value.slice(0,-1)+key:value+key;
}
// One calculator everywhere (v1.5.10): the same full keypad the mobile app
// uses (M+, M-, backspace, %, =, Enter-to-save). It used to appear only
// inside the Android app (window.KhataDownloads); the web dialog had a
// smaller 15-key keypad instead. Same keys, same behaviour, web + mobile.
const KEYS=['AC','M+','M−','⌫','%','÷','×','−','7','8','9','+','4','5','6','=','1','2','3','↵','0','.'];
export default function Calculator({value,onChange}){const memory=useRef(0n);let result;try{result=calculateAmount(value)}catch{}function press(k,e){if(k==='↵'){e.currentTarget.form?.requestSubmit();return}if(k==='⌫'){onChange(value.slice(0,-1));return}if(k==='='){if(result)onChange(result.amount);return}if(k==='M+'||k==='M−'){if(result)memory.current+=(k==='M+'?1n:-1n)*minor(result.amount);else if(!value&&memory.current){const n=memory.current<0n?-memory.current:memory.current;onChange((memory.current<0n?'−':'')+n/100n+'.'+String(n%100n).padStart(2,'0'))}return}onChange(appendKey(value,k))}return <div className="calculator native-calculator"><output aria-live="polite">{result?'= PKR '+money(result.amount):'PKR amount'}</output><div className="calculator-keys">{KEYS.map(k=><button key={k} className={k==='↵'?'calculator-enter':k==='0'?'calculator-zero':k==='AC'?'calculator-clear':''} data-operator={!/^[0-9.]$/.test(k)?true:undefined} type="button" aria-label={'Calculator '+k} onClick={e=>press(k,e)}>{k==='⌫'?<Delete aria-hidden="true" size={24}/>:k}</button>)}</div></div>}
