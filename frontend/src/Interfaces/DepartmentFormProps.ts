export interface DepartmentFormProps {
  name: string;
  error?: string;
  loading?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}
