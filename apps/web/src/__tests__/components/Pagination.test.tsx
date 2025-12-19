import { render, screen } from "@testing-library/react";
import { Pagination } from "@/components/common/Pagination";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/documents",
}));

describe("Pagination", () => {
  it("renders pagination with correct page info", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
      />
    );

    expect(screen.getByText(/Showing 1 to 10 of 50 items/i)).toBeInTheDocument();
  });

  it("does not render when totalPages is 1", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={5}
        itemsPerPage={10}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("disables previous button on first page", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
      />
    );

    const previousButton = screen.getByText(/previous/i);
    expect(previousButton).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
      />
    );

    const nextButton = screen.getByText(/next/i);
    expect(nextButton).toBeDisabled();
  });
});
