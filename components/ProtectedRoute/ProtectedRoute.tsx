"use client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // const { isAuthenticated, user } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push("/");
  //   }
  // }, [isAuthenticated, router]);

  // if (!isAuthenticated) return <Spin />;

  return <>{children}</>;
};