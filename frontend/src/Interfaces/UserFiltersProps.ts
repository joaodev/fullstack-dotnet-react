export interface UserFiltersProps {
  filterText: string;
  onFilterTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCSV: () => void;
}
