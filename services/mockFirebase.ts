
import { Patient, Prescription } from '../types';

const STORAGE_KEY = 'carecloud_db';

export class MockFirebaseService {
  private static getData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { patients: {}, queue: {} };
    } catch (e) {
      console.error("Failed to read from localStorage", e);
      return { patients: {}, queue: {} };
    }
  }

  private static saveData(data: any) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }

  static async registerPatient(patient: Omit<Patient, 'id' | 'tokenNumber' | 'status' | 'timestamp'>): Promise<Patient> {
    const data = this.getData();
    const dept = patient.department;
    
    // Auto-increment Token logic per department
    if (!data.queue[dept]) data.queue[dept] = 0;
    data.queue[dept] += 1;
    const tokenNumber = data.queue[dept];

    const id = `OP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatient: Patient = {
      ...patient,
      id,
      tokenNumber,
      status: 'WAITING',
      timestamp: Date.now()
    };

    data.patients[id] = newPatient;
    this.saveData(data);
    return newPatient;
  }

  static async getPatients(): Promise<Patient[]> {
    const data = this.getData();
    return Object.values(data.patients).sort((a: any, b: any) => b.timestamp - a.timestamp) as Patient[];
  }

  static async getPatientById(id: string): Promise<Patient | null> {
    const data = this.getData();
    const patient = data.patients[id.toUpperCase().trim()];
    return patient || null;
  }

  static async addPrescription(id: string, prescription: Prescription): Promise<void> {
    const data = this.getData();
    if (data.patients[id]) {
      data.patients[id].prescription = prescription;
      data.patients[id].status = 'PRESCRIBED';
      this.saveData(data);
    }
  }

  static async dispenseMedicine(id: string): Promise<void> {
    const data = this.getData();
    if (data.patients[id]) {
      data.patients[id].status = 'DISPENSED';
      this.saveData(data);
    }
  }
}
