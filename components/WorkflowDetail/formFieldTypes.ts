export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  description?: string;
  default_value?: any;
  validation_rules?: Record<string, any>;
  options?: Array<{ label: string; value: string }>;
  position: number;
}

export type FormFieldType = 
  | 'text'
  | 'textarea' 
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'email'
  | 'password'
  | 'date'
  | 'file';

export interface FormFieldTypeDefinition {
  type: FormFieldType;
  name: string;
  description: string;
  icon: string;
  hasOptions: boolean;
  defaultConfig: Partial<FormField>;
}

export const FORM_FIELD_TYPES: FormFieldTypeDefinition[] = [
  {
    type: 'text',
    name: 'Text Input',
    description: 'Single line text input',
    icon: 'font-size',
    hasOptions: false,
    defaultConfig: {
      placeholder: 'Enter text...',
      validation_rules: { maxLength: 255 }
    }
  },
  {
    type: 'textarea',
    name: 'Textarea',
    description: 'Multi-line text input',
    icon: 'align-left',
    hasOptions: false,
    defaultConfig: {
      placeholder: 'Enter your text...',
      validation_rules: { maxLength: 5000 }
    }
  },
  {
    type: 'number',
    name: 'Number Input',
    description: 'Numeric input with validation',
    icon: 'number',
    hasOptions: false,
    defaultConfig: {
      placeholder: 'Enter number...',
      validation_rules: { min: 0, max: 999999 }
    }
  },
  {
    type: 'select',
    name: 'Select Dropdown',
    description: 'Dropdown selection with options',
    icon: 'down',
    hasOptions: true,
    defaultConfig: {
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ]
    }
  },
  {
    type: 'checkbox',
    name: 'Checkbox',
    description: 'Boolean true/false checkbox',
    icon: 'check-square',
    hasOptions: false,
    defaultConfig: {
      default_value: false
    }
  },
  {
    type: 'radio',
    name: 'Radio Buttons',
    description: 'Single selection from multiple options',
    icon: 'dot-chart',
    hasOptions: true,
    defaultConfig: {
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ]
    }
  },
  {
    type: 'email',
    name: 'Email Input',
    description: 'Email address with validation',
    icon: 'mail',
    hasOptions: false,
    defaultConfig: {
      placeholder: 'Enter email address...',
      validation_rules: { pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' }
    }
  },
  {
    type: 'password',
    name: 'Password Input',
    description: 'Password field with hidden text',
    icon: 'lock',
    hasOptions: false,
    defaultConfig: {
      placeholder: 'Enter password...',
      validation_rules: { minLength: 6 }
    }
  },
  {
    type: 'date',
    name: 'Date Input',
    description: 'Date picker input',
    icon: 'calendar',
    hasOptions: false,
    defaultConfig: {
      placeholder: 'Select date...'
    }
  },
  {
    type: 'file',
    name: 'File Upload',
    description: 'File upload input',
    icon: 'upload',
    hasOptions: false,
    defaultConfig: {
      validation_rules: { 
        maxSize: 10485760, // 10MB
        allowedTypes: ['image/*', '.pdf', '.doc', '.docx']
      }
    }
  }
];

export const getFieldTypeDefinition = (type: FormFieldType): FormFieldTypeDefinition | undefined => {
  return FORM_FIELD_TYPES.find(def => def.type === type);
};

export const createNewField = (type: FormFieldType, position: number): FormField => {
  const definition = getFieldTypeDefinition(type);
  const id = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name: `field_${position + 1}`,
    label: definition?.name || 'New Field',
    type,
    required: false,
    position,
    ...definition?.defaultConfig
  };
};