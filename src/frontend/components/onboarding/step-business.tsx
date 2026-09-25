"use client";
// Step 1: the website is read for business type, services and customer segments, which the owner then trims.
import { useState, useTransition } from "react";
import { analyseWebsiteAction, saveProfileAction } from "@/app/(onboarding)/onboarding/actions";
import { ChipEditor } from "./chip-editor";
import type { StepProps } from "./onboarding-wizard";
import { Spinner, StepHeading, WizardFooter } from "./wizard-parts";
import styles from "./onboarding-wizard.module.css";

function hostOf(url: string | null): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function StepBusiness({ state, copy, apply, goTo }: StepProps) {
  const text = copy.business;
  const [website, setWebsite] = useState(hostOf(state.websiteUrl));
  const [businessTypeId, setBusinessTypeId] = useState(state.profile?.businessTypeId ?? null);
  const [services, setServices] = useState(state.profile?.services ?? []);
  const [segments, setSegments] = useState(state.profile?.segments ?? []);
  const [isAnalysing, startAnalysis] = useTransition();
  const [isSaving, startSave] = useTransition();

  const hasProfile = state.profile !== null;

  const analyse = () =>
    startAnalysis(async () => {
      const result = await analyseWebsiteAction(website);
      if (!apply(result) || !result.state?.profile) return;
      setWebsite(hostOf(result.state.websiteUrl));
      setBusinessTypeId(result.state.profile.businessTypeId);
      setServices(result.state.profile.services);
      setSegments(result.state.profile.segments);
    });

  const saveAndContinue = () =>
    startSave(async () => {
      if (apply(await saveProfileAction({ businessTypeId, services, segments }))) goTo(2);
    });

  const chipCopy = { add: text.add, addPlaceholder: text.addPlaceholder, remove: text.remove };

  return (
    <section className={styles.step} aria-labelledby="step-business">
      <StepHeading id="step-business" title={text.heading} intro={text.intro} />

      <form
        className={styles.urlRow}
        onSubmit={(event) => {
          event.preventDefault();
          analyse();
        }}
      >
        <label className={styles.srOnly} htmlFor="websiteUrl">
          {text.inputLabel}
        </label>
        <input
          id="websiteUrl"
          type="text"
          inputMode="url"
          autoComplete="url"
          className={styles.input}
          value={website}
          placeholder={text.placeholder}
          onChange={(event) => setWebsite(event.target.value)}
        />
        <button type="submit" className={styles.darkButton} disabled={isAnalysing || website.trim() === ""}>
          {isAnalysing && <Spinner />}
          {isAnalysing ? text.analysing : hasProfile ? text.reanalyse : text.analyse}
        </button>
      </form>

      {hasProfile && (
        <div className={styles.detected} aria-busy={isAnalysing}>
          <div className={styles.chipGroup} role="radiogroup" aria-labelledby="business-type-label">
            <p id="business-type-label" className={styles.sectionLabel}>
              {text.typeLabel}
            </p>
            <div className={styles.toggles}>
              {state.businessTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  role="radio"
                  aria-checked={businessTypeId === type.id}
                  className={styles.toggle}
                  onClick={() => setBusinessTypeId(type.id)}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <ChipEditor
            label={
              services.length > 0
                ? text.servicesLabel.replace("{count}", String(services.length))
                : text.servicesEmptyLabel
            }
            items={services}
            onChange={setServices}
            copy={chipCopy}
          />

          <ChipEditor
            label={
              segments.length > 0
                ? text.segmentsLabel.replace("{count}", String(segments.length))
                : text.segmentsEmptyLabel
            }
            items={segments}
            onChange={setSegments}
            copy={chipCopy}
          />
        </div>
      )}

      <WizardFooter
        back={{ label: copy.nav.back, href: "/" }}
        hint={!hasProfile ? text.needsAnalysis : services.length === 0 ? text.needsService : undefined}
        primary={{
          label: isSaving ? copy.nav.saving : copy.nav.continue,
          onClick: saveAndContinue,
          disabled: !hasProfile || !businessTypeId || services.length === 0 || isAnalysing,
          isBusy: isSaving,
        }}
      />
    </section>
  );
}
