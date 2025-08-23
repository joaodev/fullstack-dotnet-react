export interface ProductFiltersProps {
  filterText: string;
  minPrice: string;
  maxPrice: string;
  departmentFilter: string;
  onFilterTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMinPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDepartmentChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onExportCSV: () => void;
  departments: { id: string; name: string }[];
}
