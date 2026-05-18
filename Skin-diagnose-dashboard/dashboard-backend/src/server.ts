// ============================================================
// DASHBOARD BACKEND — Skin-diagnose-dashboard/dashboard-backend
// This is NOT the main app backend (Back-End/).
// It serves only the admin dashboard on port 5001.
// Database: DermaAiDashboard (separate from main app DB)
// ============================================================
import "dotenv/config";
import app from "./app";
import { seedAdmin } from "./modules/auth/auth.service";

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  console.log(`Dashboard backend running on port ${PORT}`);
  await seedAdmin();
});
