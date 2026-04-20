import { useTranslation } from "react-i18next";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { InlineMessage } from "../components/common/InlineMessage";

export function AppErrorFallback() {
  const { t } = useTranslation();

  return (
    <main className="page">
      <div className="page-shell">
        <Card as="section" elevated>
          <InlineMessage
            title={t("states.appCrashTitle")}
            message={t("states.appCrashMessage")}
            tone="error"
          >
            <Button onClick={() => window.location.reload()}>{t("common.refresh")}</Button>
          </InlineMessage>
        </Card>
      </div>
    </main>
  );
}
