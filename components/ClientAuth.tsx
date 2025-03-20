"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

const ClientAuth = () => {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return user ? (
    <>
      <div>Welcome, {user.name}!</div>
      <div><a href="/api/auth/logout">Logout</a></div>
    </>
  ) : (
    <main>
      <a href="/api/auth/login?screen_hint=signup">Sign up</a>
      <br />
      <a href="/api/auth/login">Log in</a>
    </main>
  );
};

export default ClientAuth;