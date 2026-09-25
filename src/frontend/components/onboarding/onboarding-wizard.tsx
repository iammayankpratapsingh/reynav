"use client";
// The onboarding wizard: one step on screen at a time, a progress bar across the top, and the server state
// passed down so every step shows what has actually been saved. It ends by starting the first scan, which
// then runs on Home.
import { AlertCircle } from "lucide-react";
import { useCallback, useState } from "react";
import type { OnboardingActionResult } from "@/app/(onboarding)/onboarding/actions";
import type { OnboardingCopy } from "@/frontend/copy/onboarding";
import type { OnboardingState } from "@/shared/types/onboarding";
import { StepBookings } from "./step-bookings";
import { StepBusiness } from "./step-business";
import { StepGoogle } from "./step-google";
import { StepReview } from "./step-review";
import styles from "./onboarding-wizard.module.css";

export const TOTAL_STEPS = 4;

export type WizardStep = 1 | 2 | 3 | 4;

/** What every step receives: the saved state, the copy, and ways to report back to the wizard. */
export type StepProps = {
  state: OnboardingState;
  copy: OnboardingCopy;
  /** Applies a Server Action's result: new state on success, the message on failure. Returns success. */
  apply: (result: OnboardingActionResult) => boolean;
  setError: (message: string | null) => void;
  goTo: (step: WizardStep) => void;
};

type WizardProps = {
  initialState: OnboardingState;
  copy: OnboardingCopy;
};

export function OnboardingWizard({ initialState, copy }: WizardProps) {
  const [state, setState] = useState(initialState);
  const [step, setStep] = useState<WizardStep>(1);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((result: OnboardingActionResult) => {
    if (result.state) {
      setState(result.state);
      setError(null);
      return true;
    }
    setError(result.error);
    return false;
  }, []);

  const goTo = useCallback((next: WizardStep) => {
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  }, []);

  const stepProps: StepProps = { state, copy, apply, setError, goTo };
  const progressLabel = copy.progress.replace("{current}", String(step)).replace("{total}", String(TOTAL_STEPS));

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.progress}>
          <span className={styles.progressLabel}>{progressLabel}</span>
          <span
            className={styles.progressTrack}
            role="progressbar"
            aria-label={progressLabel}
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={step}
          >
            <span className={styles.progressFill} style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </span>
        </header>

        {state.isSimulated && <p className={styles.simulated}>{copy.simulatedNote}</p>}

        {error && (
          <p role="alert" className={styles.error}>
            <AlertCircle aria-hidden size={18} />
            {error}
          </p>
        )}

        {step === 1 && <StepBusiness {...stepProps} />}
        {step === 2 && <StepGoogle {...stepProps} />}
        {step === 3 && <StepBookings {...stepProps} />}
        {step === 4 && <StepReview {...stepProps} />}
      </div>
    </div>
  );
}
