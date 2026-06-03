import { RegisterDraftProvider } from "@/components/auth/register-draft-context";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RegisterDraftProvider>{children}</RegisterDraftProvider>;
}
