"use client";
// All locations: one card per location with its score and top opportunity, then a form to add one.
import { MapPin, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useTransition } from "react";
import { addLocationAction, switchLocationAction, type AddLocationState } from "@/app/(app)/locations-actions";
import { PageHeader } from "@/frontend/components/app/page-header";
import { Panel } from "@/frontend/components/app/panel";
import type { LocationsCopy } from "@/frontend/copy/locations";
import type { LocationsOverview as Overview, LocationSummary } from "@/shared/types/location";
import styles from "@/frontend/components/app/data.module.css";
import local from "./locations-overview.module.css";

const initial: AddLocationState = { error: null };

export function LocationsOverview({ overview, copy }: { overview: Overview; copy: LocationsCopy }) {
  const [state, formAction, isPending] = useActionState(addLocationAction, initial);

  return (
    <div className={styles.page}>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        action={
          overview.averageGrowth !== null ? (
            <p className={styles.meta}>{copy.average.replace("{score}", String(overview.averageGrowth))}</p>
          ) : undefined
        }
      />

      <div className={local.cards}>
        {overview.locations.map((location) => (
          <LocationCard key={location.id} location={location} copy={copy} />
        ))}
      </div>

      <Panel title={copy.add.heading}>
        <p className={styles.intro}>{copy.add.intro}</p>
        {state.error && (
          <p role="alert" className={local.error}>
            {state.error}
          </p>
        )}
        <form action={formAction} className={local.form}>
          {(["street", "city", "region", "postalCode"] as const).map((field) => (
            <label key={field} className={local.field} data-field={field}>
              <span>{copy.add[field]}</span>
              <input name={field} className={styles.input} required={field === "city" || field === "region"} />
            </label>
          ))}
          <button type="submit" className={styles.button} data-variant="primary" disabled={isPending}>
            {isPending ? copy.add.submitting : copy.add.submit}
          </button>
        </form>
      </Panel>
    </div>
  );
}

function LocationCard({ location, copy }: { location: LocationSummary; copy: LocationsCopy }) {
  const router = useRouter();
  const [isOpening, startOpen] = useTransition();
  const open = () =>
    startOpen(async () => {
      await switchLocationAction(location.id);
      router.push("/dashboard");
      router.refresh();
    });

  return (
    <article className={local.card} data-active={location.isActive}>
      <header className={local.cardHead}>
        <h2 className={local.cardTitle}>
          <MapPin aria-hidden size={16} />
          {location.label}
        </h2>
        {location.isActive && (
          <span className={styles.chip} data-tone="good">
            {copy.active}
          </span>
        )}
      </header>

      <p className={local.score}>
        {location.growth ?? "—"}
        <span>/100</span>
        {location.growthDelta !== null && (
          <span className={styles.delta} data-direction={location.growthDelta >= 0 ? "up" : "down"}>
            {location.growthDelta >= 0 ? <TrendingUp aria-hidden size={13} /> : <TrendingDown aria-hidden size={13} />}
            {location.growthDelta >= 0 ? "+" : ""}
            {location.growthDelta} {copy.vsPrevious}
          </span>
        )}
      </p>

      {location.subScores.length > 0 && (
        <ul className={styles.chips}>
          {location.subScores.map((score) => (
            <li key={score.key} className={styles.chip}>
              {copy.subLabels[score.key] ?? score.key} {score.value}
            </li>
          ))}
        </ul>
      )}

      <dl className={local.facts}>
        <div>
          <dt>{copy.lastScan}</dt>
          <dd>
            {location.lastScanAt
              ? new Date(location.lastScanAt).toLocaleDateString("en-CA", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : copy.never}
          </dd>
        </div>
        <div>
          <dt>{copy.topOpportunity}</dt>
          <dd>{location.topOpportunity ?? copy.noOpportunity}</dd>
        </div>
      </dl>

      <button type="button" className={styles.button} onClick={open} disabled={isOpening}>
        {copy.open}
      </button>
    </article>
  );
}
