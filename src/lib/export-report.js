import {saveBlob} from './download.js';
export async function exportReport(format,options,name='Multi-Khata-Statement') {
 if(format==='xlsx'){
   const {excelBlob}=await import('./excel.js');
   return saveBlob(name+'.xlsx',await excelBlob(options));
 }
 const {reportPDF}=await import('./report.js');
 const doc=reportPDF(options);
 return saveBlob(name+'.pdf',doc.output('blob'));
}
