import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import FiltersBar from "@/components/home/FiltersBar";
import { describe, it, expect, vi } from "vitest";

function TestHarness() {
  const [minCredit, setMinCredit] = React.useState("0");
  const [minDays, setMinDays] = React.useState("0");
  const [lastInteraction, setLastInteraction] = React.useState("0");

  return (
    <FiltersBar
      minCredit={minCredit}
      setMinCredit={setMinCredit}
      minDaysSince={minDays}
      setMinDaysSince={setMinDays}
      lastInteraction={lastInteraction}
      setLastInteraction={setLastInteraction}
    />
  );
}

describe(FiltersBar, () => {
  it("atualiza filtros", async () => {
    render(<TestHarness />);
    const user = userEvent.setup();

    const credit = screen.getByLabelText("Crédito Mínimo") as HTMLInputElement;
    await user.clear(credit);
    await user.type(credit, "123");
    expect(credit).toHaveValue(123); // valor refletiu no input (estado controlado)

    const days = screen.getByLabelText("Última compra") as HTMLInputElement;
    await user.clear(days);
    await user.type(days, "45");
    expect(days).toHaveValue(45);

    const last_interaction = screen.getByLabelText("Última interação") as HTMLInputElement;
    await user.clear(last_interaction);
    await user.type(last_interaction, "45");
      expect(last_interaction).toHaveValue(45);
  });
});