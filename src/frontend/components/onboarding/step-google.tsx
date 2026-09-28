"use client";
// Step 2: optional Google connections, then the business location — fetched from the Business Profile when
// it is connected, typed in by hand when it is not.
import { Check } from "lucide-react";
import { useState, useTransition, type CSSProperties } from "react";
import { connectGoogleAction, disconnectAction, saveLocationAction } from "@/app/(onboarding)/onboarding/actions";
import { SEARCH_RADIUS_KM } from "@/shared/constants/search-radius";
import type { PostalAddress } from "@/shared/types/business";
import { GOOGLE_PROVIDERS, type GoogleProvider } from "@/shared/types/onboarding";
import type { StepProps } from "./onboarding-wizard";
import { Spinner, StepHeading, WizardFooter } from "./wizard-parts";
import styles from "./onboarding-wizard.module.css";

const EMPTY_ADDRESS: PostalAddress = { street: "", city: "", region: "", postalCode: "" };
const ADDRESS_FIELDS = ["street", "city", "region", "postalCode"] as const;
const AUTOCOMPLETE: Record<keyof PostalAddress, string> = {
  street: "street-address",
  city: "address-level2",
  region: "address-level1",
  postalCode: "postal-code",
};

export function StepGoogle({ state, copy, apply, goTo }: StepProps) {
  const text = copy.google;
  const [address, setAddress] = useState<PostalAddress>(state.address ?? EMPTY_ADDRESS);
  const [radiusKm, setRadiusKm] = useState(state.searchRadiusKm);
  const [isSaving, startSave] = useTransition();

  const isBlank = ADDRESS_FIELDS.every((field) => address[field].trim() === "");

  const saveAndContinue = () =>
    startSave(async () => {
      // A blank address is not saved (the review step shows it as not added); the radius always is.
      if (apply(await saveLocationAction({ address: isBlank ? null : address, searchRadiusKm: radiusKm }))) goTo(3);
    });

  return (
    <section className={styles.step} aria-labelledby="step-google">
      <StepHeading id="step-google" title={text.heading} intro={text.intro} />

      <ul className={styles.connectionList}>
        {GOOGLE_PROVIDERS.map((provider) => (
          <GoogleConnection
            key={provider}
            provider={provider}
            {...{ state, copy, apply }}
            onAddressFetched={(fetched) => setAddress(fetched)}
          />
        ))}
      </ul>

      <fieldset className={styles.fieldset}>
        <legend className={styles.sectionLabel}>{text.locationHeading}</legend>
        <p className={styles.fieldsetNote}>
          {state.addressSource === "listing" ? text.locationFetched : text.locationManual}
        </p>
        <div className={styles.addressGrid}>
          {ADDRESS_FIELDS.map((field) => (
            <label key={field} className={styles.field} data-field={field}>
              <span className={styles.fieldLabel}>{text.fields[field]}</span>
              <input
                className={styles.input}
                value={address[field]}
                autoComplete={AUTOCOMPLETE[field]}
                onChange={(event) => setAddress((current) => ({ ...current, [field]: event.target.value }))}
              />
            </label>
          ))}
        </div>
        <RadiusSlider copy={text.radius} value={radiusKm} onChange={setRadiusKm} />
      </fieldset>

      <WizardFooter
        back={{ label: copy.nav.back, onClick: () => goTo(1) }}
        skip={{ label: copy.nav.skip, onClick: () => goTo(3), disabled: isSaving }}
        primary={{
          label: isSaving ? copy.nav.saving : copy.nav.continue,
          onClick: saveAndContinue,
          isBusy: isSaving,
        }}
      />
    </section>
  );
}

function GoogleConnection({
  provider,
  state,
  copy,
  apply,
  onAddressFetched,
}: Pick<StepProps, "state" | "copy" | "apply"> & {
  provider: GoogleProvider;
  onAddressFetched: (address: PostalAddress) => void;
}) {
  const text = copy.google;
  const connection = state.connections.find((candidate) => candidate.provider === provider);
  const isConnected = connection?.status === "connected";
  const [isPending, startTransition] = useTransition();

  const toggle = () =>
    startTransition(async () => {
      const result = isConnected ? await disconnectAction(provider) : await connectGoogleAction(provider);
      if (apply(result) && result.state?.addressSource === "listing" && result.state.address) {
        onAddressFetched(result.state.address);
      }
    });

  const label = isPending
    ? isConnected
      ? text.disconnect
      : text.connecting
    : isConnected
      ? text.disconnect
      : connection?.status === "failed"
        ? text.retry
        : text.connect;

  return (
    <li className={styles.connection} data-connected={isConnected}>
      <span className={styles.connectionMark} aria-hidden>
        {isConnected && <Check size={16} strokeWidth={3} />}
      </span>
      <div className={styles.connectionText}>
        <p className={styles.connectionTitle}>{text.providers[provider].title}</p>
        <p className={styles.connectionDescription}>{text.providers[provider].description}</p>
        {isConnected && connection?.accountLabel && <p className={styles.accountLabel}>{connection.accountLabel}</p>}
        {connection?.status === "failed" && <p className={styles.failed}>{text.failed}</p>}
      </div>
      <button
        type="button"
        className={isConnected ? styles.secondaryButton : styles.darkButton}
        onClick={toggle}
        disabled={isPending}
      >
        {isPending && !isConnected && <Spinner />}
        {label}
      </button>
    </li>
  );
}

function RadiusSlider({
  copy,
  value,
  onChange,
}: {
  copy: StepProps["copy"]["google"]["radius"];
  value: number;
  onChange: (km: number) => void;
}) {
  const { min, max, step } = SEARCH_RADIUS_KM;
  const shown = copy.value.replace("{km}", String(value));
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.radius}>
      <div className={styles.radiusHeader}>
        <label htmlFor="search-radius" className={styles.fieldLabel}>
          {copy.label}
        </label>
        <output htmlFor="search-radius" className={styles.radiusValue}>
          {shown}
        </output>
      </div>
      <p className={styles.radiusNote}>{copy.note}</p>
      <input
        id="search-radius"
        type="range"
        className={styles.radiusInput}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={shown}
        style={{ "--fill": `${fill}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className={styles.radiusScale} aria-hidden>
        <span>{copy.value.replace("{km}", String(min))}</span>
        <span>{copy.value.replace("{km}", String(max))}</span>
      </div>
    </div>
  );
}
