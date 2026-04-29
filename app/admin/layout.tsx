/**
 * /admin root layout — minimal pass-through.
 *
 * The visible admin chrome (header, nav, sign-out button) lives in
 * app/admin/(authenticated)/layout.tsx so that /admin/login can render
 * standalone without the chrome wrapping it.
 */
export const metadata = { title: { default: "Admin", template: "%s · Admin" } };

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
