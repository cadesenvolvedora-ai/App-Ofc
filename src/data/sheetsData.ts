import { 
  ReductionAdjustmentSheet, 
  ProcedureSheet, 
  ProcedureChecklistSection,
  PartsOrderSheet,
  PartsOrderItem,
  ElectricMotorSheet
} from '../types';

export function createDefaultAdjustmentSheet(): ReductionAdjustmentSheet {
  return {
    enabled: false,
    componente: 'REDUTOR',
    tipoOs: '',
    nUnid: '',
    idPatrim: '',
    eixo: {
      eixoAR: { la: '', loa: '' },
      eixoInt: { la: '', loa: '' },
      eixoInt2: { la: '', loa: '' },
      eixoBR: { la: '', loa: '' },
      comentarios: '',
    },
    mancal: {
      carcacaAR: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' },
      carcacaInt: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' },
      carcacaInt2: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' },
      carcacaBR: { laMedida: '', laProjeto: '', loaMedida: '', loaProjeto: '' },
      comentarios: '',
    },
    rolamentos: {
      eixoAR: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' },
      eixoInt: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' },
      eixoInt2: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' },
      eixoBR: { laNum: '', laFolga: '', loaNum: '', loaFolga: '' },
    },
    engrenamentoComentarios: '',
    carcacaComentarios: '',
    folgasAxiais: {
      eixoAR: { ref: '', med1: '', med2: '' },
      eixoInt: { ref: '', med1: '', med2: '' },
      eixoInt2: { ref: '', med1: '', med2: '' },
      eixoBR: { ref: '', med1: '', med2: '' },
    },
    servicosComentariosAdicionais: '',
  };
}

export function createDefaultProcedureRedutores(): ProcedureSheet {
  const sections: ProcedureChecklistSection[] = [
    {
      sectionNumber: 1,
      sectionName: 'PREPARAÇÃO',
      items: [
        { id: 'red_prep_1', item: 'UTILIZANDO UMA BOMBA DE TRANSFERÊNCIA DE ÓLEO, DRENE O OLÉO DO REDUTOR', situacao: '', observacao: '' },
        { id: 'red_prep_2', item: 'REALIZE A LIMPEZA EXTERNA', situacao: '', observacao: '' },
        { id: 'red_prep_3', item: 'MEÇA A FOLGA AXIAL DOS EIXOS E REGISTRE NA FOLHA DE AJUSTES', situacao: '', observacao: '' },
        { id: 'red_prep_4', item: 'MONTE O CONJUNTO DE EXTRAÇÃO DE ACOPLAMENTO', situacao: '', observacao: '' },
        { id: 'red_prep_5', item: 'AQUEÇA O ACOPLAMENTO UTILIZANDO CHUVEIROS ATÉ QUE DILATE O SUFICIENTE', situacao: '', observacao: '' },
        { id: 'red_prep_6', item: 'ACIONE O CILINDRO HIDRÁULICO', situacao: '', observacao: '' },
        { id: 'red_prep_7', item: 'REPITA O PROCEDIMENTO PARA OS OUTROS ACOPLAMENTOS', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 2,
      sectionName: 'DESMONTAGEM',
      items: [
        { id: 'red_desm_1', item: 'QUEBRE O TORQUE DOS PARAFUSOS DA CARCAÇA', situacao: '', observacao: '' },
        { id: 'red_desm_2', item: 'RETIRE OS PARAFUSOS QUE FIXAM AS TAMPAS E CARCAÇA SUPERIOR E INFERIOR', situacao: '', observacao: '' },
        { id: 'red_desm_3', item: 'REMOVA AS TAMPAS E REALIZE O IÇAMENTO DA CARCAÇA SUPERIOR', situacao: '', observacao: '' },
        { id: 'red_desm_4', item: 'REMOVA AS ENGRENAGENS E EIXOS', situacao: '', observacao: '' },
        { id: 'red_desm_5', item: 'MEÇA AS BASES DOS ROLAMENTOS NOS EIXOS E MANCAIS E REGISTRE NA FOLHA DE AJUSTES', situacao: '', observacao: '' },
        { id: 'red_desm_6', item: 'DESMONTE TODOS RETENTORES, ESPAÇADORES E LUVAS', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 3,
      sectionName: 'LIMPEZA DE PEÇAS',
      items: [
        { id: 'red_limp_1', item: 'LIMPE TODAS AS PARTES DESMONTADAS COM SOLVENTES APROPRIADOS', situacao: '', observacao: '' },
        { id: 'red_limp_2', item: 'REMOVA RESÍDUOS DE ÓLEO, GRAXA E SUJEIRA DAS SUPERFÍCIES INTERNAS E EXTERNAS', situacao: '', observacao: '' },
        { id: 'red_limp_3', item: 'REGISTRE A CONDIÇÃO DAS PEÇAS', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 4,
      sectionName: 'INSPEÇÃO',
      items: [
        { id: 'red_insp_1', item: 'REALIZE INSPEÇÃO VISUAL DAS CARCAÇAS, TUBOS DE LUBRIFICAÇÃO E ENGRENAMENTO', situacao: '', observacao: '' },
        { id: 'red_insp_2', item: 'REGISTRE A CONDIÇÃO DA CARCAÇA', situacao: '', observacao: '' },
        { id: 'red_insp_3', item: 'REGISTRE A CONDIÇÃO DO CONJUNTO ENGRENADO', situacao: '', observacao: '' },
        { id: 'red_insp_4', item: 'INSPECIONE OS ROLAMENTOS', situacao: '', observacao: '' },
        { id: 'red_insp_5', item: 'NECESSÁRIO TROCA DOS ROLAMENTOS?', situacao: '', observacao: '' },
        { id: 'red_insp_6', item: 'DESMONTE OS ROLAMENTOS', situacao: '', observacao: '' },
        { id: 'red_insp_7', item: 'MEÇA O EIXO NA BASE DOS ROLAMENTOS E REGISTRE AS MEDIDAS', situacao: '', observacao: '' },
        { id: 'red_insp_8', item: 'REGISTRE A CONDIÇÃO DOS MANCAIS', situacao: '', observacao: '' },
        { id: 'red_insp_9', item: 'MEÇA OS MANCAIS E REGISTRE AS MEDIDAS', situacao: '', observacao: '' },
        { id: 'red_insp_10', item: 'REGISTRE A CONDIÇÃO DAS TAMPAS', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 5,
      sectionName: 'PEDIDO DE PEÇAS',
      items: [
        { id: 'red_ped_1', item: 'REALIZE O PEDIDO DE PEÇAS PARA REPOSIÇÃO', situacao: '', observacao: '' },
        { id: 'red_ped_2', item: 'TODOS OS ITENS REQUISITADOS ESTÃO DE ACORDO COM PROJETO?', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 6,
      sectionName: 'MONTAGEM',
      items: [
        { id: 'red_mont_1', item: 'SUBSTITUA AS PEÇAS DANIFICADAS', situacao: '', observacao: '' },
        { id: 'red_mont_2', item: 'MONTE OS ROLAMENTOS NOS EIXOS', situacao: '', observacao: '' },
        { id: 'red_mont_3', item: 'MEÇA A FOLGA RADIAL DOS ROLAMENTOS ANTES E DEPOIS DA MONTAGEM E REGISTRE AS MEDIDAS NA FOLHA DE AJUSTES', situacao: '', observacao: '' },
        { id: 'red_mont_4', item: 'MONTE O CONJUNTO ENGRENADO NA CARCAÇA INFERIOR', situacao: '', observacao: '' },
        { id: 'red_mont_5', item: 'REALIZE O TESTE DE CONTATO ENTRE ENGRENAGENS', situacao: '', observacao: '' },
        { id: 'red_mont_6', item: 'CONTATO APROVADO?', situacao: '', observacao: '' },
        { id: 'red_mont_7', item: 'MONTE AS TAMPAS E CARCAÇA SUPERIOR, FIXANDO-AS COM OS PARAFUSOS', situacao: '', observacao: '' },
        { id: 'red_mont_8', item: 'UTILIZANDO UMA ALAVANCA, VERIFIQUE AS FOLGAS AXIAIS NOS EIXOS (REALIZAR PROCEDIMENTO COM DUAS PESSOAS DISTINTAS)', situacao: '', observacao: '' },
        { id: 'red_mont_9', item: 'NECESSÁRIO UTILIZAÇÃO DE CALÇOS?', situacao: '', observacao: '' },
        { id: 'red_mont_10', item: 'NECESSÁRIO AJUSTE NAS TAMPAS?', situacao: '', observacao: '' },
        { id: 'red_mont_11', item: 'REGISTRE AS MEDIDAS FINAIS', situacao: '', observacao: '' },
        { id: 'red_mont_12', item: 'FOLGA ESTÁ DE ACORDO COM ESPECIFICAÇÃO DO PROJETO?', situacao: '', observacao: '' },
        { id: 'red_mont_13', item: 'APLIQUE OS TORQUES INDICADOS NOS PARAFUSOS DA CARCAÇA', situacao: '', observacao: '' },
        { id: 'red_mont_14', item: 'AQUEÇA OS ACOPLAMENTOS NA ESTUFA', situacao: '', observacao: '' },
        { id: 'red_mont_15', item: 'REALIZE A MONTAGEM DOS ACOPLAMENTOS', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 7,
      sectionName: 'INSPEÇÃO FINAL',
      items: [
        { id: 'red_fin_1', item: 'REALIZE VERIFICAÇÃO FINAL PARA GARANTIR QUE TODOS COMPONENTES ESTÃO INSTALADOS CORRETAMENTE E FUNCIONANDO DENTRO DAS TOLERÂNCIAS', situacao: '', observacao: '' },
        { id: 'red_fin_2', item: 'PARTE MECÂNICA APROVADA?', situacao: '', observacao: '' },
        { id: 'red_fin_3', item: 'ROLAMENTOS LUBRIFICADOS?', situacao: '', observacao: '' },
        { id: 'red_fin_4', item: 'REDUTOR COM ÓLEO?', situacao: '', observacao: '' },
      ],
    },
  ];

  return {
    enabled: false,
    tipo: 'REDUTORES',
    componente: 'REDUTOR',
    tipoOs: '',
    nUnid: '',
    osPai: '',
    sections,
    conclusao: '',
  };
}

export function createDefaultProcedureBombas(): ProcedureSheet {
  const sections: ProcedureChecklistSection[] = [
    {
      sectionNumber: 1,
      sectionName: 'PREPARAÇÃO',
      items: [
        { id: 'bom_prep_1', item: 'REALIZE A LIMPEZA EXTERNA', situacao: '', observacao: '' },
        { id: 'bom_prep_2', item: 'AQUEÇA O ACOPLAMENTO UTILIZANDO CHUVEIROS ATÉ QUE DILATE O SUFICIENTE', situacao: '', observacao: '' },
        { id: 'bom_prep_3', item: 'REMOVA O ACOPLAMENTO', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 2,
      sectionName: 'DESMONTAGEM',
      items: [
        { id: 'bom_desm_1', item: 'RETIRE OS PARAFUSOS QUE FIXAM AS TAMPAS E CARCAÇA.', situacao: '', observacao: '' },
        { id: 'bom_desm_2', item: 'DESMONTE A CARCAÇA', situacao: '', observacao: '' },
        { id: 'bom_desm_3', item: 'REMOVA O EIXO E ROTORES', situacao: '', observacao: '' },
        { id: 'bom_desm_4', item: 'DESMONTE TODOS RETENTORES, ESPAÇADORES E LUVAS', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 3,
      sectionName: 'LIMPEZA DE PEÇAS',
      items: [
        { id: 'bom_limp_1', item: 'LIMPE TODAS AS PARTES DESMONTADAS COM SOLVENTES APROPRIADOS', situacao: '', observacao: '' },
        { id: 'bom_limp_2', item: 'REMOVA RESÍDUOS DE ÓLEO, GRAXA E SUJEIRA DAS SUPERFÍCIES INTERNAS E EXTERNAS', situacao: '', observacao: '' },
        { id: 'bom_limp_3', item: 'REGISTRE A CONDIÇÃO DAS PEÇAS', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 4,
      sectionName: 'INSPEÇÃO',
      items: [
        { id: 'bom_insp_1', item: 'REALIZE INSPEÇÃO VISUAL DAS CARCAÇAS E TUBOS DE LUBRIFICAÇÃO', situacao: '', observacao: '' },
        { id: 'bom_insp_2', item: 'REGISTRE A CONDIÇÃO DA CARCAÇA', situacao: '', observacao: '' },
        { id: 'bom_insp_3', item: 'AVALIE VISUALMENTE OS ROTORES', situacao: '', observacao: '' },
        { id: 'bom_insp_4', item: 'REGISTRE A CONDIÇÃO DOS ROTORES', situacao: '', observacao: '' },
        { id: 'bom_insp_5', item: 'INSPECIONE OS ROLAMENTOS', situacao: '', observacao: '' },
        { id: 'bom_insp_6', item: 'NECESSÁRIO TROCA DOS ROLAMENTOS?', situacao: '', observacao: '' },
        { id: 'bom_insp_7', item: 'DESMONTE OS ROLAMENTOS', situacao: '', observacao: '' },
        { id: 'bom_insp_8', item: 'MEÇA O EIXO NA BASE DOS ROLAMENTOS E REGISTRE AS MEDIDAS', situacao: '', observacao: '' },
        { id: 'bom_insp_9', item: 'REGISTRE A CONDIÇÃO DOS MANCAIS', situacao: '', observacao: '' },
        { id: 'bom_insp_10', item: 'MEÇA OS MANCAIS E REGISTRE AS MEDIDAS', situacao: '', observacao: '' },
        { id: 'bom_insp_11', item: 'MEDIDAS DE EIXO E MANCAIS APROVADAS?', situacao: '', observacao: '' },
        { id: 'bom_insp_12', item: 'REGISTRE A CONDIÇÃO DAS TAMPAS', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 5,
      sectionName: 'PEDIDO DE PEÇAS',
      items: [
        { id: 'bom_ped_1', item: 'REALIZE O PEDIDO DE PEÇAS PARA REPOSIÇÃO', situacao: '', observacao: '' },
        { id: 'bom_ped_2', item: 'TODOS OS ITENS REQUISITADOS ESTÃO DE ACORDO COM PROJETO?', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 6,
      sectionName: 'MONTAGEM',
      items: [
        { id: 'bom_mont_1', item: 'SUBSTITUA AS PEÇAS DANIFICADAS', situacao: '', observacao: '' },
        { id: 'bom_mont_2', item: 'MONTE OS ROLAMENTOS NOS EIXOS', situacao: '', observacao: '' },
        { id: 'bom_mont_3', item: 'MEÇA A FOLGA RADIAL DOS ROLAMENTOS E REGISTRE AS MEDIDAS', situacao: '', observacao: '' },
        { id: 'bom_mont_4', item: 'MONTE O EIXO E ROTORES', situacao: '', observacao: '' },
        { id: 'bom_mont_5', item: 'AQUEÇA OS ACOPLAMENTOS NA ESTUFA', situacao: '', observacao: '' },
        { id: 'bom_mont_6', item: 'REALIZE A MONTAGEM DOS ACOPLAMENTOS', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 7,
      sectionName: 'INSPEÇÃO FINAL',
      items: [
        { id: 'bom_fin_1', item: 'REALIZE VERIFICAÇÃO FINAL PARA GARANTIR QUE TODOS COMPONENTES ESTÃO INSTALADOS CORRETAMENTE E FUNCIONANDO DENTRO DAS TOLERÂNCIAS', situacao: '', observacao: '' },
        { id: 'bom_fin_2', item: 'PARTE MECÂNICA APROVADA?', situacao: '', observacao: '' },
        { id: 'bom_fin_3', item: 'ROLAMENTOS LUBRIFICADOS?', situacao: '', observacao: '' },
      ],
    },
  ];

  return {
    enabled: false,
    tipo: 'BOMBAS',
    componente: 'BOMBA',
    tipoOs: '',
    nUnid: '',
    osPai: '',
    sections,
    conclusao: '',
  };
}

export function createDefaultProcedureMancais(): ProcedureSheet {
  const sections: ProcedureChecklistSection[] = [
    {
      sectionNumber: 1,
      sectionName: 'PREPARAÇÃO',
      items: [
        { id: 'man_prep_1', item: 'REALIZE A LIMPEZA EXTERNA', situacao: '', observacao: '' },
        { id: 'man_prep_2', item: 'AQUEÇA O ACOPLAMENTO UTILIZANDO CHUVEIROS ATÉ QUE DILATE O SUFICIENTE', situacao: '', observacao: '' },
        { id: 'man_prep_3', item: 'REMOVA O ACOPLAMENTO', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 2,
      sectionName: 'DESMONTAGEM',
      items: [
        { id: 'man_desm_1', item: 'RETIRE OS PARAFUSOS QUE FIXAM AS TAMPAS E CARCAÇA', situacao: '', observacao: '' },
        { id: 'man_desm_2', item: 'DESMONTE O MANCAL', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 3,
      sectionName: 'LIMPEZA DE PEÇAS',
      items: [
        { id: 'man_limp_1', item: 'LIMPE TODAS AS PARTES DESMONTADAS COM SOLVENTES APROPRIADOS', situacao: '', observacao: '' },
        { id: 'man_limp_2', item: 'REMOVA RESÍDUOS DE ÓLEO, GRAXA E SUJEIRA DAS SUPERFÍCIES INTERNAS E EXTERNAS', situacao: '', observacao: '' },
        { id: 'man_limp_3', item: 'REGISTRE A CONDIÇÃO DAS PEÇAS', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 4,
      sectionName: 'INSPEÇÃO',
      items: [
        { id: 'man_insp_1', item: 'REGISTRE A CONDIÇÃO DA CARCAÇA', situacao: '', observacao: '' },
        { id: 'man_insp_2', item: 'INSPECIONE OS ROLAMENTOS', situacao: '', observacao: '' },
        { id: 'man_insp_3', item: 'NECESSÁRIO TROCA DOS ROLAMENTOS?', situacao: '', observacao: '' },
        { id: 'man_insp_4', item: 'DESMONTE OS ROLAMENTOS', situacao: '', observacao: '' },
        { id: 'man_insp_5', item: 'MEÇA O EIXO NA BASE DOS ROLAMENTOS E REGISTRE AS MEDIDAS', situacao: '', observacao: '' },
        { id: 'man_insp_6', item: 'REGISTRE A CONDIÇÃO DOS MANCAIS', situacao: '', observacao: '' },
        { id: 'man_insp_7', item: 'MEÇA OS MANCAIS E REGISTRE AS MEDIDAS', situacao: '', observacao: '' },
        { id: 'man_insp_8', item: 'MEDIDAS DE EIXO E MANCAIS APROVADAS?', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 5,
      sectionName: 'PEDIDO DE PEÇAS',
      items: [
        { id: 'man_ped_1', item: 'REALIZE O PEDIDO DE PEÇAS PARA REPOSIÇÃO', situacao: '', observacao: '' },
        { id: 'man_ped_2', item: 'TODOS OS ITENS REQUISITADOS ESTÃO DE ACORDO COM PROJETO?', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 6,
      sectionName: 'MONTAGEM',
      items: [
        { id: 'man_mont_1', item: 'SUBSTITUA AS PEÇAS DANIFICADAS', situacao: '', observacao: '' },
        { id: 'man_mont_2', item: 'MONTE OS ROLAMENTOS NOS EIXOS', situacao: '', observacao: '' },
        { id: 'man_mont_3', item: 'MEÇA A FOLGA RADIAL DOS ROLAMENTOS E REGISTRE AS MEDIDAS', situacao: '', observacao: '' },
        { id: 'man_mont_4', item: 'MONTE O EIXO', situacao: '', observacao: '' },
      ],
    },
    {
      sectionNumber: 7,
      sectionName: 'INSPEÇÃO FINAL',
      items: [
        { id: 'man_fin_1', item: 'REALIZE VERIFICAÇÃO FINAL PARA GARANTIR QUE TODOS COMPONENTES ESTÃO INSTALADOS CORRETAMENTE E FUNCIONANDO DENTRO DAS TOLERÂNCIAS', situacao: '', observacao: '' },
        { id: 'man_fin_2', item: 'PARTE MECÂNICA APROVADA?', situacao: '', observacao: '' },
        { id: 'man_fin_3', item: 'ROLAMENTOS LUBRIFICADOS?', situacao: '', observacao: '' },
      ],
    },
  ];

  return {
    enabled: false,
    tipo: 'MANCAIS',
    componente: 'MANCAL',
    tipoOs: '',
    nUnid: '',
    osPai: '',
    sections,
    conclusao: '',
  };
}

export function hasAdjustmentSheetData(sheet?: ReductionAdjustmentSheet): boolean {
  if (!sheet) return false;
  const { eixo, mancal, rolamentos, folgasAxiais } = sheet;
  if (eixo.eixoAR.la || eixo.eixoAR.loa || eixo.eixoInt.la || eixo.eixoInt.loa || eixo.eixoInt2?.la || eixo.eixoInt2?.loa || eixo.eixoBR.la || eixo.eixoBR.loa) return true;
  if (mancal.carcacaAR.laMedida || mancal.carcacaAR.loaMedida || mancal.carcacaInt.laMedida || mancal.carcacaInt2?.laMedida || mancal.carcacaBR.laMedida) return true;
  if (rolamentos.eixoAR.laNum || rolamentos.eixoAR.laFolga || rolamentos.eixoInt.laNum || rolamentos.eixoInt2?.laNum || rolamentos.eixoBR.laNum) return true;
  if (folgasAxiais.eixoAR.med1 || folgasAxiais.eixoInt.med1 || folgasAxiais.eixoInt2?.med1 || folgasAxiais.eixoBR.med1) return true;
  if (sheet.servicosComentariosAdicionais || sheet.engrenamentoComentarios || sheet.carcacaComentarios) return true;
  return false;
}

export function hasProcedureSheetData(sheet?: ProcedureSheet): boolean {
  if (!sheet) return false;
  if (sheet.conclusao && sheet.conclusao.trim().length > 0) return true;
  for (const s of sheet.sections) {
    for (const item of s.items) {
      if (item.situacao || (item.observacao && item.observacao.trim().length > 0)) {
        return true;
      }
    }
  }
  return false;
}

// ---------------- LISTA P/ PEDIDO DE PEÇAS ----------------
export function createDefaultPartsOrderSheet(tag: string = '', os: string = '', equip: string = ''): PartsOrderSheet {
  const initialItems: PartsOrderItem[] = Array.from({ length: 12 }, (_, i) => ({
    id: `part_${Date.now()}_${i}`,
    codigo: '',
    quantidade: '',
    descricaoPartNumber: '',
  }));

  return {
    enabled: false,
    data: new Date().toISOString().split('T')[0],
    tag: tag || '',
    equipamento: equip || '',
    solicitante: '',
    os: os || '',
    area: '',
    items: initialItems,
    recipientEmails: ['paulo.sousa@kinross.com'],
  };
}

export function hasPartsOrderSheetData(sheet?: PartsOrderSheet): boolean {
  if (!sheet) return false;
  if (sheet.solicitante || sheet.area) return true;
  return sheet.items.some(
    (item) => item.codigo || item.quantidade || item.descricaoPartNumber
  );
}

// ---------------- MANUTENÇÃO DE MOTORES ELÉTRICOS ----------------
export function createDefaultMotorSheet(tag: string = '', os: string = '', equip: string = ''): ElectricMotorSheet {
  return {
    enabled: false,
    // Testes Iniciais / Dados de Placa
    data: new Date().toISOString().split('T')[0],
    os: os || '',
    equipamento: equip || '',
    modeloCarcaca: '',
    potenciaCv: '',
    polos: '',
    velocidadeRpm: '',
    tensaoV: '',
    correnteA: '',
    ipIn: '',
    tag: tag || '',
    numPatrimonio: '',
    numSerie: '',
    formaConstrutiva: '',
    classeIsolacao: '',
    tempAmbienteC: '',
    umidadeRelativaPercent: '',

    // Testes Estáticos (Resistência Ôhmica)
    resistenciaRS: '',
    resistenciaST: '',
    resistenciaTR: '',
    condicaoRS_ST_TR: '',
    desequilibrioPercent: '',
    limiteDR: '≤ 3%',

    // Sensores Antes e Depois
    sensoresAntes: {
      tipo: 'PT-100',
      estatorQtd: '',
      estatorStatus: '',
      mancalLAQtd: '',
      mancalLAStatus: '',
      mancalLOAQtd: '',
      mancalLOAStatus: '',
    },
    sensoresDepois: {
      tipo: 'PT-100',
      estatorQtd: '',
      estatorStatus: '',
      mancalLAQtd: '',
      mancalLAStatus: '',
      mancalLOAQtd: '',
      mancalLOAStatus: '',
    },

    // Resistência de Isolação Antes e Depois
    isolacaoAntes: {
      tensaoAplicadaVcc: '',
      res30s: '',
      res1min: '',
      res10min: '',
      indiceAbsorcao: '',
      indicePolarizacao: '',
    },
    isolacaoDepois: {
      tensaoAplicadaVcc: '',
      res30s: '',
      res1min: '',
      res10min: '',
      indiceAbsorcao: '',
      indicePolarizacao: '',
    },

    // Resistência de Aquecimento & Freio
    aquecimentoIndividualOhm: '',
    aquecimentoIsolacaoMassaMohm: '',
    freioResistenciaOhm: '',
    freioIsolacaoMassaMohm: '',

    // Página 2: Mecânica & Folgas
    executantes: '',
    condicoesChegadaObs: '',
    desmontagemComponentesObs: '',
    rolamentos: {
      la: { codigo: '', numeracao: '', medidaExterna: '', medidaInterna: '' },
      loa: { codigo: '', numeracao: '', medidaExterna: '', medidaInterna: '' },
    },
    eixo: {
      la: { h: '', v: '', medicao: '' },
      lca: { h: '', v: '', medicao: '' },
      observacoes: '',
    },
    mancal: {
      la: { h: '', v: '', medicao: '' },
      lao: { h: '', v: '', medicao: '' },
      observacoes: '',
    },
    modificacoesAjustesObs: '',
  };
}

export function hasMotorSheetData(sheet?: ElectricMotorSheet): boolean {
  if (!sheet) return false;
  if (
    sheet.modeloCarcaca ||
    sheet.potenciaCv ||
    sheet.polos ||
    sheet.velocidadeRpm ||
    sheet.tensaoV ||
    sheet.correnteA ||
    sheet.ipIn ||
    sheet.numPatrimonio ||
    sheet.numSerie ||
    sheet.formaConstrutiva ||
    sheet.classeIsolacao ||
    sheet.tempAmbienteC ||
    sheet.umidadeRelativaPercent
  ) {
    return true;
  }
  if (sheet.resistenciaRS || sheet.resistenciaST || sheet.resistenciaTR || sheet.desequilibrioPercent) {
    return true;
  }
  if (
    sheet.sensoresAntes.estatorQtd ||
    sheet.sensoresAntes.mancalLAQtd ||
    sheet.sensoresDepois.estatorQtd ||
    sheet.sensoresDepois.mancalLAQtd
  ) {
    return true;
  }
  if (
    sheet.isolacaoAntes.res30s ||
    sheet.isolacaoAntes.res1min ||
    sheet.isolacaoDepois.res30s ||
    sheet.isolacaoDepois.res1min
  ) {
    return true;
  }
  if (
    sheet.aquecimentoIndividualOhm ||
    sheet.aquecimentoIsolacaoMassaMohm ||
    sheet.freioResistenciaOhm ||
    sheet.freioIsolacaoMassaMohm
  ) {
    return true;
  }
  if (
    sheet.executantes ||
    sheet.condicoesChegadaObs ||
    sheet.desmontagemComponentesObs ||
    sheet.modificacoesAjustesObs
  ) {
    return true;
  }
  if (
    sheet.rolamentos.la.codigo ||
    sheet.rolamentos.loa.codigo ||
    sheet.eixo.la.medicao ||
    sheet.mancal.la.medicao
  ) {
    return true;
  }
  return false;
}
