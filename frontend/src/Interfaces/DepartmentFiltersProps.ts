export interface DepartmentFiltersProps {
  filterText: string;
  onFilterTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCSV: () => void;
}
