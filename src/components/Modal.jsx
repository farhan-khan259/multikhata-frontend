import {X} from 'lucide-react';
import {useEffect,useRef} from 'react';
import './Modal.css';
export default function Modal({title,subtitle,onClose,children}){const ref=useRef(null);useEffect(()=>{const previous=document.activeElement;ref.current.showModal();return()=>{previous?.focus?.()};},[]);return <dialog ref={ref} className="modal" onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><header><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><button className="icon-button" aria-label="Close" onClick={onClose}><X size={20}/></button></header>{children}</dialog>}
