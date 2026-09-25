"use client";
// Step 4: everything the scan will use, in one list, each row with a way back to fix it. Starting the scan
// hands over to Home, which shows its progress.
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { startAnalysisAction } from "@/app/(onboarding)/onboarding/actions";
import { bookingPlatformName } from "@/shared/constants/booking-platforms";
import { GOOGLE_PROVIDERS } from "@/shared/types/onboarding";
import type { StepProps, WizardStep } from "./onboarding-wizard";
import { StepHeading, WizardFooter } from "./wizard-parts";
import styles from "./onboarding-wizard.module.css";

type ReviewRow = { id: string; label: string; value: string; isMissing: boolean; editStep: WizardStep };

export function StepReview({ state, copy, setError, goTo }: StepProps) {
  const text = copy.review;
  const router = useRouter();
  const [isStarting, startTransition] = useTransition();

  const start = () =>
    startTransition(async () => {
      const result = await startAnalysisAction();
      if (result.scanId) router.push("/dashboard");
      else setError(result.error);
    });

  return (
    <section className={styles.step} aria-labelledby="step-review">
      <StepHeading id="step-review" title={text.heading} intro={text.intro} />

      <dl className={styles.review}>
        {reviewRows(state, copy).map((row) => (
          <div key={row.id} className={styles.reviewRow}>
            <dt className={styles.sectionLabel}>{row.label}</dt>
            <dd className={styles.reviewValue} data-missing={row.isMissing}>
              {row.value}
            </dd>
            <dd className={styles.reviewEdit}>
              <button
                type="button"
                className={styles.textButton}
                onClick={() => goTo(row.editStep)}
                aria-label={`${text.edit} ${row.label}`}
              >
                {text.edit}
              </button>
            </dd>
          </div>
        ))}
      </dl>

      <WizardFooter
        back={{ label: copy.nav.back, onClick: () => goTo(3) }}
        primary={{
          label: isStarting ? text.starting : text.start,
          onClick: start,
          disabled: !state.canStartAnalysis,
          isBusy: isStarting,
        }}
      />
    </section>
  );
}

function reviewRows(state: StepProps["state"], copy: StepProps["copy"]): ReviewRow[] {
  const text = copy.review;
  const profile = state.profile;
  const businessType = state.businessTypes.find((type) => type.id === profile?.businessTypeId)?.name ?? null;
  const address = state.address;

  const joinOr = (items: readonly string[] | undefined) =>
    items && items.length > 0 ? items.join(", ") : text.notAdded;

  const googleRows = GOOGLE_PROVIDERS.map((provider): ReviewRow => {
    const connection = state.connections.find((candidate) => candidate.provider === provider);
    const isConnected = connection?.status === "connected";
    return {
      id: provider,
      label: text.rows[provider],
      value: isConnected ? (connection?.accountLabel ?? copy.bookings.connected) : text.notConnected,
      isMissing: !isConnected,
      editStep: 2,
    };
  });

  const bookingParts = [
    state.bookingPlatformId ? bookingPlatformName(state.bookingPlatformId) : null,
    state.bookingImport ? `${state.bookingImport.fileName} (${state.bookingImport.rowCount} rows)` : null,
  ].filter((part): part is string => part !== null);

  return [
    { id: "website", label: text.rows.website, value: state.websiteUrl ?? text.notAdded, isMissing: !state.websiteUrl, editStep: 1 },
    { id: "type", label: text.rows.businessType, value: businessType ?? text.notAdded, isMissing: !businessType, editStep: 1 },
    { id: "services", label: text.rows.services, value: joinOr(profile?.services), isMissing: !profile?.services.length, editStep: 1 },
    { id: "segments", label: text.rows.segments, value: joinOr(profile?.segments), isMissing: !profile?.segments.length, editStep: 1 },
    {
      id: "location",
      label: text.rows.location,
      value: address
        ? [address.street, address.city, address.region, address.postalCode].filter(Boolean).join(", ")
        : text.notAdded,
      isMissing: !address,
      editStep: 2,
    },
    ...googleRows,
    {
      id: "bookings",
      label: text.rows.bookings,
      value: bookingParts.length > 0 ? bookingParts.join(" · ") : text.skipped,
      isMissing: bookingParts.length === 0,
      editStep: 3,
    },
  ];
}
