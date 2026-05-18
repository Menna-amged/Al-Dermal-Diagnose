import { Modal } from './Modal';
import { Btn } from './Btn';

export function ConfirmModal({ title, message, onConfirm, onClose, variant='danger' }) {
  return (
    <Modal title={title} onClose={onClose} width={400}>
      <p style={{ fontSize:14, color:'#475569', lineHeight:1.7, marginBottom:24 }}>{message}</p>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant={variant} onClick={() => { onConfirm(); onClose(); }}>Confirm</Btn>
      </div>
    </Modal>
  );
}