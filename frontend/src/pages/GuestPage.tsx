import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import { StatusBlock } from "../ui/StatusBlock";

export function GuestPage() {
  const { data: eventTypes, error, isLoading, reload } = useAsyncData(
    () => api.listEventTypes(),
    [],
  );

  return (
    <section className="stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Guest booking</p>
          <h1>Choose an event type and reserve a free slot.</h1>
          <p className="hero-copy">
            The UI reads event types and slot availability directly from the
            contract-backed API.
          </p>
        </div>
      </div>

      {isLoading ? (
        <StatusBlock
          title="Loading event types"
          message="Fetching available event types from the API."
        />
      ) : null}

      {error ? (
        <div className="stack">
          <StatusBlock
            tone="error"
            title="Failed to load event types"
            message={error.message}
          />
          <button className="button secondary" onClick={() => void reload()} type="button">
            Retry
          </button>
        </div>
      ) : null}

      {eventTypes ? (
        <div className="card-grid">
          {eventTypes.map((eventType) => (
            <article className="panel" key={eventType.id}>
              <p className="meta">{eventType.durationMinutes} min</p>
              <h2>{eventType.title}</h2>
              <p>{eventType.description}</p>
              <Link className="button" to={`/book/${eventType.id}`}>
                Continue
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
