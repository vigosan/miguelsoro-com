import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@/test/renderWithProviders";
import { PictureForm, PictureFormValues } from "@/components/admin/PictureForm";

const emptyValues: PictureFormValues = {
  title: "",
  description: "",
  price: "",
  size: "",
  slug: "",
  productTypeId: "",
  stock: "1",
  imageUrl: "",
};

const fetchMock = vi.fn();

const renderForm = (
  props: Partial<React.ComponentProps<typeof PictureForm>> = {},
) => {
  const onSubmit = vi.fn();
  render(
    <PictureForm
      initialValues={emptyValues}
      submitting={false}
      submitLabel="Crear Cuadro"
      submittingLabel="Creando..."
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return onSubmit;
};

describe("PictureForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        productTypes: [
          { id: "type-1", name: "cuadros", displayName: "Cuadros" },
        ],
      }),
    });
  });

  it("auto-generates the slug from the title when creating", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm({ autoSlugFromTitle: true });

    await user.type(screen.getByLabelText("Título *"), "Eddy Merckx");

    expect(screen.getByLabelText("URL slug *")).toHaveValue("eddy-merckx");
  });

  it("stops auto-generating once the slug is edited by hand", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm({ autoSlugFromTitle: true });

    await user.type(screen.getByLabelText("URL slug *"), "mi-slug");
    await user.type(screen.getByLabelText("Título *"), "Eddy Merckx");

    expect(screen.getByLabelText("URL slug *")).toHaveValue("mi-slug");
  });

  it("never rewrites the slug when editing an existing picture (URLs must stay stable)", async () => {
    const user = userEvent.setup({ delay: null });
    renderForm({
      initialValues: { ...emptyValues, title: "Original", slug: "original" },
    });

    await user.type(screen.getByLabelText("Título *"), " Renombrado");

    expect(screen.getByLabelText("URL slug *")).toHaveValue("original");
  });

  it("submits the values as typed", async () => {
    const user = userEvent.setup({ delay: null });
    const onSubmit = renderForm({
      initialValues: {
        ...emptyValues,
        title: "Obra",
        slug: "obra",
        price: "450",
        productTypeId: "type-1",
        imageUrl: "https://blob.example.com/obra.webp",
      },
    });

    await screen.findByRole("option", { name: "Cuadros" });
    await user.click(screen.getByRole("button", { name: "Crear Cuadro" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Obra", slug: "obra", price: "450" }),
    );
  });

  it("warns when the product types cannot be loaded instead of a silently empty select", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });
    const { toast } = await import("react-hot-toast");
    const errorSpy = vi.spyOn(toast, "error");

    renderForm();

    await vi.waitFor(() => expect(errorSpy).toHaveBeenCalled());
  });
});
