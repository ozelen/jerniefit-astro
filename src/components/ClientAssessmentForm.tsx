import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import './ClientAssessmentForm.css';

// WhatsApp number from constants
const WHATSAPP_NUMBER = '+34-695-25-10-13';

// Form validation rules
const validateForm = (data: FormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.nombreCompleto) errors.nombreCompleto = 'El nombre completo es requerido';
  if (!data.email) errors.email = 'El email es requerido';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'El email no es válido';
  if (!data.telefono) errors.telefono = 'El teléfono es requerido';
  if (data.telefono && !/^[\+]?[0-9\s\-\(\)]{9,15}$/.test(data.telefono)) errors.telefono = 'El teléfono debe tener entre 9 y 15 dígitos';
  if (!data.edad || data.edad < 16 || data.edad > 100) errors.edad = 'La edad debe estar entre 16 y 100 años';
  if (!data.altura || data.altura < 100 || data.altura > 250) errors.altura = 'La altura debe estar entre 100 y 250 cm';
  if (data.pesoActual && data.pesoActual !== '' && (data.pesoActual < 30 || data.pesoActual > 300)) errors.pesoActual = 'El peso debe estar entre 30 y 300 kg';
  if (!data.horariosPreferidos) errors.horariosPreferidos = 'Los horarios preferidos son requeridos';
  if (!data.frecuenciaEjercicio) errors.frecuenciaEjercicio = 'La frecuencia de ejercicio es requerida';
  if (!data.objetivos || data.objetivos.length === 0) errors.objetivos = 'Selecciona al menos un objetivo';
  if (!data.horarioPreferido) errors.horarioPreferido = 'El horario preferido es requerido';
  if (!data.lugarPreferido) errors.lugarPreferido = 'El lugar preferido es requerido';
  if (!data.tipoMedicion) errors.tipoMedicion = 'El tipo de medición es requerido';
  if (!data.tomaSuficienteAgua) errors.tomaSuficienteAgua = 'Esta información es requerida';
  if (!data.disponibilidadDias || data.disponibilidadDias.length === 0) errors.disponibilidadDias = 'Selecciona al menos un día';
  if (!data.aceptaTerminos) errors.aceptaTerminos = 'Debes aceptar los términos y condiciones';
  if (!data.aceptaProcesamientoDatos) errors.aceptaProcesamientoDatos = 'Debes aceptar el procesamiento de datos';
  
  return errors;
};

// Step validation functions
const validateStep = (step: number, data: FormData): boolean => {
  switch (step) {
    case 1: // Datos Personales
      return !!(
        data.nombreCompleto && 
        data.email && 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
        data.telefono && 
        /^[\+]?[0-9\s\-\(\)]{9,15}$/.test(data.telefono) &&
        data.edad && 
        data.edad >= 16 && 
        data.edad <= 100 &&
        data.altura && 
        data.altura >= 100 && 
        data.altura <= 250 &&
        (data.pesoActual === undefined || data.pesoActual === '' || data.pesoActual === null || (data.pesoActual >= 30 && data.pesoActual <= 300)) &&
        data.seSienteComodaPesandose !== undefined
      );
    case 2: // Salud y Antecedentes Médicos
      return !!(data.tieneCondicionMedica !== undefined && 
                data.tomaMedicacion !== undefined && 
                data.tieneLesiones !== undefined && 
                data.tienePrescripcionMedica !== undefined);
    case 3: // Hábitos y Estilo de Vida
      return !!(data.trabaja !== undefined && 
                data.disponibilidadDias && data.disponibilidadDias.length > 0 && 
                data.horariosPreferidos && 
                data.haHechoEjercicio !== undefined);
    case 4: // Objetivos
      return !!(data.objetivos && data.objetivos.length > 0);
    case 5: // Preferencias de Entrenamiento
      return !!(data.frecuenciaEjercicio && 
                data.horarioPreferido && 
                data.lugarPreferido && 
                data.tipoMedicion);
    case 6: // Hábitos de Salud
      return !!(data.tomaSuficienteAgua !== undefined);
    case 7: // Términos y Condiciones
      return !!(data.aceptaTerminos && data.aceptaProcesamientoDatos);
    default:
      return true;
  }
};

interface FormData {
  // Datos Personales
  nombreCompleto: string;
  email: string;
  telefono: string;
  edad: number;
  altura: number;
  pesoActual?: number;
  seSienteComodaPesandose: boolean;
  
  // Salud y Antecedentes Médicos
  tieneCondicionMedica: boolean;
  condicionMedicaDetalle?: string;
  tomaMedicacion: boolean;
  medicacionDetalle?: string;
  tieneLesiones: boolean;
  lesionesDetalle?: string;
  tienePrescripcionMedica: boolean;
  
  // Hábitos y Estilo de Vida
  trabaja: boolean;
  areaTrabajo?: string;
  horarioLaboral?: string;
  disponibilidadDias: string[];
  horariosPreferidos: string;
  haHechoEjercicio: boolean;
  tipoEjercicio?: string;
  frecuenciaEjercicio: string;
  
  // Objetivos
  objetivos: string[];
  objetivoOtro?: string;
  metaEspecifica?: string;
  
  // Preferencias
  horarioPreferido: string;
  lugarPreferido: string;
  ejerciciosNoGustan?: string;
  tipoMedicion: string;
  
  // Alimentación
  sigueAlimentacionEspecifica: boolean;
  tipoAlimentacion?: string;
  alimentosNoGustan?: string;
  tomaSuficienteAgua: string;
  
  // Otros Detalles
  otrosDetalles?: string;
  
  // Terms and Conditions
  aceptaTerminos: boolean;
  aceptaProcesamientoDatos: boolean;
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
      telefono: '',
      disponibilidadDias: [],
      objetivos: [],
      seSienteComodaPesandose: false,
      tieneCondicionMedica: false,
      tomaMedicacion: false,
      tieneLesiones: false,
      tienePrescripcionMedica: false,
      trabaja: false,
      haHechoEjercicio: false,
      sigueAlimentacionEspecifica: false,
      aceptaTerminos: false,
      aceptaProcesamientoDatos: false
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
      const responseData = await response.json();
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
      alert(`Hubo un error al enviar el formulario: ${error.message}. Por favor, inténtalo de nuevo.`);
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
    const whatsappMessage = `Hola Jernie, soy ${submittedData.nombreCompleto} (${submittedData.telefono}) y he completado mi evaluación personal. Me interesa agendar mi clase GRATIS.`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
    
    return (
      <div className="assessment-form-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>¡Evaluación Completada!</h2>
          <p>Gracias <strong>{submittedData.nombreCompleto}</strong>, hemos recibido tu información correctamente.</p>
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
            <label htmlFor="nombreCompleto">Nombre completo *</label>
            <Controller
              name="nombreCompleto"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="nombreCompleto"
                  placeholder="Tu nombre completo"
                />
              )}
            />
            {errors.nombreCompleto && <span className="error">{errors.nombreCompleto.message}</span>}
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
            <label htmlFor="telefono">Teléfono *</label>
            <Controller
              name="telefono"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  id="telefono"
                  placeholder="+34 123 456 789"
                />
              )}
            />
            {errors.telefono && <span className="error">{errors.telefono.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edad">Edad *</label>
              <Controller
                name="edad"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="edad"
                    min="16"
                    max="100"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                  />
                )}
              />
              {errors.edad && <span className="error">{errors.edad.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="altura">Altura (cm) *</label>
              <Controller
                name="altura"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="altura"
                    min="100"
                    max="250"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                  />
                )}
              />
              {errors.altura && <span className="error">{errors.altura.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="pesoActual">Peso actual (kg)</label>
              <Controller
                name="pesoActual"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="pesoActual"
                    min="30"
                    max="300"
                    step="0.1"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || '')}
                  />
                )}
              />
              {errors.pesoActual && <span className="error">{errors.pesoActual.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>¿Te sientes cómoda pesándote regularmente? *</label>
            <div className="button-group">
              <Controller
                name="seSienteComodaPesandose"
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
            {errors.seSienteComodaPesandose && <span className="error">{errors.seSienteComodaPesandose.message}</span>}
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
                name="tieneCondicionMedica"
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
            {errors.tieneCondicionMedica && <span className="error">{errors.tieneCondicionMedica.message}</span>}
          </div>

          {watch('tieneCondicionMedica') && (
            <div className="form-group">
              <label htmlFor="condicionMedicaDetalle">Especifica la condición médica</label>
              <Controller
                name="condicionMedicaDetalle"
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
              {errors.condicionMedicaDetalle && <span className="error">{errors.condicionMedicaDetalle.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label>¿Tomas alguna medicación o suplemento actualmente? *</label>
            <div className="button-group">
              <Controller
                name="tomaMedicacion"
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
            {errors.tomaMedicacion && <span className="error">{errors.tomaMedicacion.message}</span>}
          </div>

          {watch('tomaMedicacion') && (
            <div className="form-group">
              <label htmlFor="medicacionDetalle">¿Cuáles?</label>
              <Controller
                name="medicacionDetalle"
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
              {errors.medicacionDetalle && <span className="error">{errors.medicacionDetalle.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label>¿Has tenido lesiones recientes o molestias físicas? *</label>
            <div className="button-group">
              <Controller
                name="tieneLesiones"
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
            {errors.tieneLesiones && <span className="error">{errors.tieneLesiones.message}</span>}
          </div>

          {watch('tieneLesiones') && (
            <div className="form-group">
              <label htmlFor="lesionesDetalle">¿Dónde?</label>
              <Controller
                name="lesionesDetalle"
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
              {errors.lesionesDetalle && <span className="error">{errors.lesionesDetalle.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label>¿Tienes prescripción médica que limite tu actividad física? *</label>
            <div className="button-group">
              <Controller
                name="tienePrescripcionMedica"
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
            {errors.tienePrescripcionMedica && <span className="error">{errors.tienePrescripcionMedica.message}</span>}
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
                name="trabaja"
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
            {errors.trabaja && <span className="error">{errors.trabaja.message}</span>}
          </div>

          {watch('trabaja') && (
            <>
              <div className="form-group">
                <label htmlFor="areaTrabajo">¿En qué área?</label>
                <Controller
                  name="areaTrabajo"
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
                {errors.areaTrabajo && <span className="error">{errors.areaTrabajo.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="horarioLaboral">¿Cuál es tu horario laboral?</label>
                <Controller
                  name="horarioLaboral"
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
                {errors.horarioLaboral && <span className="error">{errors.horarioLaboral.message}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label>¿Qué días tienes disponibilidad para entrenar? *</label>
            <div className="multi-select-group">
              <Controller
                name="disponibilidadDias"
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
            {errors.disponibilidadDias && <span className="error">{errors.disponibilidadDias.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="horariosPreferidos">Horarios preferidos *</label>
            <Controller
              name="horariosPreferidos"
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
            {errors.horariosPreferidos && <span className="error">{errors.horariosPreferidos.message}</span>}
          </div>

          <div className="form-group">
            <label>¿Has hecho ejercicio anteriormente? *</label>
            <div className="button-group">
              <Controller
                name="haHechoEjercicio"
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
            {errors.haHechoEjercicio && <span className="error">{errors.haHechoEjercicio.message}</span>}
          </div>

          {watch('haHechoEjercicio') && (
            <div className="form-group">
              <label htmlFor="tipoEjercicio">¿Qué tipo?</label>
              <Controller
                name="tipoEjercicio"
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
              {errors.tipoEjercicio && <span className="error">{errors.tipoEjercicio.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label>¿Con qué frecuencia hacías ejercicio antes? *</label>
            <div className="button-group">
              <Controller
                name="frecuenciaEjercicio"
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
            {errors.frecuenciaEjercicio && <span className="error">{errors.frecuenciaEjercicio.message}</span>}
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
                name="objetivos"
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
            {errors.objetivos && <span className="error">{errors.objetivos.message}</span>}
          </div>

          {watch('objetivos')?.includes('otro') && (
            <div className="form-group">
              <label htmlFor="objetivoOtro">Especifica el otro objetivo</label>
              <Controller
                name="objetivoOtro"
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
              {errors.objetivoOtro && <span className="error">{errors.objetivoOtro.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="metaEspecifica">¿Tienes una meta específica o fecha límite?</label>
            <Controller
              name="metaEspecifica"
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
                name="horarioPreferido"
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
            {errors.horarioPreferido && <span className="error">{errors.horarioPreferido.message}</span>}
          </div>

          <div className="form-group">
            <label>¿Prefieres entrenar en casa o en el gimnasio? *</label>
            <div className="button-group">
              <Controller
                name="lugarPreferido"
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
            {errors.lugarPreferido && <span className="error">{errors.lugarPreferido.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="ejerciciosNoGustan">¿Hay ejercicios o actividades que no te gustan?</label>
            <Controller
              name="ejerciciosNoGustan"
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
                name="tipoMedicion"
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
            {errors.tipoMedicion && <span className="error">{errors.tipoMedicion.message}</span>}
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
                name="sigueAlimentacionEspecifica"
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
            {errors.sigueAlimentacionEspecifica && <span className="error">{errors.sigueAlimentacionEspecifica.message}</span>}
          </div>

          {watch('sigueAlimentacionEspecifica') && (
            <div className="form-group">
              <label htmlFor="tipoAlimentacion">¿Cuál?</label>
              <Controller
                name="tipoAlimentacion"
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
              {errors.tipoAlimentacion && <span className="error">{errors.tipoAlimentacion.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="alimentosNoGustan">¿Hay alimentos que no te gustan o no consumes?</label>
            <Controller
              name="alimentosNoGustan"
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
                name="tomaSuficienteAgua"
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
            {errors.tomaSuficienteAgua && <span className="error">{errors.tomaSuficienteAgua.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="otrosDetalles">¿Hay algo que deba saber para adaptar mejor tu entrenamiento?</label>
            <Controller
              name="otrosDetalles"
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
                  name="aceptaTerminos"
                  control={control}
                  render={({ field }) => (
                    <label className="checkbox-label">
                      <input
                        {...field}
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">
                        Acepto los <strong>términos y condiciones</strong> del servicio *
                      </span>
                    </label>
                  )}
                />
                {errors.aceptaTerminos && <span className="error">{errors.aceptaTerminos.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <Controller
                  name="aceptaProcesamientoDatos"
                  control={control}
                  render={({ field }) => (
                    <label className="checkbox-label">
                      <input
                        {...field}
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">
                        Acepto el <strong>procesamiento de mis datos personales</strong> para la creación 
                        de mi plan de entrenamiento personalizado *
                      </span>
                    </label>
                  )}
                />
                {errors.aceptaProcesamientoDatos && <span className="error">{errors.aceptaProcesamientoDatos.message}</span>}
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
