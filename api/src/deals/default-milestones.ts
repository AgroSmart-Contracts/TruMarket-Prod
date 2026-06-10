import { Milestone } from './deals.entities';

/** Standard shipment milestone keys (matches web `milestoneDescriptions`). */
export const DEFAULT_MILESTONE_DESCRIPTIONS = [
  'production_and_fields',
  'packaging_and_process',
  'finished_product_and_storage',
  'transport_to_port_of_origin',
  'port_of_origin',
  'transit',
  'port_of_destination',
] as const;

/** Default 7 milestones: 100% on first step, 0% on the rest (legacy create-flow default). */
export function buildDefaultMilestones(): Milestone[] {
  return DEFAULT_MILESTONE_DESCRIPTIONS.map((description, index) => ({
    description,
    fundsDistribution: index === 0 ? 100 : 0,
  }));
}
