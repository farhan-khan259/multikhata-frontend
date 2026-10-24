import {paymentMethod,savedTime,directionLabel} from '../../../shared/payments.js';
import ExcelJS from 'exceljs';
import {money} from './money.js';
export const XLSX_MIME='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const numberFormat='#,##0.00;[Red](#,##0.00);"–"';
// Excel guarantees 15 significant decimal digits. Preserve larger exact money
// values as text rather than silently rounding financial data.
function amount(value) {const abs=value<0n?-value:value;return abs<=999999999999999n?Number(value)/100:money(value).replaceAll(',','');}
export function reportWorkbook({business,phone='',title='Statement',currency='PKR',from='',to='',statement,generatedAt=new Date()},book=new ExcelJS.Workbook()) {
 book.creator='Multi Khata';book.created=generatedAt;
 const name=(currency+' Statement').slice(0,31);
 const sheet=book.addWorksheet(name,{views:[{state:'frozen',ySplit:10,showGridLines:false}],pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,printTitlesRow:'1:10'},headerFooter:{oddFooter:'Multi Khata | &P of &N'}});
 sheet.columns=[{width:7},{width:15},{width:46},{width:22},{width:22},{width:23},{width:23},{width:28}];
 const merge=(row,start,end,value)=>{sheet.mergeCells(row,start,row,end);sheet.getCell(row,start).value=value;};
 merge(1,1,8,business||'My Business');sheet.getRow(1).height=30;
 sheet.getCell('A1').font={name:'Calibri',bold:true,size:18,color:{argb:'FFFFFFFF'}};
 sheet.getCell('A1').fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF166534'}};
 merge(2,1,8,phone||'Multi Khata · Business statement');
 merge(3,1,8,title);sheet.getCell('A3').font={name:'Calibri',bold:true,size:15};
 merge(4,1,8,`${from||'Beginning'} to ${to||'Latest'} | ${currency} | Generated ${generatedAt.toISOString().slice(0,19)} UTC`);
 sheet.getRow(5).height=30;
 sheet.getRow(5).values=['Total IN',amount(statement.totalIn),'Total OUT',amount(statement.totalOut),'Opening',amount(statement.opening),'Closing',amount(statement.closing)];
 [1,3,5,7].forEach(c=>sheet.getCell(5,c).alignment={wrapText:true,vertical:'middle'});
 [2,4,6,8].forEach(c=>{sheet.getCell(5,c).numFmt=numberFormat;sheet.getCell(5,c).font={bold:true,size:12};});
 merge(6,1,8,`PKR IN: ${money(statement.totalIn)} | PKR OUT: ${money(statement.totalOut)}`);
 merge(7,1,8,statement.party?'Party closing: positive = you will give; negative = you will get.':'Cash excludes bank payments. Bank includes linked party payments and direct bank entries.');
 merge(8,1,8,'Balances = opening + IN − OUT. Very large exact amounts are text to preserve precision in Excel.');
 merge(9,1,8,`Entries: ${statement.rows.length} | Currency: PKR`);
 sheet.getRow(10).values=['#','Date','Party / Details','Total IN','Total OUT','Balance','Calculation','Payment method'];
 sheet.getRow(10).height=28;
 sheet.getRow(10).eachCell(c=>{c.font={bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF166534'}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};});
 for(const [i,r]of statement.rows.entries()){
   const d=r.record.data,row=sheet.addRow([i+1,new Date(r.date+'T'+(d.time||'00:00')+':00Z'),r.note+'\n'+(r.direction||directionLabel(d))+' · '+savedTime(d)+' · Account: '+(r.account||d.bankId||'cash')+(d.reference?' · '+d.reference:''),r.in?amount(r.in):null,r.out?amount(r.out):null,amount(r.balance),d.calculation||'',paymentMethod(d)]);
   row.height=60;row.getCell(2).numFmt=d.time?'yyyy-mm-dd hh:mm':'yyyy-mm-dd';
   row.getCell(3).alignment={wrapText:true,vertical:'middle'};
   [4,5,6].forEach(c=>{row.getCell(c).numFmt=numberFormat;row.getCell(c).alignment={horizontal:'right',vertical:'middle'};});
   row.getCell(7).alignment={wrapText:true,vertical:'middle'};
   row.getCell(4).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFE6FCEF'}};
   row.getCell(5).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFEDED'}};
 }
 const end=10+statement.rows.length;
 sheet.autoFilter={from:'A10',to:`H${Math.max(10,end)}`};
 const foot=sheet.addRow([null,null,null,amount(statement.totalIn),amount(statement.totalOut),amount(statement.closing),null,null]);
 sheet.mergeCells(foot.number,1,foot.number,3);foot.getCell(1).value='Grand total';
 foot.eachCell({includeEmpty:true},c=>{c.font={bold:true};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF1F2F4'}};c.numFmt=numberFormat;});
 sheet.pageSetup.printArea=`A1:H${foot.number}`;
 return book;
}
export async function excelBlob(options) {
 const reports=Array.isArray(options)?options:[options];
 const book=new ExcelJS.Workbook();
 for(const report of reports)reportWorkbook(report,book);
 return new Blob([await book.xlsx.writeBuffer()],{type:XLSX_MIME});
}
