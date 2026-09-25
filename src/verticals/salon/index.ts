// Salon pack: assembles the files into one VerticalPack export.
import type { VerticalPack } from "@/shared/types/vertical";
import { benchmarks } from "./benchmarks";
import { campaigns } from "./campaigns";
import { contentTypes } from "./content-types";
import { keywords } from "./keywords";
import { manifest } from "./manifest";
import { marketing } from "./marketing";
import { planTasks } from "./plan-tasks";
import { reviewTopics } from "./review-topics";
import { segments } from "./segments";
import { services } from "./services";

export const salonPack: VerticalPack = {
  manifest,
  marketing,
  benchmarks,
  services,
  keywords,
  contentTypes,
  segments,
  campaigns,
  reviewTopics,
  planTasks,
};
