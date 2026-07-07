import type { ActionMessage } from './types';

type YpodeigmaActionMessageProps = {
  message: ActionMessage;
};

function MessageIcon({ type }: { type: ActionMessage['type'] }) {
  if (type === 'success') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.6 7.8-5.2 5.9a1 1 0 0 1-1.5.1l-2.5-2.3 1.3-1.4 1.7 1.6 4.5-5.1Z" />
      </svg>
    );
  }

  if (type === 'error') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm3.7 12.3-1.4 1.4L12 13.4l-2.3 2.3-1.4-1.4 2.3-2.3-2.3-2.3 1.4-1.4 2.3 2.3 2.3-2.3 1.4 1.4-2.3 2.3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-6h2Zm0-8h-2V7h2Z" />
    </svg>
  );
}

export default function YpodeigmaActionMessage({ message }: YpodeigmaActionMessageProps) {
  const palette =
    message.type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : message.type === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-800'
        : 'border-sky-200 bg-sky-50 text-sky-800';

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${palette}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <MessageIcon type={message.type} />
        </div>
        <div>
          <p className="text-sm font-semibold">{message.title}</p>
          {message.description ? <p className="mt-1 text-sm opacity-90">{message.description}</p> : null}
        </div>
      </div>
    </div>
  );
}
