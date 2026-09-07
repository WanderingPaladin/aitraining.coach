function escapePlain(value: string) {
  return value;
}

export default function FeedbackCard({
  categoryLabel,
  subcategoryLabel,
  message,
  sent = true,
}: {
  categoryLabel: string;
  subcategoryLabel?: string | null;
  message: string;
  sent?: boolean;
}) {
  return (
    <article className="chat-feedback-card">
      <p className="chat-feedback-kicker">Feedback</p>
      <p className="chat-feedback-topic">
        {subcategoryLabel ? <span className="chat-feedback-badge">{subcategoryLabel}</span> : null}
        <span>{categoryLabel}</span>
      </p>
      {message.trim() ? <p className="chat-feedback-quote">“{escapePlain(message.trim())}”</p> : null}
      {sent ? <p className="chat-feedback-sent">Sent</p> : null}
    </article>
  );
}
