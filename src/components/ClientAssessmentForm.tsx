import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import './ClientAssessmentForm.css';

// WhatsApp number from constants
const WHATSAPP_NUMBER = '+34-695-25-10-13';

// Form validation rules
const validateForm = (data: FormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.fullName) errors.fullName = 'El nombre completo es requerido';
  if (!data.email) errors.email = 'El email es requerido';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'El email no es válido';
  if (!data.phone) errors.phone = 'El teléfono es requerido';
  if (data.phone && !/^[\+]?[0-9\s\-\(\)]{9,15}$/.test(data.phone)) errors.phone = 'El teléfono debe tener entre 9 y 15 dígitos';
  if (!data.gender) errors.gender = 'El género es requerido';
  if (!data.dateOfBirth) errors.dateOfBirth = 'La fecha de nacimiento es requerida';
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
    if (actualAge < 16 || actualAge > 100) errors.dateOfBirth = 'Debes tener entre 16 y 100 años';
  }
  if (!data.height || data.height < 100 || data.height > 250) errors.height = 'La altura debe estar entre 100 y 250 cm';
  if (data.currentWeight && typeof data.currentWeight === 'number' && (data.currentWeight < 30 || data.currentWeight > 300)) errors.currentWeight = 'El peso debe estar entre 30 y 300 kg';
  if (!data.preferredTimes) errors.preferredTimes = 'Los horarios preferidos son requeridos';
  if (!data.exerciseFrequency) errors.exerciseFrequency = 'La frecuencia de ejercicio es requerida';
  if (!data.goals || data.goals.length === 0) errors.goals = 'Selecciona al menos un objetivo';
  if (!data.preferredTime) errors.preferredTime = 'El horario preferido es requerido';
  if (!data.preferredLocation) errors.preferredLocation = 'El lugar preferido es requerido';
  if (!data.measurementType) errors.measurementType = 'El tipo de medición es requerido';
  if (!data.drinksEnoughWater) errors.drinksEnoughWater = 'Esta información es requerida';
  if (!data.availableDays || data.availableDays.length === 0) errors.availableDays = 'Selecciona al menos un día';
  if (!data.acceptsTerms) errors.acceptsTerms = 'Debes aceptar los términos y condiciones';
  if (!data.acceptsDataProcessing) errors.acceptsDataProcessing = 'Debes aceptar el procesamiento de datos';
  
  return errors;
};

// Step validation functions
const validateStep = (step: number, data: FormData): boolean => {
  switch (step) {
    case 1: // Personal Information
      const isAgeValid = data.dateOfBirth ? (() => {
        const birthDate = new Date(data.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
        return actualAge >= 16 && actualAge <= 100;
      })() : false;
      
      return !!(
        data.fullName && 
        data.email && 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
        data.phone && 
        /^[\+]?[0-9\s\-\(\)]{9,15}$/.test(data.phone) &&
        data.gender &&
        data.dateOfBirth &&
        isAgeValid &&
        data.height && 
        data.height >= 100 && 
        data.height <= 250 &&
        (data.currentWeight === undefined || data.currentWeight === null || (typeof data.currentWeight === 'number' && data.currentWeight >= 30 && data.currentWeight <= 300)) &&
        data.comfortableWithWeighing !== undefined
      );
    case 2: // Health and Medical History
      return !!(data.hasMedicalCondition !== undefined && 
                data.takesMedication !== undefined && 
                data.hasInjuries !== undefined && 
                data.hasMedicalPrescription !== undefined);
    case 3: // Lifestyle and Habits
      return !!(data.works !== undefined && 
                data.availableDays && data.availableDays.length > 0 && 
                data.preferredTimes && 
                data.hasExercisedBefore !== undefined);
    case 4: // Goals
      return !!(data.goals && data.goals.length > 0);
    case 5: // Training Preferences
      return !!(data.exerciseFrequency && 
                data.preferredTime && 
                data.preferredLocation && 
                data.measurementType);
    case 6: // Health Habits
      return !!(data.drinksEnoughWater !== undefined);
    case 7: // Terms and Conditions
      return !!(data.acceptsTerms && data.acceptsDataProcessing);
    default:
      return true;
  }
};

interface FormData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  height: number;
  currentWeight?: number;
  comfortableWithWeighing: boolean;
  
  // Health and Medical History
  hasMedicalCondition: boolean;
  medicalConditionDetails?: string;
  takesMedication: boolean;
  medicationDetails?: string;
  hasInjuries: boolean;
  injuryDetails?: string;
  hasMedicalPrescription: boolean;
  
  // Lifestyle and Habits
  works: boolean;
  workArea?: string;
  workSchedule?: string;
  availableDays: string[];
  preferredTimes: string;
  hasExercisedBefore: boolean;
  exerciseType?: string;
  exerciseFrequency: string;
  
  // Goals
  goals: string[];
  otherGoal?: string;
  specificGoal?: string;
  
  // Preferences
  preferredTime: string;
  preferredLocation: string;
  dislikedExercises?: string;
  measurementType: string;
  
  // Nutrition
  followsSpecificDiet: boolean;
  dietType?: string;
  dislikedFoods?: string;
  drinksEnoughWater: string;
  
  // Other Details
  otherDetails?: string;
  
  // Terms and Conditions
  acceptsTerms: boolean;
  acceptsDataProcessing: boolean;
  subscribesToNewsletter: boolean;
}

const ClientAssessmentForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const totalSteps = 7;
  
  console.log('ClientAssessmentForm rendered, currentStep:', currentStep);
  
  const { control, handleSubmit, watch, formState: { errors, isSubmitting }, setError, clearErrors } = useForm<FormData>({
    defaultValues: {
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      availableDays: [],
      goals: [],
      comfortableWithWeighing: false,
      hasMedicalCondition: false,
      takesMedication: false,
      hasInjuries: false,
      hasMedicalPrescription: false,
      works: false,
      hasExercisedBefore: false,
      followsSpecificDiet: false,
      acceptsTerms: false,
      acceptsDataProcessing: false,
      subscribesToNewsletter: false
    }
  });

  const onSubmit = async (data: FormData) => {
    console.log('Form submission started', data);
    
    // Clear previous errors
    clearErrors();
    
    // Validate form
    const validationErrors = validateForm(data);
    console.log('Validation errors:', validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field as keyof FormData, { type: 'manual', message });
      });
      console.log('Form submission blocked by validation');
      return;
    }

    try {
      console.log('Sending request to API...');
      const response = await fetch('https://api.jernie.fit/api/submit-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('API response status:', response.status);
      const responseData = await response.json() as { error?: string; success?: boolean };
      console.log('API response data:', responseData);

      if (response.ok) {
        console.log('Form submitted successfully');
        setSubmittedData(data);
        setIsSubmitted(true);
      } else {
        throw new Error(`Error al enviar el formulario: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Hubo un error al enviar el formulario: ${errorMessage}. Por favor, inténtalo de nuevo.`);
    }
  };

  // Get current form values for validation
  const formValues = watch();
  
  // Check if current step is valid
  const isCurrentStepValid = validateStep(currentStep, formValues);

  // Wizard navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps && isCurrentStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  const getDayIcon = (dia: string) => {
    const dayIcons: { [key: string]: string } = {
      'Lunes': '📅',
      'Martes': '📅',
      'Miércoles': '📅',
      'Jueves': '📅',
      'Viernes': '📅',
      'Sábado': '🎉',
      'Domingo': '☀️'
    };
    return dayIcons[dia] || '📅';
  };
  
  const getObjetivoIcon = (objetivo: string) => {
    const objetivoIcons: { [key: string]: string } = {
      'Pérdida de peso': '⚖️',
      'Aumentar masa muscular': '💪',
      'Tonificar': '🔥',
      'Mejorar salud general': '❤️',
      'Reducir dolores o molestias': '🩹',
      'Mejorar flexibilidad': '🤸',
      'Aumentar energía': '⚡',
      'Reducir estrés': '🧘',
      'Mejorar postura': '📐',
      'Preparación para competencia': '🏆',
      'otro': '🎯'
    };
    return objetivoIcons[objetivo] || '🎯';
  };
  
  const objetivos = [
    'Pérdida de peso',
    'Aumentar masa muscular',
    'Tonificar',
    'Mejorar salud general',
    'Reducir dolores o molestias',
    'otro'
  ];
  const frecuenciaEjercicio = ['Nunca', '1-2 veces/semana', '3-4 veces/semana', '5+ veces/semana'];
  const horariosPreferidos = ['Mañana', 'Tarde', 'Noche'];
  const lugaresPreferidos = ['Casa', 'Gimnasio', 'Ambos'];
  const tiposMedicion = ['Fotos', 'Medidas (cm)', 'Sensaciones / ropa', 'Todo', 'Prefiero no medir nada'];
  const tomaAgua = ['Sí', 'No', 'No estoy segura'];

  // Custom button components
  const OptionButton: React.FC<{
    value: string | boolean;
    label: string;
    isSelected: boolean;
    onClick: () => void;
    icon?: string;
  }> = ({ value, label, isSelected, onClick, icon }) => (
    <button
      type="button"
      className={`option-button ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span className="button-label">{label}</span>
    </button>
  );

  const MultiSelectButton: React.FC<{
    value: string;
    label: string;
    isSelected: boolean;
    onClick: () => void;
    icon?: string;
  }> = ({ value, label, isSelected, onClick, icon }) => (
    <button
      type="button"
      className={`multi-select-button ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span className="button-label">{label}</span>
    </button>
  );

  // Show success message if form is submitted
  if (isSubmitted && submittedData) {
    const whatsappMessage = `Hola Jernie, soy ${submittedData.fullName} (${submittedData.phone}) y he completado mi evaluación personal. Me interesa agendar mi clase GRATIS.`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
    
    return (
      <div className="assessment-form-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>¡Evaluación Completada!</h2>
          <p>Gracias <strong>{submittedData.fullName}</strong>, hemos recibido tu información correctamente.</p>
          <p>Jernie revisará tu evaluación y se pondrá en contacto contigo pronto.</p>
          
          <div className="whatsapp-cta">
            <h3>¿Quieres agendar tu clase GRATIS ahora?</h3>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Agendar Clase GRATIS por WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-form-container">
      <div className="form-header">
        
        {/* Progress Indicator */}
        <div className="wizard-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Paso {currentStep} de {totalSteps}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="assessment-form">
        {/* Step 1: Datos Personales */}
        {currentStep === 1 && (
          <section className="form-section wizard-step">
            <h2>👤 Datos Personales</h2>
          
          <div className="form-group">
            <label htmlFor="fullName">Nombre completo *</label>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="fullName"
                  placeholder="Tu nombre completo"
                />
              )}
            />
            {errors.fullName && <span className="error">{errors.fullName.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  id="email"
                  placeholder="tu@email.com"
                />
              )}
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono *</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  id="phone"
                  placeholder="+34 123 456 789"
                />
              )}
            />
            {errors.phone && <span className="error">{errors.phone.message}</span>}
          </div>

          <div className="form-group">
            <label>Género *</label>
            <div className="button-group">
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <>
                    <OptionButton
                      value="female"
                      label="Femenino"
                      isSelected={field.value === 'female'}
                      onClick={() => field.onChange('female')}
                      icon="👩"
                    />
                    <OptionButton
                      value="male"
                      label="Masculino"
                      isSelected={field.value === 'male'}
                      onClick={() => field.onChange('male')}
                      icon="👨"
                    />
                  </>
                )}
              />
            </div>
            {errors.gender && <span className="error">{errors.gender.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Fecha de nacimiento *</label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  id="dateOfBirth"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                />
              )}
            />
            {errors.dateOfBirth && <span className="error">{errors.dateOfBirth.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height">Altura (cm) *</label>
              <Controller
                name="height"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="height"
                    min="100"
                    max="250"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                  />
                )}
              />
              {errors.height && <span className="error">{errors.height.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="currentWeight">Peso actual (kg)</label>
              <Controller
                name="currentWeight"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="currentWeight"
                    min="30"
                    max="300"
                    step="0.1"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || '')}
                  />
                )}
              />
              {errors.currentWeight && <span className="error">{errors.currentWeight.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>¿Te sientes cómoda pesándote regularmente? *</label>
            <div className="button-group">
              <Controller
                name="comfortableWithWeighing"
                control={control}
                render={({ field }) => (
                  <>
                    <OptionButton
                      value={true}
                      label="Sí"
                      isSelected={field.value === true}
                      onClick={() => field.onChange(true)}
                      icon="✅"
                    />
                    <OptionButton
                      value={false}
                      label="No"
                      isSelected={field.value === false}
                      onClick={() => field.onChange(false)}
                      icon="❌"
                    />
                  </>
                )}
              />
            </div>
            {errors.comfortableWithWeighing && <span className="error">{errors.comfortableWithWeighing.message}</span>}
          </div>
          </section>
        )}

        {/* Step 2: Salud y Antecedentes Médicos */}
        {currentStep === 2 && (
          <section className="form-section wizard-step">
            <h2>🏥 Salud y Antecedentes Médicos</h2>
          
          <div className="form-group">
            <label>¿Tienes alguna condición médica diagnosticada? *</label>
            <div className="button-group">
              <Controller
                name="hasMedicalCondition"
                control={control}
                render={({ field }) => (
                  <>
                    <OptionButton
                      value={true}
                      label="Sí"
                      isSelected={field.value === true}
                      onClick={() => field.onChange(true)}
                      icon="⚠️"
                    />
                    <OptionButton
                      value={false}
                      label="No"
                      isSelected={field.value === false}
                      onClick={() => field.onChange(false)}
                      icon="✅"
                    />
                  </>
                )}
              />
            </div>
            {errors.hasMedicalCondition && <span className="error">{errors.hasMedicalCondition.message}</span>}
          </div>

          {watch('hasMedicalCondition') && (
            <div className="form-group">
              <label htmlFor="condicionMedicaDetalle">Especifica la condición médica</label>
              <Controller
                name="medicalConditionDetails"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="condicionMedicaDetalle"
                    placeholder="Anemia, deficiencia de vitaminas, lesiones, etc."
                    rows={3}
                  />
                )}
              />
              {errors.medicalConditionDetails && <span className="error">{errors.medicalConditionDetails.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label>¿Tomas alguna medicación o suplemento actualmente? *</label>
            <div className="button-group">
              <Controller
                name="takesMedication"
                control={control}
                render={({ field }) => (
                  <>
                    <OptionButton
                      value={true}
                      label="Sí"
                      isSelected={field.value === true}
                      onClick={() => field.onChange(true)}
                      icon="💊"
                    />
                    <OptionButton
                      value={false}
                      label="No"
                      isSelected={field.value === false}
                      onClick={() => field.onChange(false)}
                      icon="✅"
                    />
                  </>
                )}
              />
            </div>
            {errors.takesMedication && <span className="error">{errors.takesMedication.message}</span>}
          </div>

          {watch('takesMedication') && (
            <div className="form-group">
              <label htmlFor="medicacionDetalle">¿Cuáles?</label>
              <Controller
                name="medicationDetails"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="medicacionDetalle"
                    placeholder="Lista de medicamentos y suplementos"
                    rows={3}
                  />
                )}
              />
              {errors.medicationDetails && <span className="error">{errors.medicationDetails.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label>¿Has tenido lesiones recientes o molestias físicas? *</label>
            <div className="button-group">
              <Controller
                name="hasInjuries"
                control={control}
                render={({ field }) => (
                  <>
                    <OptionButton
                      value={true}
                      label="Sí"
                      isSelected={field.value === true}
                      onClick={() => field.onChange(true)}
                      icon="🩹"
                    />
                    <OptionButton
                      value={false}
                      label="No"
                      isSelected={field.value === false}
                      onClick={() => field.onChange(false)}
                      icon="✅"
                    />
                  </>
                )}
              />
            </div>
            {errors.hasInjuries && <span className="error">{errors.hasInjuries.message}</span>}
          </div>

          {watch('hasInjuries') && (
            <div className="form-group">
              <label htmlFor="lesionesDetalle">¿Dónde?</label>
              <Controller
                name="injuryDetails"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="lesionesDetalle"
                    placeholder="Describe las lesiones o molestias"
                    rows={3}
                  />
                )}
              />
              {errors.injuryDetails && <span className="error">{errors.injuryDetails.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label>¿Tienes prescripción médica que limite tu actividad física? *</label>
            <div className="button-group">
              <Controller
                name="hasMedicalPrescription"
                control={control}
                render={({ field }) => (
                  <>
                    <OptionButton
                      value={true}
                      label="Sí"
                      isSelected={field.value === true}
                      onClick={() => field.onChange(true)}
                      icon="⚠️"
                    />
                    <OptionButton
                      value={false}
                      label="No"
                      isSelected={field.value === false}
                      onClick={() => field.onChange(false)}
                      icon="✅"
                    />
                  </>
                )}
              />
            </div>
            {errors.hasMedicalPrescription && <span className="error">{errors.hasMedicalPrescription.message}</span>}
          </div>
          </section>
        )}

        {/* Step 3: Hábitos y Estilo de Vida */}
        {currentStep === 3 && (
          <section className="form-section wizard-step">
            <h2>💼 Hábitos y Estilo de Vida</h2>
          
          <div className="form-group">
            <label>¿Trabajas actualmente? *</label>
            <div className="button-group">
              <Controller
                name="works"
                control={control}
                render={({ field }) => (
                  <>
                    <OptionButton
                      value={true}
                      label="Sí"
                      isSelected={field.value === true}
                      onClick={() => field.onChange(true)}
                      icon="💼"
                    />
                    <OptionButton
                      value={false}
                      label="No"
                      isSelected={field.value === false}
                      onClick={() => field.onChange(false)}
                      icon="🏠"
                    />
                  </>
                )}
              />
            </div>
            {errors.works && <span className="error">{errors.works.message}</span>}
          </div>

          {watch('works') && (
            <>
              <div className="form-group">
                <label htmlFor="areaTrabajo">¿En qué área?</label>
                <Controller
                  name="workArea"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="areaTrabajo"
                      placeholder="Tu área de trabajo"
                    />
                  )}
                />
                {errors.workArea && <span className="error">{errors.workArea.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="horarioLaboral">¿Cuál es tu horario laboral?</label>
                <Controller
                  name="workSchedule"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="horarioLaboral"
                      placeholder="Ej: 9:00 - 18:00"
                    />
                  )}
                />
                {errors.workSchedule && <span className="error">{errors.workSchedule.message}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label>¿Qué días tienes disponibilidad para entrenar? *</label>
            <div className="multi-select-group">
              <Controller
                name="availableDays"
                control={control}
                render={({ field }) => (
                  <>
                    {diasSemana.map((dia) => (
                      <MultiSelectButton
                        key={dia}
                        value={dia}
                        label={dia}
                        isSelected={field.value?.includes(dia) || false}
                        onClick={() => {
                          const currentValue = field.value || [];
                          if (currentValue.includes(dia)) {
                            field.onChange(currentValue.filter((d: string) => d !== dia));
                          } else {
                            field.onChange([...currentValue, dia]);
                          }
                        }}
                        icon={getDayIcon(dia)}
                      />
                    ))}
                  </>
                )}
              />
            </div>
            {errors.availableDays && <span className="error">{errors.availableDays.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="horariosPreferidos">Horarios preferidos *</label>
            <Controller
              name="preferredTimes"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="horariosPreferidos"
                  placeholder="Ej: Mañana temprano, después del trabajo, etc."
                />
              )}
            />
            {errors.preferredTimes && <span className="error">{errors.preferredTimes.message}</span>}
          </div>

          <div className="form-group">
            <label>¿Has hecho ejercicio anteriormente? *</label>
            <div className="button-group">
              <Controller
                name="hasExercisedBefore"
                control={control}
                render={({ field }) => (
                  <>
                    <OptionButton
                      value={true}
                      label="Sí"
                      isSelected={field.value === true}
                      onClick={() => field.onChange(true)}
                      icon="💪"
                    />
                    <OptionButton
                      value={false}
                      label="No"
                      isSelected={field.value === false}
                      onClick={() => field.onChange(false)}
                      icon="🆕"
                    />
                  </>
                )}
              />
            </div>
            {errors.hasExercisedBefore && <span className="error">{errors.hasExercisedBefore.message}</span>}
          </div>

          {watch('hasExercisedBefore') && (
            <div className="form-group">
              <label htmlFor="tipoEjercicio">¿Qué tipo?</label>
              <Controller
                name="exerciseType"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="tipoEjercicio"
                    placeholder="Gimnasio, running, yoga, etc."
                  />
                )}
              />
              {errors.exerciseType && <span className="error">{errors.exerciseType.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label>¿Con qué frecuencia hacías ejercicio antes? *</label>
            <div className="button-group">
              <Controller
                name="exerciseFrequency"
                control={control}
                render={({ field }) => (
                  <>
                    {frecuenciaEjercicio.map((freq) => (
                      <OptionButton
                        key={freq}
                        value={freq}
                        label={freq}
                        isSelected={field.value === freq}
                        onClick={() => field.onChange(freq)}
                        icon="📅"
                      />
                    ))}
                  </>
                )}
              />
            </div>
            {errors.exerciseFrequency && <span className="error">{errors.exerciseFrequency.message}</span>}
          </div>
          </section>
        )}

        {/* Step 4: Objetivos */}
        {currentStep === 4 && (
          <section className="form-section wizard-step">
            <h2>🎯 Objetivos</h2>
          
          <div className="form-group">
            <label>¿Cuál es tu objetivo principal? (puedes elegir más de uno) *</label>
            <div className="multi-select-group">
              <Controller
                name="goals"
                control={control}
                render={({ field }) => (
                  <>
                    {objetivos.map((objetivo) => (
                      <MultiSelectButton
                        key={objetivo}
                        value={objetivo}
                        label={objetivo === 'otro' ? 'Otro' : objetivo}
                        isSelected={field.value?.includes(objetivo) || false}
                        onClick={() => {
                          const currentValue = field.value || [];
                          if (currentValue.includes(objetivo)) {
                            field.onChange(currentValue.filter((o: string) => o !== objetivo));
                          } else {
                            field.onChange([...currentValue, objetivo]);
                          }
                        }}
                        icon={getObjetivoIcon(objetivo)}
                      />
                    ))}
                  </>
                )}
              />
            </div>
            {errors.goals && <span className="error">{errors.goals.message}</span>}
          </div>

          {watch('goals')?.includes('otro') && (
            <div className="form-group">
              <label htmlFor="objetivoOtro">Especifica el otro objetivo</label>
              <Controller
                name="otherGoal"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="objetivoOtro"
                    placeholder="Describe tu objetivo específico"
                  />
                )}
              />
              {errors.otherGoal && <span className="error">{errors.otherGoal.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="metaEspecifica">¿Tienes una meta específica o fecha límite?</label>
            <Controller
              name="specificGoal"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="metaEspecifica"
                  placeholder="Ej: Perder 10kg para el verano, correr 5km sin parar, etc."
                  rows={3}
                />
              )}
            />
          </div>
          </section>
        )}

        {/* Step 5: Preferencias */}
        {currentStep === 5 && (
          <section className="form-section wizard-step">
            <h2>⚙️ Preferencias</h2>
          
          <div className="form-group">
            <label>¿Te gustaría entrenar en la mañana, tarde o noche? *</label>
            <div className="button-group">
              <Controller
                name="preferredTime"
                control={control}
                render={({ field }) => (
                  <>
                    {horariosPreferidos.map((horario) => (
                      <OptionButton
                        key={horario}
                        value={horario}
                        label={horario}
                        isSelected={field.value === horario}
                        onClick={() => field.onChange(horario)}
                        icon="⏰"
                      />
                    ))}
                  </>
                )}
              />
            </div>
            {errors.preferredTime && <span className="error">{errors.preferredTime.message}</span>}
          </div>

          <div className="form-group">
            <label>¿Prefieres entrenar en casa o en el gimnasio? *</label>
            <div className="button-group">
              <Controller
                name="preferredLocation"
                control={control}
                render={({ field }) => (
                  <>
                    {lugaresPreferidos.map((lugar) => (
                      <OptionButton
                        key={lugar}
                        value={lugar}
                        label={lugar}
                        isSelected={field.value === lugar}
                        onClick={() => field.onChange(lugar)}
                        icon="🏠"
                      />
                    ))}
                  </>
                )}
              />
            </div>
            {errors.preferredLocation && <span className="error">{errors.preferredLocation.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="ejerciciosNoGustan">¿Hay ejercicios o actividades que no te gustan?</label>
            <Controller
              name="dislikedExercises"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="ejerciciosNoGustan"
                  placeholder="Ej: Correr, sentadillas, etc."
                  rows={3}
                />
              )}
            />
          </div>

          <div className="form-group">
            <label>¿Te gustaría que te mida con fotos, medidas corporales o solo sensaciones? *</label>
            <div className="button-group">
              <Controller
                name="measurementType"
                control={control}
                render={({ field }) => (
                  <>
                    {tiposMedicion.map((tipo) => (
                      <OptionButton
                        key={tipo}
                        value={tipo}
                        label={tipo}
                        isSelected={field.value === tipo}
                        onClick={() => field.onChange(tipo)}
                        icon="📏"
                      />
                    ))}
                  </>
                )}
              />
            </div>
            {errors.measurementType && <span className="error">{errors.measurementType.message}</span>}
          </div>
          </section>
        )}

        {/* Step 6: Alimentación */}
        {currentStep === 6 && (
          <section className="form-section wizard-step">
            <h2>🥗 Alimentación</h2>
          
          <div className="form-group">
            <label>¿Sigues algún tipo de alimentación específica? *</label>
            <div className="button-group">
              <Controller
                name="followsSpecificDiet"
                control={control}
                render={({ field }) => (
                  <>
                    <OptionButton
                      value={true}
                      label="Sí"
                      isSelected={field.value === true}
                      onClick={() => field.onChange(true)}
                      icon="🥗"
                    />
                    <OptionButton
                      value={false}
                      label="No"
                      isSelected={field.value === false}
                      onClick={() => field.onChange(false)}
                      icon="🍽️"
                    />
                  </>
                )}
              />
            </div>
            {errors.followsSpecificDiet && <span className="error">{errors.followsSpecificDiet.message}</span>}
          </div>

          {watch('followsSpecificDiet') && (
            <div className="form-group">
              <label htmlFor="tipoAlimentacion">¿Cuál?</label>
              <Controller
                name="dietType"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="tipoAlimentacion"
                    placeholder="Vegetariana, vegana, keto, etc."
                  />
                )}
              />
              {errors.dietType && <span className="error">{errors.dietType.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="alimentosNoGustan">¿Hay alimentos que no te gustan o no consumes?</label>
            <Controller
              name="dislikedFoods"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="alimentosNoGustan"
                  placeholder="Lista de alimentos que no te gustan o no consumes"
                  rows={3}
                />
              )}
            />
          </div>

          <div className="form-group">
            <label>¿Tomas suficiente agua a diario? *</label>
            <div className="button-group">
              <Controller
                name="drinksEnoughWater"
                control={control}
                render={({ field }) => (
                  <>
                    {tomaAgua.map((opcion) => (
                      <OptionButton
                        key={opcion}
                        value={opcion}
                        label={opcion}
                        isSelected={field.value === opcion}
                        onClick={() => field.onChange(opcion)}
                        icon="💧"
                      />
                    ))}
                  </>
                )}
              />
            </div>
            {errors.drinksEnoughWater && <span className="error">{errors.drinksEnoughWater.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="otrosDetalles">¿Hay algo que deba saber para adaptar mejor tu entrenamiento?</label>
            <Controller
              name="otherDetails"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="otrosDetalles"
                  placeholder="Cualquier información adicional que consideres importante..."
                  rows={4}
                />
              )}
            />
          </div>
          </section>
        )}

        {/* Step 7: Términos y Condiciones */}
        {currentStep === 7 && (
          <section className="form-section wizard-step">
            <h2>📋 Términos y Condiciones</h2>
            
            <div className="terms-section">
              <div className="terms-content">
                <h3>🔒 Protección de Datos Personales</h3>
                <p>
                  Los datos personales que proporcionas en este formulario serán tratados de manera confidencial 
                  y utilizados únicamente para crear tu plan de entrenamiento personalizado. 
                  Jernie Richard (JernieFit) se compromete a proteger tu privacidad y cumplir con la normativa 
                  de protección de datos (RGPD).
                </p>
                
                <h3>📝 Términos del Servicio</h3>
                <p>
                  Al completar esta evaluación, aceptas que:
                </p>
                <ul>
                  <li>La información proporcionada es veraz y completa</li>
                  <li>El plan de entrenamiento será personalizado según tus respuestas</li>
                  <li>Puedes contactar a Jernie para cualquier consulta o modificación</li>
                  <li>El servicio está sujeto a disponibilidad y horarios acordados</li>
                </ul>
                
                <h3>⚖️ Responsabilidad</h3>
                <p>
                  Es importante que consultes con un profesional médico antes de comenzar cualquier 
                  programa de ejercicio, especialmente si tienes condiciones médicas preexistentes.
                </p>
              </div>
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <Controller
                  name="acceptsTerms"
                  control={control}
                  render={({ field }) => (
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">
                        Acepto los <strong>términos y condiciones</strong> del servicio *
                      </span>
                    </label>
                  )}
                />
                {errors.acceptsTerms && <span className="error">{errors.acceptsTerms.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <Controller
                  name="acceptsDataProcessing"
                  control={control}
                  render={({ field }) => (
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">
                        Acepto el <strong>procesamiento de mis datos personales</strong> para la creación 
                        de mi plan de entrenamiento personalizado *
                      </span>
                    </label>
                  )}
                />
                {errors.acceptsDataProcessing && <span className="error">{errors.acceptsDataProcessing.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <Controller
                  name="subscribesToNewsletter"
                  control={control}
                  render={({ field }) => (
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">
                        Quiero <strong>suscribirme al boletín</strong> para recibir noticias y ofertas especiales
                      </span>
                    </label>
                  )}
                />
              </div>
            </div>
          </section>
        )}

        {/* Wizard Navigation */}
        <div className="wizard-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="nav-button prev-button">
              ← Anterior
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button 
              type="button" 
              onClick={nextStep} 
              className="nav-button next-button"
              disabled={!isCurrentStepValid}
            >
              Siguiente →
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? 'Enviando...' : 'Enviar Formulario'}
            </button>
          )}
        </div>
        
        {/* Validation Helper Text */}
        {currentStep < totalSteps && !isCurrentStepValid && (
          <div className="validation-helper">
            <p>⚠️ Completa todos los campos requeridos para continuar</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ClientAssessmentForm;
