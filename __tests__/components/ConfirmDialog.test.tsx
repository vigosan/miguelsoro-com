import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const confirmation = {
  title: "Reembolsar pedido",
  description: "Se reembolsarán 151,25 € al cliente.",
  confirmLabel: "Reembolsar",
  action: vi.fn(),
};

describe("ConfirmDialog", () => {
  it("shows the title, description and confirm label", () => {
    render(<ConfirmDialog confirmation={confirmation} onClose={vi.fn()} />);

    expect(screen.getByText("Reembolsar pedido")).toBeInTheDocument();
    expect(
      screen.getByText("Se reembolsarán 151,25 € al cliente."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("confirm-dialog-confirm")).toHaveTextContent(
      "Reembolsar",
    );
  });

  it("runs the action and closes on confirm", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const action = vi.fn();

    render(
      <ConfirmDialog
        confirmation={{ ...confirmation, action }}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByTestId("confirm-dialog-confirm"));

    expect(action).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes without running the action on cancel, so no destructive action fires by accident", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const action = vi.fn();

    render(
      <ConfirmDialog
        confirmation={{ ...confirmation, action }}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByTestId("confirm-dialog-cancel"));

    expect(action).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when there is no pending confirmation", () => {
    render(<ConfirmDialog confirmation={null} onClose={vi.fn()} />);

    expect(screen.queryByText("Reembolsar pedido")).not.toBeInTheDocument();
  });
});
