"use client";
// Step 2: optional Google connections, then the business location — fetched from the Business Profile when
// it is connected, typed in by hand when it is not.
import { Check } from "lucide-react";
import { useState, useTransition } from "react";
import { connectGoogleAction, disconnectAction, saveAddressAction } from "@/app/(onboarding)/onboarding/actions";
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
  const [isSaving, startSave] = useTransition();

  const isBlank = ADDRESS_FIELDS.every((field) => address[field].trim() === "");

  const saveAndContinue = () =>
    startSave(async () => {
      // Nothing typed means nothing to save; the review step will show the location as not added.
      if (isBlank || apply(await saveAddressAction(address))) goTo(3);
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
