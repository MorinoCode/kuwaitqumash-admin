import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

const mockUseAuth = vi.fn();

vi.mock("./context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("./components/Layout", () => ({
  default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock("./pages/LoginPage", () => ({
  default: () => <div data-testid="admin-login">login</div>,
}));

vi.mock("./pages/DashboardPage", () => ({
  default: () => <div data-testid="admin-dashboard">dashboard</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  window.history.pushState({}, "", "/");
});

describe("adminPanel App routing", () => {
  it("redirects unauthenticated visitors to the login page", async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<App />);
    expect(await screen.findByTestId("admin-login")).toBeInTheDocument();
  });

  it("renders the dashboard inside layout for an authenticated admin", async () => {
    mockUseAuth.mockReturnValue({
      user: { email: "admin@qummash.kw", role: "super_admin" },
      loading: false,
    });
    render(<App />);
    expect(await screen.findByTestId("admin-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("admin-layout")).toBeInTheDocument();
  });
});
