import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@/test/renderWithProviders";
import GeneralSettingsPage from "@/pages/admin/settings/general";

const fetchMock = vi.fn();

const storedSettings = {
  siteName: "Miguel Soro",
  siteDescription: "Arte ciclista",
  contactEmail: "info@miguelsoro.com",
  businessName: "Miguel Soro Art SL",
  businessNif: "B12345678",
  businessAddress: "Calle Mayor 1, Xàtiva",
};

describe("admin general settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("never offers saving before the stored settings load (defaults would wipe fiscal data)", () => {
    // Invoices are built from this data: saving the hardcoded defaults over
    // the real values would silently corrupt every following invoice.
    fetchMock.mockReturnValue(new Promise(() => {})); // GET never resolves

    render(<GeneralSettingsPage />);

    expect(
      screen.queryByRole("button", { name: /guardar/i }),
    ).not.toBeInTheDocument();
  });

  it("edits and saves on top of the stored values", async () => {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (!init || init.method === undefined || init.method === "GET") {
        return { ok: true, json: async () => storedSettings };
      }
      return { ok: true, json: async () => ({}) };
    });

    const user = userEvent.setup({ delay: null });
    render(<GeneralSettingsPage />);

    const nifInput = await screen.findByLabelText("NIF");
    expect(nifInput).toHaveValue("B12345678");

    await user.type(nifInput, "X");
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    const postCall = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(postCall).toBeTruthy();
    expect(JSON.parse(postCall![1].body)).toMatchObject({
      businessNif: "B12345678X",
      businessName: "Miguel Soro Art SL",
    });
  });
});
