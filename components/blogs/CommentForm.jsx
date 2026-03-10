"use client";

export default function CommentForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="comment-form form-submit"
    >
      <div className="form-wg group-ip">
        <fieldset>
          <label className="sub-ip">Name</label>
          <input
            type="text"
            className="form-control"
            name="text"
            placeholder="Your name"
            required
          />
        </fieldset>
        <fieldset>
          <label className="sub-ip">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            placeholder="Your email"
            required
          />
        </fieldset>
      </div>
      <fieldset className="form-wg">
        <label className="sub-ip">Review</label>
        <textarea
          id="comment-message"
          name="message"
          rows={4}
          tabIndex={4}
          placeholder="Write comment "
          aria-required="true"
          defaultValue={""}
        />
      </fieldset>
      <button
        className="form-wg tf-btn primary w-100"
        name="submit"
        type="submit"
      >
        <span>Post Comment</span>
      </button>
    </form>
  );
}
