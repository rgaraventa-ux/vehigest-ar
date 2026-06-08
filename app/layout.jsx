export const metadata = {
  title: "VehiGest AR",
  description: "Gestión vehicular para Argentina",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
