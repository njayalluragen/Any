import { ContactForm } from './ContactForm';

interface EmbeddableFormProps {
  userId: string;
}

export function EmbeddableForm({ userId }: EmbeddableFormProps) {
  return (
    <div className="p-4">
      <ContactForm userId={userId} />
    </div>
  );
}
