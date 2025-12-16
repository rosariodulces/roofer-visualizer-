import { RoofOption, ColorOption } from './types';

export const ROOF_MATERIALS: RoofOption[] = [
  { 
    id: 'tile-roof', 
    name: 'Tile Roof', 
    name_es: 'Teja', 
    description: 'Classic durability with distinctive style.',
    description_es: 'Durabilidad clásica con estilo distintivo.' 
  },
  { 
    id: 'metal-roof', 
    name: 'Metal Roof', 
    name_es: 'Metal', 
    description: 'Sleek, modern, and energy efficient.',
    description_es: 'Elegante, moderno y energéticamente eficiente.' 
  },
  { 
    id: 'concrete-roof', 
    name: 'Concrete Roof', 
    name_es: 'Concreto', 
    description: 'Versatile strength mimicking other styles.',
    description_es: 'Resistencia versátil que imita otros estilos.' 
  },
  { 
    id: 'shingle-roof', 
    name: 'Shingle Roof', 
    name_es: 'Tejas de Asfalto', 
    description: 'Traditional, affordable, and popular.',
    description_es: 'Tradicional, económico y popular.' 
  },
  { 
    id: 'slate-roof', 
    name: 'Slate Roof', 
    name_es: 'Pizarra', 
    description: 'Premium natural stone elegance.',
    description_es: 'Elegancia de piedra natural premium.' 
  },
  { 
    id: 'wood-shake-roof', 
    name: 'Wood Shake Roof', 
    name_es: 'Madera', 
    description: 'Rustic natural beauty.',
    description_es: 'Belleza natural rústica.' 
  },
];

export const ROOF_COLORS: ColorOption[] = [
  { id: 'arctic-white', name: 'Arctic White', name_es: 'Blanco Ártico', hex: '#e2e8f0' },
  { id: 'pewter-gray', name: 'Pewter Gray', name_es: 'Gris Peltre', hex: '#94a3b8' },
  { id: 'slate-grey', name: 'Slate Grey', name_es: 'Gris Pizarra', hex: '#525b68' },
  { id: 'charcoal', name: 'Charcoal Black', name_es: 'Negro Carbón', hex: '#2D2D2D' },
  
  { id: 'midnight-blue', name: 'Midnight Blue', name_es: 'Azul Medianoche', hex: '#1e3a8a' },
  { id: 'navy-blue', name: 'Navy Blue', name_es: 'Azul Marino', hex: '#28334a' },
  { id: 'forest-green', name: 'Forest Green', name_es: 'Verde Bosque', hex: '#2d4531' },
  { id: 'moss-green', name: 'Moss Green', name_es: 'Verde Musgo', hex: '#4d7c0f' },
  
  { id: 'classic-red', name: 'Classic Red', name_es: 'Rojo Clásico', hex: '#8B0000' },
  { id: 'terracotta', name: 'Terracotta Red', name_es: 'Rojo Terracota', hex: '#b55845' },
  { id: 'burnt-sienna', name: 'Burnt Sienna', name_es: 'Siena Tostado', hex: '#9a3412' },
  { id: 'copper', name: 'Classic Copper', name_es: 'Cobre Clásico', hex: '#b45309' },
  { id: 'aged-copper', name: 'Aged Copper', name_es: 'Cobre Envejecido', hex: '#0d9488' },

  { id: 'sand-tan', name: 'Sand Tan', name_es: 'Arena', hex: '#d1bfa3' },
  { id: 'golden-cedar', name: 'Golden Cedar', name_es: 'Cedro Dorado', hex: '#ca8a04' },
  { id: 'weathered-wood', name: 'Weathered Wood', name_es: 'Madera Envejecida', hex: '#6d5645' },
  { id: 'mission-brown', name: 'Mission Brown', name_es: 'Marrón Misión', hex: '#451a03' },
];

export const UI_TEXT = {
  en: {
    systemOnline: 'SYSTEM ONLINE',
    initProject: 'Initialize Project',
    releaseUpload: 'Release to Upload',
    dragDrop: 'DRAG SATELLITE IMAGERY OR BLUEPRINTS HERE',
    accessDrive: 'Access Local Drive',
    incomingStream: 'INCOMING DATA STREAM DETECTED',
    systemStandby: 'SYSTEM STANDBY // AWAITING INPUT',
    nextGenArch: 'Next Gen Architecture',
    futureProof: 'Future Proof',
    yourShelter: 'Your Shelter',
    heroDesc: 'Deploy advanced neural networks to simulate premium roofing materials. Upload schematic data below to initiate simulation.',
    materialSelect: 'Material Selection',
    colorGrade: 'Color Grade',
    initiateRender: 'INITIATE RENDER SEQUENCE',
    resetSystem: 'RESET SYSTEM',
    aiConsultant: 'AI Consultant',
    analyzing: 'ANALYZING AESTHETICS...',
    awaitingSelect: 'AWAITING MATERIAL SELECTION...',
    original: 'Original',
    render: 'Render',
    export: 'Export Data',
    processing: 'PROCESSING ARCHITECTURE',
    physics: 'APPLYING MATERIAL PHYSICS...',
    resolving: 'RESOLVING',
    analysisLog: 'Analysis Log',
    archStyle: 'Architectural Style',
    matMatrix: 'Material Matrix',
    aiReasoning: 'AI Reasoning',
    scanning: 'SCANNING STRUCTURE...',
    server: 'SERVER',
    latency: 'LATENCY',
    error: 'Failed to generate visualization. System overload or content rejection.',
    errorAnalysis: 'Failed to analyze image. Please try a different photo.',
  },
  es: {
    systemOnline: 'SISTEMA EN LÍNEA',
    initProject: 'Inicializar Proyecto',
    releaseUpload: 'Soltar para Subir',
    dragDrop: 'ARRASTRE IMÁGENES SATELITALES O PLANOS AQUÍ',
    accessDrive: 'Acceder a Disco Local',
    incomingStream: 'FLUJO DE DATOS ENTRANTE DETECTADO',
    systemStandby: 'SISTEMA EN ESPERA // ESPERANDO ENTRADA',
    nextGenArch: 'Arquitectura de Próxima Generación',
    futureProof: 'Proteja Su',
    yourShelter: 'Refugio',
    heroDesc: 'Despliegue redes neuronales avanzadas para simular materiales de techo premium. Suba datos esquemáticos abajo para iniciar.',
    materialSelect: 'Selección de Material',
    colorGrade: 'Grado de Color',
    initiateRender: 'INICIAR SECUENCIA DE RENDERIZADO',
    resetSystem: 'REINICIAR SISTEMA',
    aiConsultant: 'Consultor IA',
    analyzing: 'ANALIZANDO ESTÉTICA...',
    awaitingSelect: 'ESPERANDO SELECCIÓN DE MATERIAL...',
    original: 'Original',
    render: 'Render',
    export: 'Exportar Datos',
    processing: 'PROCESANDO ARQUITECTURA',
    physics: 'APLICANDO FÍSICA DE MATERIALES...',
    resolving: 'RESOLVIENDO',
    analysisLog: 'Registro de Análisis',
    archStyle: 'Estilo Arquitectónico',
    matMatrix: 'Matriz de Materiales',
    aiReasoning: 'Razonamiento IA',
    scanning: 'ESCANEA ESTRUCTURA...',
    server: 'SERVIDOR',
    latency: 'LATENCIA',
    error: 'Fallo al generar visualización. Sobrecarga del sistema o rechazo de contenido.',
    errorAnalysis: 'Fallo al analizar la imagen. Por favor intente con otra foto.',
  }
};