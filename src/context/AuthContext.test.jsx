import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { api } from "../api/axios";

vi.mock("../api/axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const Probe = () => {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : "none"}</span>
      <button type="button" onClick={() => login("tok-123")}>
        do-login
      </button>
      <button type="button" onClick={logout}>
        do-logout
      </button>
    </div>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  api.post.mockResolvedValue({ data: { success: true } });
});

describe("adminPanel AuthContext", () => {
  it("starts unauthenticated when no admin_token exists", () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("loads admin profile when admin_token is stored", async () => {
    localStorage.setItem("admin_token", "valid-token");
    api.get.mockResolvedValueOnce({
      data: { data: { email: "admin@qummash.kw", role: "super_admin" } },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).toBe("admin@qummash.kw"),
    );
  });

  it("stores token on login and clears state on logout", async () => {
    api.get.mockResolvedValueOnce({
      data: { data: { email: "boss@qummash.kw", role: "super_admin" } },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("do-login"));
    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).toBe("boss@qummash.kw"),
    );
    expect(localStorage.getItem("admin_token")).toBe("tok-123");

    fireEvent.click(screen.getByText("do-logout"));
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(localStorage.getItem("admin_token")).toBeNull();
  });
});
