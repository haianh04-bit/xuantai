import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import AdminOrders from "./pages/AdminOrders.tsx";

const queryClient = new QueryClient();

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          {/* Trang sản phẩm */}
          <Route path="/" element={<Index />} />

          {/* Local vẫn vào được admin */}
          {isLocal ? (
            <>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
            </>
          ) : (
            <>
              <Route path="/admin" element={<Navigate to="/btv" replace />} />
              <Route path="/admin/orders" element={<Navigate to="/btv" replace />} />
            </>
          )}

          {/* Redirect tất cả route khác */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;