import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders retro chess header and move history", () => {
  render(<App />);
  expect(screen.getByText(/Retro Chess/i)).toBeInTheDocument();
  expect(screen.getByText(/Move History/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /New Game/i })).toBeInTheDocument();
});
