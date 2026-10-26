export interface PhotoRecord {
  id: string;
  dataUrl: string; // High-resolution data URL
  caption: string; // Comment below photo
  timestamp: string;
  tag?: string; // e.g. "Antes", "Durante", "Depois", "Avaria", "Concluído"
  aspectRatio?: number;
}

// Folha de Ajustes de Medidas (Redutores)
export interface ReductionAdjustmentSheet {
  enabled: boolean;
  componente?: string;
  tipoOs?: string;
  nUnid?: string;
  idPatrim?: string;
  eixo: {
    eixoAR: { la: string; loa: string };
    eixoInt: { la: string; loa: string };
    eixoInt2?: { la: string; loa: string };
    eixoBR: { la: string; loa: string };
    comentarios: string;
  };
  mancal: {
    carcacaAR: { laMedida: string; laProjeto: string; loaMedida: string; loaProjeto: string };
    carcacaInt: { laMedida: string; laProjeto: string; loaMedida: string; loaProjeto: string };
    carcacaInt2?: { laMedida: string; laProjeto: string; loaMedida: string; loaProjeto: string };
    carcacaBR: { laMedida: string; laProjeto: string; loaMedida: string; loaProjeto: string };
    comentarios: string;
  };
  rolamentos: {
    eixoAR: { laNum: string; laFolga: string; loaNum: string; loaFolga: string };
    eixoInt: { laNum: string; laFolga: string; loaNum: string; loaFolga: string };
    eixoInt2?: { laNum: string; laFolga: string; loaNum: string; loaFolga: string };
    eixoBR: { laNum: string; laFolga: string; loaNum: string; loaFolga: string };
  };
  engrenamentoComentarios: string;
  carcacaComentarios: string;
  folgasAxiais: {
    eixoAR: { ref: string; med1: string; med2: string };
    eixoInt: { ref: string; med1: string; med2: string };
    eixoInt2?: { ref: string; med1: string; med2: string };
    eixoBR: { ref: string; med1: string; med2: string };
  };
  servicosComentariosAdicionais: string;
}

// Procedimentos de Reforma (Checklists de Redutores, Bombas e Mancais)
export interface ProcedureChecklistItem {
  id: string;
  item: string;
  situacao: 'S' | 'N' | 'NA' | '';
  observacao: string;
}

export interface ProcedureChecklistSection {
  sectionNumber: number;
  sectionName: string;
  items: ProcedureChecklistItem[];
}

export interface ProcedureSheet {
  enabled: boolean;
  tipo: 'REDUTORES' | 'BOMBAS' | 'MANCAIS';
  componente?: string;
  tipoOs?: string;
  nUnid?: string;
  osPai?: string;
  sections: ProcedureChecklistSection[];
  conclusao: string;
}

export interface MaintenanceReport {
  id: string;
  title: string;
  tag: string; // TAG do Equipamento *
  os: string; // Ordem de Serviço (OS) *
  startDate: string; // Data Início *
  endDate?: string;
  generalComment: string; // Comentário Geral *
  technician: string; // Técnico Responsável
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'AGUARDANDO_PECAS' | 'INSPECAO';
  photos: PhotoRecord[];
  // Excel Sheet Tables
  adjustmentSheet?: ReductionAdjustmentSheet;
  procedureRedutores?: ProcedureSheet;
  procedureBombas?: ProcedureSheet;
  procedureMancais?: ProcedureSheet;
  partsOrderSheet?: PartsOrderSheet;
  motorSheet?: ElectricMotorSheet;
  createdAt: number;
  updatedAt: number;
}

// Lista p/ Pedido de Peças
export interface PartsOrderItem {
  id: string;
  codigo: string;
  quantidade: string;
  status?: string;
  descricaoPartNumber: string;
}

export interface PartsOrderSheet {
  enabled: boolean;
  data: string;
  tag: string;
  equipamento: string;
  solicitante: string; // POR:
  os: string;
  area: string;
  items: PartsOrderItem[];
  recipientEmails?: string[];
}

// Manutenção de Motores Elétricos (Testes Iniciais, Elétricos & Folgas Mecânicas)
export interface MotorSensors {
  tipo: string;
  estatorQtd: string;
  estatorStatus: string;
  mancalLAQtd: string;
  mancalLAStatus: string;
  mancalLOAQtd: string;
  mancalLOAStatus: string;
}

export interface MotorInsulation {
  tensaoAplicadaVcc: string;
  res30s: string;
  res1min: string;
  res10min: string;
  indiceAbsorcao: string;
  indicePolarizacao: string;
}

export interface ElectricMotorSheet {
  enabled: boolean;
  // Testes Iniciais / Dados de Placa
  data: string;
  os: string;
  equipamento: string;
  modeloCarcaca: string;
  potenciaCv: string;
  polos: string;
  velocidadeRpm: string;
  tensaoV: string;
  correnteA: string;
  ipIn: string;
  tag: string;
  numPatrimonio: string;
  numSerie: string;
  formaConstrutiva: string;
  classeIsolacao: string;
  tempAmbienteC: string;
  umidadeRelativaPercent: string;

  // Testes Estáticos (Resistência Ôhmica)
  resistenciaRS: string;
  resistenciaST: string;
  resistenciaTR: string;
  condicaoRS_ST_TR: string;
  desequilibrioPercent: string;
  limiteDR: string;

  // Sensores Antes e Depois
  sensoresAntes: MotorSensors;
  sensoresDepois: MotorSensors;

  // Resistência de Isolação Antes e Depois
  isolacaoAntes: MotorInsulation;
  isolacaoDepois: MotorInsulation;

  // Resistência de Aquecimento & Freio
  aquecimentoIndividualOhm: string;
  aquecimentoIsolacaoMassaMohm: string;
  freioResistenciaOhm: string;
  freioIsolacaoMassaMohm: string;

  // Página 2: Mecânica & Folgas
  executantes: string;
  condicoesChegadaObs: string;
  desmontagemComponentesObs: string;
  rolamentos: {
    la: { codigo: string; numeracao: string; medidaExterna: string; medidaInterna: string };
    loa: { codigo: string; numeracao: string; medidaExterna: string; medidaInterna: string };
  };
  eixo: {
    la: { h: string; v: string; medicao: string };
    lca: { h: string; v: string; medicao: string };
    observacoes: string;
  };
  mancal: {
    la: { h: string; v: string; medicao: string };
    lao: { h: string; v: string; medicao: string };
    observacoes: string;
  };
  modificacoesAjustesObs: string;
}

export interface AppSettings {
  preconfiguredEmail: string;
  recipientEmails?: string[];
  technicianDefaultName: string;
  companyName: string;
  photosPerPage: 1 | 2;
}
