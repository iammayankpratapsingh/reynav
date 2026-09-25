"use client";
// The content catalogue, split by channel. Choosing a piece is what the generator will act on; drafting
// itself is not wired yet, so the screen says so rather than pretending.
import {
  ArrowRight,
  CalendarClock,
  Camera,
  FileText,
  Image as ImageIcon,
  Layers,
  Mail,
  MapPin,
  Megaphone,
  MessageCircleQuestion,
  MessageSquareReply,
  Newspaper,
  Sparkles,
  Tag,
  User,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/frontend/components/app/page-header";
import { TabNav } from "@/frontend/components/app/tab-nav";
import type { ContentCatalogue } from "@/shared/types/content";
import type { ContentCopy } from "@/frontend/copy/content";
import type { ContentChannel } from "@/shared/types/vertical";
import styles from "./content-engine.module.css";

const icons: Record<string, LucideIcon> = {
  page: FileText,
  location: MapPin,
  faq: MessageCircleQuestion,
  compare: ImageIcon,
  person: User,
  price: Tag,
  guide: FileText,
  article: Newspaper,
  megaphone: Megaphone,
  tag: Tag,
  reply: MessageSquareReply,
  camera: Camera,
  video: Video,
  layers: Layers,
  mail: Mail,
};

export function ContentEngine({ catalogue, copy }: { catalogue: ContentCatalogue; copy: ContentCopy }) {
  const tabs = useMemo(
    () => catalogue.channels.map((channel) => ({ id: channel, label: copy.channels[channel] })),
    [catalogue.channels, copy.channels],
  );
  const [channel, setChannel] = useState<ContentChannel>(catalogue.channels[0] ?? "website");
  const [selected, setSelected] = useState<string | null>(null);

  const visible = catalogue.templates.filter((template) => template.channel === channel);
  const selectedTemplate = catalogue.templates.find((template) => template.id === selected) ?? null;

  return (
    <div className={styles.page}>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {catalogue.suggestedCount > 0 && (
        <p className={styles.banner}>
          <Sparkles aria-hidden size={17} />
          {catalogue.suggestedCount === 1
            ? copy.suggestedBanner.one
            : `${catalogue.suggestedCount} ${copy.suggestedBanner.manySuffix}`}
        </p>
      )}

      <TabNav tabs={tabs} active={channel} onChange={(id) => setChannel(id as ContentChannel)} label={copy.selectHint} />

      <ul id={`panel-${channel}`} role="tabpanel" aria-labelledby={`tab-${channel}`} className={styles.grid}>
        {visible.map((template) => {
          const Icon = icons[template.icon] ?? FileText;
          const isSelected = selected === template.id;
          return (
            <li key={template.id}>
              <button
                type="button"
                className={styles.card}
                aria-pressed={isSelected}
                onClick={() => setSelected(isSelected ? null : template.id)}
              >
                {template.isSuggested && (
                  <span className={styles.suggested}>
                    <Sparkles aria-hidden size={12} />
                    {copy.suggested}
                  </span>
                )}
                <span className={styles.icon} data-channel={template.channel}>
                  <Icon aria-hidden size={22} />
                </span>
                <span className={styles.cardBody}>
                  <span className={styles.name}>{template.name}</span>
                  <span className={styles.description}>{template.description}</span>
                  <span className={styles.meta}>
                    <CalendarClock aria-hidden size={13} />
                    {template.estimatedMinutes} {copy.minutesSuffix}
                    {template.suggestedFor && (
                      <span className={styles.forWhat}>
                        · {copy.suggestedForPrefix} {template.suggestedFor}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.footer}>
        <p className={styles.selection}>
          {selectedTemplate ? `${copy.selectedPrefix} ${selectedTemplate.name}` : copy.selectHint}
        </p>
        <button type="button" className={styles.generate} disabled={!selectedTemplate}>
          {copy.generate}
          <ArrowRight aria-hidden size={19} />
        </button>
        <p className={styles.note}>{copy.notWired}</p>
      </div>
    </div>
  );
}
