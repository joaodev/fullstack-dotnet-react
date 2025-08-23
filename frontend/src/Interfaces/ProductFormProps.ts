export interface ProductFormProps {
  code: string;
  description: string;
  price: string;
  departmentId: string;
  departments: { id: string; name: string }[];
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}
