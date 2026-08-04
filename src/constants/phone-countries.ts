export type PhoneCountry = {
  iso: string;
  flag: string;
  dialCode: string;
  name: string;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "IN", flag: "🇮🇳", dialCode: "+91", name: "India" },
  { iso: "US", flag: "🇺🇸", dialCode: "+1", name: "United States" },
  { iso: "GB", flag: "🇬🇧", dialCode: "+44", name: "United Kingdom" },
  { iso: "AE", flag: "🇦🇪", dialCode: "+971", name: "United Arab Emirates" },
  { iso: "AU", flag: "🇦🇺", dialCode: "+61", name: "Australia" },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];
