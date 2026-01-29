import { Resident } from "./penduduk";
import { LogSurat, FormatSurat } from "./surat";

// ==========================================
// 1. Structure for Dynamic Form Fields
// ==========================================

export type WidgetType = 'text' | 'number' | 'date' | 'textarea' | 'dropdown' | 'land_boundaries' | 'land_sketch';

export interface FormFieldDefinition {
  id: string;          // Unique ID of the widget/node in the template
  label: string;       // Label to show the user (e.g. "Keperluan")
  key: string;         // The variable name (e.g. "keperluan_surat")
  type: WidgetType;    // Type of input needed
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: string[];  // For dropdowns
  props?: any;         // Additional props from the template node
}

// ==========================================
// 2. The Wizard State Interface
// ==========================================

export interface SuratWizardState {
  step: 'select_resident' | 'select_template' | 'fill_form' | 'preview' | 'finish';
  selectedResident: Resident | null;
  selectedTemplate: FormatSurat | null;
  formData: Record<string, any>; // Key-value pair of user inputs
}

// ==========================================
// 3. Logic for Field Extraction (Mock Implementation)
// ==========================================

/**
 * Parses the Craft.js JSON template and identifies widgets that require user input.
 * This ensures the "Form Isian" matches the specific template selected.
 */
export function extractFieldsFromTemplate(templateJson: string): FormFieldDefinition[] {
  const fields: FormFieldDefinition[] = [];
  
  try {
    const nodes = JSON.parse(templateJson);
    
    // Traverse nodes to find those marked for input
    // This is a simplified logic. In reality, we'd recursively check children.
    Object.values(nodes).forEach((node: any) => {
      const props = node.props || {};
      
      // Example: DataRow widget with useInput=true
      if (node.type?.resolvedName === 'DataRow' && props.useInput) {
        fields.push({
          id: node.id,
          label: props.label || 'Input',
          key: props.variable || node.id,
          type: 'text', // Default to text, could be inferred from props
          required: true,
          placeholder: props.inputPlaceholder
        });
      }
      
      // Example: LandBoundaries widget
      if (node.type?.resolvedName === 'LandBoundaries') {
        fields.push({
          id: node.id,
          label: 'Batas Tanah (Preview)',
          key: 'land_boundaries',
          type: 'land_boundaries',
          required: false, // Usually derived from sketch
          defaultValue: props.boundaries
        });
      }

      // Example: LandSketch widget
      if (node.type?.resolvedName === 'LandSketch') {
        const defaultPoints = [
          { x: 50, y: 50 },
          { x: 250, y: 50 },
          { x: 250, y: 150 },
          { x: 50, y: 150 },
        ];
        
        fields.push({
          id: node.id,
          label: 'Sketsa Tanah & Batas',
          key: 'land_sketch',
          type: 'land_sketch',
          required: true,
          defaultValue: {
            points: props.points || defaultPoints,
            labels: props.labels || [],
            scale: props.scale || 10
          },
          props: props
        });
      }
    });
    
  } catch (e) {
    console.error("Failed to parse template for fields", e);
  }
  
  return fields;
}

// ==========================================
// 4. Logic for Auto-Filling Data
// ==========================================

/**
 * Maps resident data to template variables.
 * Used to preview the letter before printing.
 */
export function mapResidentToTemplate(resident: Resident, templateContent: string): string {
  let content = templateContent;
  
  // Basic replacement logic (can be more advanced with regex)
  const replacements: Record<string, string> = {
    '[nama]': resident.nama,
    '[nik]': resident.nik,
    '[tempat_lahir]': resident.tempat_lahir || '',
    '[tanggal_lahir]': resident.tanggal_lahir || '',
    '[alamat]': resident.alamat_saat_ini || '',
    '[pekerjaan]': resident.pekerjaan || '-',
    '[agama]': resident.agama || '-',
    // Add more mappings as needed
  };

  // Note: Actual replacement happens during rendering, usually by the Craft.js Editor 
  // or a specialized renderer. This function is for simple string replacements 
  // if the template uses simple placeholders.
  
  return content;
}
