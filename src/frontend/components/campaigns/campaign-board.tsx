"use client";
// Campaigns, split into what REYNAV suggests, what is running and what has finished.
import { Megaphone, Sparkles } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/frontend/components/app/empty-state";
import { PageHeader } from "@/frontend/components/app/page-header";
import { TabNav } from "@/frontend/components/app/tab-nav";
import { Thumb } from "@/frontend/components/app/thumb";
import type { CampaignsCopy } from "@/frontend/copy/campaigns";
import type { Campaign, CampaignBoard as Board } from "@/shared/types/campaign";
import styles from "./campaign-board.module.css";

export function CampaignBoard({ board, copy }: { board: Board; copy: CampaignsCopy }) {
  const [tab, setTab] = useState("recommended");
  const shown = tab === "active" ? board.active : tab === "past" ? board.past : board.recommended;

  return (
    <div className={styles.page}>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <TabNav tabs={copy.tabs} active={tab} onChange={setTab} label={copy.title} />

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {shown.length === 0 ? (
          <EmptyState
            icon={<Megaphone aria-hidden size={26} />}
            heading={copy.empty[tab as keyof typeof copy.empty].heading}
            body={copy.empty[tab as keyof typeof copy.empty].body}
            cta={tab === "recommended" ? copy.empty.recommended.cta : undefined}
          />
        ) : (
          <ul className={styles.list}>
            {shown.map((campaign) => (
              <CampaignRow key={campaign.id} campaign={campaign} copy={copy} />
            ))}
          </ul>
        )}
      </div>

      {tab === "recommended" && shown.length > 0 && <p className={styles.note}>{copy.notWired}</p>}

      <section className={styles.custom}>
        <div>
          <h2 className={styles.customHeading}>{copy.custom.heading}</h2>
          <p className={styles.customBody}>{copy.custom.body}</p>
        </div>
        <div className={styles.customForm}>
          <label className={styles.srOnly} htmlFor="campaign-idea">
            {copy.custom.heading}
          </label>
          <input id="campaign-idea" className={styles.customInput} placeholder={copy.custom.placeholder} />
          <button type="button" className={styles.customCta}>
            <Sparkles aria-hidden size={17} />
            {copy.custom.cta}
          </button>
        </div>
      </section>
    </div>
  );
}

function CampaignRow({ campaign, copy }: { campaign: Campaign; copy: CampaignsCopy }) {
  return (
    <li className={styles.item}>
      <Thumb label={campaign.name} theme={campaign.theme} />

      <div className={styles.body}>
        <p className={styles.name}>{campaign.name}</p>
        <p className={styles.summary}>{campaign.summary}</p>
        <p className={styles.pieces}>
          {campaign.pieces.join("  +  ")}
          <span className={styles.segment}>
            · {copy.forLabel} {campaign.segmentName}
          </span>
        </p>
      </div>

      <div className={styles.side}>
        <span className={styles.impact} data-impact={campaign.impact}>
          {copy.impact[campaign.impact]}
        </span>
        <button type="button" className={styles.launch}>
          {copy.launch}
        </button>
      </div>
    </li>
  );
}
