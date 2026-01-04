
export enum View {
  Home = 'HOME',
  About = 'ABOUT',
  Services = 'SERVICES',
  Contact = 'CONTACT',
  Register = 'REGISTER',
  PatientStatus = 'PATIENT_STATUS',
  Ticket = 'TICKET',
  DoctorLogin = 'DOCTOR_LOGIN',
  Doctor = 'DOCTOR',
  Pharmacy = 'PHARMACY'
}

export interface Prescription {
  medicine: string;
  dosage: string;
  duration: string;
  notes: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  department: string;
  doctor: string;
  symptoms: string;
  tokenNumber: number;
  status: 'WAITING' | 'PRESCRIBED' | 'DISPENSED';
  timestamp: number;
  prescription?: Prescription;
}

export type Department = 'Cardiology' | 'Neurology' | 'Pediatrics' | 'Orthopedics' | 'Ophthalmology' | 'Dermatology' | 'Oncology' | 'ENT' | 'Dental' | 'Physiotherapy';

export const DEPARTMENTS: Department[] = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Ophthalmology', 
  'Dermatology', 'Oncology', 'ENT', 'Dental', 'Physiotherapy'
];

export const DOCTORS: Record<string, string[]> = {
  "Cardiology": ["Dr. S. Sharma", "Dr. Vikram V."],
  "Neurology": ["Dr. Alan Turing", "Dr. Neha G."],
  "Pediatrics": ["Dr. K. Pillai", "Dr. Sam Azad"],
  "Orthopedics": ["Dr. James Bone"],
  "Ophthalmology": ["Dr. Iris Clear"],
  "Dermatology": ["Dr. Skiner"],
  "Oncology": ["Dr. Hope"],
  "ENT": ["Dr. Hearwell"],
  "Dental": ["Dr. Smiles"],
  "Physiotherapy": ["Dr. Flex"]
};
