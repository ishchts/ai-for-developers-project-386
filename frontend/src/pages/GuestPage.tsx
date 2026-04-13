import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EventTypeGrid } from "../components/booking/EventTypeGrid";
import { Button } from "../components/common/Button";
import { InlineMessage } from "../components/common/InlineMessage";
import { SectionIntro } from "../components/common/SectionIntro";
import { Skeleton } from "../components/common/Skeleton";
import { api } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";

export function GuestPage() {
  const { t } = useTranslation();
  const { data: eventTypes, error, isLoading, reload } = useAsyncData(
    () => api.listEventTypes(),
    [],
  );

  return (
    <section className="stack">
      <div className="hero-card stack">
        <SectionIntro
          eyebrow={t("guest.eyebrow")}
          subtitle={t("guest.subtitle")}
          title={t("guest.title")}
        />
      </div>

      {isLoading ? (
        <div aria-label={t("guest.loadingTitle")} className="event-card-grid">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : null}

      {error ? (
        <div className="stack">
          <InlineMessage message={error.message} title={t("guest.errorTitle")} tone="error" />
          <Button onClick={() => void reload()} variant="secondary">
            {t("common.retry")}
          </Button>
        </div>
      ) : null}

      {eventTypes?.length ? <EventTypeGrid eventTypes={eventTypes} /> : null}

      {!isLoading && !error && eventTypes && !eventTypes.length ? (
        <InlineMessage
          message={t("guest.emptyMessage")}
          title={t("guest.emptyTitle")}
        >
          <Link className="button button-secondary" to="/admin">
            {t("nav.admin")}
          </Link>
        </InlineMessage>
      ) : null}
    </section>
  );
}
