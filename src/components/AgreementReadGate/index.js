import format from 'date-fns/format';
import AgreementScrollModal from '@/components/AgreementScrollModal';

const AgreementReadGate = ({
  title,
  buttonLabel,
  hasRead,
  readAt,
  modalOpen,
  onOpen,
  onClose,
  onAcknowledge,
  children,
}) => (
  <>
    <div
      className={`p-5 space-y-4 rounded border-2 ${
        hasRead ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'
      }`}
    >
      <div>
        <h3 className="text-base font-bold">
          {title} <span className="text-red-600">*</span>
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          {hasRead
            ? 'You have read this agreement. You may open it again to review.'
            : 'Please read the full agreement before continuing with media consent and signature.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="px-4 py-2 text-sm font-medium text-white rounded bg-primary-500 hover:bg-primary-400"
      >
        {buttonLabel}
      </button>
      {hasRead && readAt && (
        <p className="text-sm font-medium text-green-700">
          Read on {format(readAt, 'MMMM d, yyyy')}
        </p>
      )}
    </div>
    <AgreementScrollModal
      show={modalOpen}
      title={title}
      onClose={onClose}
      onAcknowledge={onAcknowledge}
    >
      {children}
    </AgreementScrollModal>
  </>
);

export default AgreementReadGate;
