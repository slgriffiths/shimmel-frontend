import { getSession } from "@auth0/nextjs-auth0";

const Home = async () => {
  "use server"; // ✅ Ensure it's treated as a Server Component

  const session = await getSession(); // ✅ Await the session properly  

  if (!session?.user) {
    return (
      <main>
        <a href="api/auth/login?screen_hint=signup">Sign up</a>
        <br/>
        <a href="api/auth/login">Log in</a>
      </main>
    )
  }

  return (
    <>
      <div>Welcome, {session.user.name}!</div>
      <div><a href="/api/auth/logout">Logout</a></div>
    </>
  )
};

export default Home;