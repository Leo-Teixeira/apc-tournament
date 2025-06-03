export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-bold text-red-500">Accès refusé</h1>
      <p>Vous devez être administrateur pour accéder à cette application.</p>
      <a
        href="https://aqua-bat-544144.hostingersite.com"
        className="mt-4 underline text-blue-500">
        Revenir au site
      </a>
    </div>
  );
}
