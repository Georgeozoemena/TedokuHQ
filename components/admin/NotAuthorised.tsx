// Deliberately plain. It says nothing about what lives here.
export function NotAuthorised() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <div className="w-full max-w-sm rounded-adm bg-white p-6 text-center shadow-adm">
        <h1 className="text-2xl font-extrabold text-ink">Not authorised</h1>
        <p className="mt-2 text-sm text-muted">Your account does not have access to this page.</p>
        <form action="/admin/signout" method="post" className="mt-5">
          <button type="submit" className="h-10 rounded-xl bg-lav-1 px-4 text-sm font-bold text-purple hover:bg-lav-2">Sign out</button>
        </form>
      </div>
    </main>
  );
}
