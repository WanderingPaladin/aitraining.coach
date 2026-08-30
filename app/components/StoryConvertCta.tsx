import BookIntroCallButton from './BookIntroCallButton';

export default function StoryConvertCta() {
  return (
    <section className="story-convert">
      <div className="shell story-convert-inner">
        <h2>Does This Feel Familiar?</h2>
        <p>
          You don’t need to solve everything before talking to us. Whether you’re starting from zero, waiting for projects, or struggling to gain momentum, we can help you understand what to work on next.
        </p>
        <div className="hero-actions">
          <BookIntroCallButton href="/#apply" />
        </div>
        <p className="story-convert-note">Not sure where to start? That’s exactly what the intro call is for.</p>
        <p className="story-convert-note">Currently available to eligible U.S.-based participants.</p>
      </div>
    </section>
  );
}
