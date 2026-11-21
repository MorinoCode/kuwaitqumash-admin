import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TenantsPage from "./TenantsPage";
import { api } from "../api/axios";

vi.mock("../api/axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adminPanel TenantsPage", () => {
  it("loads and renders store tenants from the API", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 1,
            name: "Qummash Silk",
            slug: "qummash-silk",
            owner_name: "Ali",
            owner_username: "ali_owner",
            phone: "99887766",
            subscription_status: "active",
            created_at: "2026-01-01T00:00:00Z",
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <TenantsPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText(/Qummash Silk/i)).toBeInTheDocument());
    expect(screen.getByText(/ali_owner/i)).toBeInTheDocument();
  });
});
