export const ORGANISATION_TYPE_OPTIONS = [
  "National Federation",
  "State Association",
  "Club / Academy",
  "League / Tournament Body",
  "School / University",
  "Non-profit",
  "Other",
] as const;

export const CREATE_ORG_DEFAULTS = {
  organisationName: "National Athletics Federation",
  headquarters: "New Delhi, India",
  establishmentYear: "1983",
  shortDescription: "Empowering athletes to reach their full potential.",
  website: "https://naf-athletics.org",
} as const;
