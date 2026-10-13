// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrderStatusBadge } from "./order-status-badge";

describe("OrderStatusBadge", () => {
  it.each([
    ["pending", "Pending"],
    ["confirmed", "Confirmed"],
    ["shipped", "Shipped"],
    ["delivered", "Delivered"],
    ["cancelled", "Cancelled"],
  ] as const)("renders %s as %s", (status, label) => {
    render(<OrderStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeTruthy();
  });
});
