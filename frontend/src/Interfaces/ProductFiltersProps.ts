export interface ProductFiltersProps {
  filterText: string;
  minPrice: string;
  maxPrice: string;
  onFilterTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMinPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCSV: () => void;
}
