import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageHeader } from "@/components/admin/PageHeader";

describe("PageHeader", () => {
  it("renders the title and description", () => {
    render(<PageHeader title="Pedidos" description="Gestiona los pedidos" />);

    expect(
      screen.getByRole("heading", { name: "Pedidos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Gestiona los pedidos")).toBeInTheDocument();
  });

  it("renders the action so every page places its primary button in the same spot", () => {
    render(
      <PageHeader title="Cuadros" action={<button>Añadir Cuadro</button>} />,
    );

    expect(
      screen.getByRole("button", { name: "Añadir Cuadro" }),
    ).toBeInTheDocument();
  });

  it("omits the description block when not provided", () => {
    render(<PageHeader title="Dashboard" />);

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Gestiona/)).not.toBeInTheDocument();
  });
});
