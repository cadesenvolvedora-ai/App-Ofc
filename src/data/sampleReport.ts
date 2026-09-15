import { MaintenanceReport } from '../types';
import {
  createDefaultAdjustmentSheet,
  createDefaultProcedureRedutores,
  createDefaultProcedureBombas,
  createDefaultProcedureMancais,
  createDefaultPartsOrderSheet,
  createDefaultMotorSheet,
} from './sheetsData';

export function createEmptyReport(index: number = 1): MaintenanceReport {
  const dateStr = new Date().toISOString().split('T')[0];
  return {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: `Relatório #${index}`,
    tag: '',
    os: '',
    startDate: dateStr,
    endDate: '',
    technician: 'Carlos A. Castro',
    status: 'EM_ANDAMENTO',
    generalComment: '',
    photos: [],
    adjustmentSheet: createDefaultAdjustmentSheet(),
    procedureRedutores: createDefaultProcedureRedutores(),
    procedureBombas: createDefaultProcedureBombas(),
    procedureMancais: createDefaultProcedureMancais(),
    partsOrderSheet: createDefaultPartsOrderSheet(),
    motorSheet: createDefaultMotorSheet(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

