import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <h1>Admin Panel</h1>
    </ProtectedRoute>
  );
}