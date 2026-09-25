"use client";
// Step 3: link a booking platform or upload a CSV export. The template on the right is built from the same
// column list the server parses with, so a file that follows it always imports.
import { Check, Download, FileSpreadsheet, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import {
  connectBookingPlatformAction,
  disconnectAction,
  removeBookingImportAction,
} from "@/app/(onboarding)/onboarding/actions";
import { ApiError, uploadBookingsCsv } from "@/frontend/lib/api-client";
import {
  BOOKING_PLATFORMS,
  FEATURED_BOOKING_PLATFORMS,
  type BookingPlatformId,
} from "@/shared/constants/booking-platforms";
import { BOOKING_CSV_COLUMNS, BOOKING_CSV_SAMPLE_ROWS } from "@/shared/schemas/booking-upload";
import type { StepProps } from "./onboarding-wizard";
import { Spinner, StepHeading, WizardFooter } from "./wizard-parts";
import styles from "./onboarding-wizard.module.css";

const OTHER_PLATFORMS = BOOKING_PLATFORMS.filter((platform) => !FEATURED_BOOKING_PLATFORMS.includes(platform.id));

export function StepBookings({ state, copy, apply, setError, goTo }: StepProps) {
  const text = copy.bookings;
  const hasBookingData = state.bookingPlatformId !== null || state.bookingImport !== null;

  return (
    <section className={styles.step} aria-labelledby="step-bookings">
      <StepHeading id="step-bookings" title={text.heading} intro={text.intro} />

      <div className={styles.bookingsLayout}>
        <div className={styles.bookingsMain}>
          <p className={styles.sectionLabel}>{text.platformsLabel}</p>
          <ul className={styles.platforms}>
            {FEATURED_BOOKING_PLATFORMS.map((id) => (
              <PlatformCard key={id} platformId={id} {...{ state, copy, apply }} />
            ))}
            <OtherPlatformCard {...{ state, copy, apply }} />
          </ul>

          <p className={styles.divider}>
            <span>{text.orDivider}</span>
          </p>

          <CsvUpload {...{ state, copy, apply, setError }} />
        </div>

        <CsvTemplate copy={copy} serviceExamples={state.serviceExamples} />
      </div>

      <WizardFooter
        back={{ label: copy.nav.back, onClick: () => goTo(2) }}
        skip={hasBookingData ? undefined : { label: copy.nav.skip, onClick: () => goTo(4) }}
        primary={{ label: copy.nav.continue, onClick: () => goTo(4), disabled: !hasBookingData }}
      />
    </section>
  );
}

type PartProps = Pick<StepProps, "state" | "copy" | "apply">;

function usePlatformToggle({ state, apply }: PartProps) {
  const [pendingId, setPendingId] = useState<BookingPlatformId | null>(null);

  const toggle = async (platformId: BookingPlatformId) => {
    setPendingId(platformId);
    try {
      const isThisConnected = state.bookingPlatformId === platformId;
      apply(isThisConnected ? await disconnectAction("booking-source") : await connectBookingPlatformAction(platformId));
    } finally {
      setPendingId(null);
    }
  };

  return { pendingId, toggle };
}

function PlatformCard({ platformId, state, copy, apply }: PartProps & { platformId: BookingPlatformId }) {
  const text = copy.bookings;
  const { pendingId, toggle } = usePlatformToggle({ state, copy, apply });
  const name = BOOKING_PLATFORMS.find((platform) => platform.id === platformId)?.name ?? platformId;
  const isConnected = state.bookingPlatformId === platformId;
  const isPending = pendingId === platformId;

  return (
    <li className={styles.platform} data-connected={isConnected}>
      <span className={styles.platformName}>
        {isConnected && <Check aria-hidden size={16} strokeWidth={3} />}
        {name}
      </span>
      {isConnected && <span className={styles.platformStatus}>{text.connected}</span>}
      <button
        type="button"
        className={isConnected ? styles.secondaryButton : styles.darkButton}
        onClick={() => void toggle(platformId)}
        disabled={pendingId !== null}
      >
        {isPending && !isConnected && <Spinner />}
        {isPending && !isConnected ? text.connecting : isConnected ? text.disconnect : text.connect}
      </button>
    </li>
  );
}

function OtherPlatformCard({ state, copy, apply }: PartProps) {
  const text = copy.bookings;
  const { pendingId, toggle } = usePlatformToggle({ state, copy, apply });
  const connectedOther = OTHER_PLATFORMS.find((platform) => platform.id === state.bookingPlatformId) ?? null;
  const [selected, setSelected] = useState<BookingPlatformId | "">(connectedOther?.id ?? "");
  const isConnected = connectedOther !== null;

  return (
    <li className={styles.platform} data-connected={isConnected}>
      <label className={styles.platformName} htmlFor="other-platform">
        {isConnected && <Check aria-hidden size={16} strokeWidth={3} />}
        {text.other}
      </label>
      <select
        id="other-platform"
        className={styles.select}
        value={selected}
        disabled={isConnected}
        onChange={(event) => setSelected(event.target.value as BookingPlatformId | "")}
      >
        <option value="">{text.otherPlaceholder}</option>
        {OTHER_PLATFORMS.map((platform) => (
          <option key={platform.id} value={platform.id}>
            {platform.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={isConnected ? styles.secondaryButton : styles.darkButton}
        onClick={() => selected && void toggle(selected)}
        disabled={!selected || pendingId !== null}
      >
        {pendingId && !isConnected && <Spinner />}
        {pendingId && !isConnected ? text.connecting : isConnected ? text.disconnect : text.connect}
      </button>
    </li>
  );
}

function CsvUpload({ state, copy, apply, setError }: PartProps & Pick<StepProps, "setError">) {
  const text = copy.bookings;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, startRemove] = useTransition();
  const summary = state.bookingImport;

  const choose = () => inputRef.current?.click();

  const upload = async (file: File) => {
    setIsUploading(true);
    try {
      apply({ state: await uploadBookingsCsv(file), error: null });
    } catch (error) {
      setError(error instanceof ApiError ? error.message : copy.errors.unexpected);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={styles.upload} data-uploaded={summary !== null}>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        tabIndex={-1}
        disabled={isUploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      {summary ? (
        <div className={styles.uploadSummary}>
          <FileSpreadsheet aria-hidden size={22} />
          <div>
            <p className={styles.uploadFile}>{summary.fileName}</p>
            <p className={styles.uploadMeta}>
              {text.uploaded
                .replace("{rows}", summary.rowCount.toLocaleString("en-CA"))
                .replace("{from}", summary.firstBookingDate)
                .replace("{to}", summary.lastBookingDate)}
            </p>
          </div>
          <div className={styles.uploadActions}>
            <button type="button" className={styles.secondaryButton} disabled={isUploading} onClick={choose}>
              {isUploading && <Spinner />}
              {text.replace}
            </button>
            <button
              type="button"
              className={styles.textButton}
              disabled={isRemoving || isUploading}
              onClick={() => startRemove(async () => void apply(await removeBookingImportAction()))}
            >
              {text.removeFile}
            </button>
          </div>
        </div>
      ) : (
        <>
          <button type="button" className={styles.uploadButton} disabled={isUploading} onClick={choose}>
            {isUploading ? <Spinner size={18} /> : <Upload aria-hidden size={18} />}
            {isUploading ? text.uploading : text.upload}
          </button>
          <p className={styles.uploadMeta}>{text.uploadHint}</p>
        </>
      )}
    </div>
  );
}

function templateRows(serviceExamples: readonly string[]): string[][] {
  return BOOKING_CSV_SAMPLE_ROWS.map((row, index) =>
    row.map((value) => value ?? serviceExamples[index % Math.max(serviceExamples.length, 1)] ?? "Service"),
  );
}

function toCsv(rows: readonly (readonly string[])[]): string {
  const cell = (value: string) => (/[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value);
  return rows.map((row) => row.map(cell).join(",")).join("\n") + "\n";
}

function CsvTemplate({ copy, serviceExamples }: { copy: StepProps["copy"]; serviceExamples: string[] }) {
  const text = copy.bookings.template;
  const header = BOOKING_CSV_COLUMNS.map((column) => column.name);
  const csv = toCsv([header, ...templateRows(serviceExamples)]);

  const download = () => {
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "reynav-bookings-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className={styles.template} aria-label={text.download}>
      <p className={styles.templateIntro}>{text.intro}</p>
      <button type="button" className={styles.secondaryButton} onClick={download}>
        <Download aria-hidden size={16} />
        {text.download}
      </button>
    </aside>
  );
}
