export interface LoginFormProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (formData: any) => void;
  isLoading?: boolean;
  error?: string;
}
