
import React, { useState, useEffect } from 'react';
import { View, Patient, DEPARTMENTS, DOCTORS, Prescription } from './types';
import { MockFirebaseService } from './services/mockFirebase';

const Navbar: React.FC<{ setView: (v: View) => void, activeView: View, isLoggedIn: boolean, onLogout: () => void }> = ({ setView, activeView, isLoggedIn, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md px-6 md:px-12 py-4 flex justify-between items-center">
      <div 
        className="text-2xl font-extrabold text-blue-600 flex items-center gap-2 cursor-pointer"
        onClick={() => setView(View.Home)}
      >
        <i className="fas fa-hand-holding-medical"></i>
        <span className="tracking-tighter">CARECLOUD</span>
      </div>
      <div className="hidden md:flex gap-6 items-center">
        <button onClick={() => setView(View.Home)} className={`font-semibold text-sm ${activeView === View.Home ? 'text-blue-600' : 'text-slate-600'}`}>Home</button>
        <button onClick={() => setView(View.About)} className={`font-semibold text-sm ${activeView === View.About ? 'text-blue-600' : 'text-slate-600'}`}>Workflow</button>
        
        {isLoggedIn ? (
          <button onClick={() => setView(View.Doctor)} className="text-sm font-bold text-blue-600 border-b-2 border-blue-600">Doctor Dashboard</button>
        ) : (
          <button onClick={() => setView(View.DoctorLogin)} className="text-sm font-semibold text-slate-600 hover:text-blue-500">Doctor Portal</button>
        )}
        
        <button onClick={() => setView(View.Pharmacy)} className="text-sm font-semibold text-slate-600 hover:text-blue-500">Pharmacy</button>
        
        <div className="flex gap-2 ml-4">
          <button 
            onClick={() => setView(View.PatientStatus)}
            className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition-all"
          >
            Track Status
          </button>
          <button 
            onClick={() => setView(View.Register)}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            Register Now
          </button>
        </div>

        {isLoggedIn && (
          <button onClick={onLogout} className="text-red-500 ml-2 hover:scale-110 transition-transform"><i className="fas fa-sign-out-alt"></i></button>
        )}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Home);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    department: '',
    doctor: '',
    symptoms: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.department || !formData.doctor || !formData.symptoms) {
      alert("Please fill all details and describe your symptoms.");
      return;
    }

    setLoading(true);
    try {
      const patient = await MockFirebaseService.registerPatient({
        name: formData.name,
        age: parseInt(formData.age),
        department: formData.department,
        doctor: formData.doctor,
        symptoms: formData.symptoms
      });
      console.log("Registered patient:", patient);
      setCurrentPatient(patient);
      setView(View.PatientStatus);
      setFormData({ name: '', age: '', department: '', doctor: '', symptoms: '' });
    } catch (err) {
      console.error(err);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkPatientStatus = async (id?: string) => {
    const targetId = id || searchId;
    if (!targetId) {
      alert("Please enter your OP ID");
      return;
    }
    setLoading(true);
    try {
      const p = await MockFirebaseService.getPatientById(targetId);
      if (p) {
        setCurrentPatient(p);
        if (p.status === 'PRESCRIBED' || p.status === 'DISPENSED') {
          setView(View.Ticket);
        } else {
          setView(View.PatientStatus);
        }
      } else {
        alert("Patient record not found. Please check your OP ID.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        setView={setView} 
        activeView={view} 
        isLoggedIn={isDoctorLoggedIn} 
        onLogout={() => { setIsDoctorLoggedIn(false); setView(View.Home); }} 
      />

      <main className="container mx-auto px-4 py-8">
        {view === View.Home && (
          <div className="space-y-12 animate-fade-up">
            <div className="relative h-[70vh] flex items-center justify-center text-center px-6 overflow-hidden rounded-3xl shadow-2xl mt-4">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-30" alt="Hospital" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-500/20"></div>
              </div>
              <div className="relative z-10 max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6">Smart Care, <span className="text-blue-600">Zero Wait.</span></h1>
                <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">Enter your symptoms, get your queue number, and receive your digital smart token after doctor consultation.</p>
                <button onClick={() => setView(View.Register)} className="bg-blue-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-xl shadow-blue-300 hover:bg-blue-700 transition-all active:scale-95">Register for Consultation</button>
              </div>
            </div>
            <AboutGrid />
          </div>
        )}

        {view === View.About && <AboutGrid />}

        {view === View.Register && (
          <section className="max-w-4xl mx-auto animate-fade-up">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-slate-900">Patient Registration</h2>
              <p className="text-slate-500 mt-2">Describe your symptoms to enter the clinical queue.</p>
            </div>
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-blue-50">
              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-600 bg-slate-50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Age</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} placeholder="Age" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-600 bg-slate-50 transition-all" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Department</label>
                  <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value, doctor: ''})} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-600 bg-slate-50 transition-all appearance-none cursor-pointer">
                    <option value="">Choose Specialty</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Available Doctor</label>
                  <select disabled={!formData.department} value={formData.doctor} onChange={e => setFormData({...formData, doctor: e.target.value})} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-600 bg-slate-50 transition-all disabled:opacity-50 appearance-none cursor-pointer">
                    <option value="">Select Doctor</option>
                    {formData.department && DOCTORS[formData.department].map(doc => <option key={doc} value={doc}>{doc}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Describe Symptoms</label>
                  <textarea rows={4} value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})} placeholder="Describe your fever, pain, or other symptoms in detail..." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-600 bg-slate-50 transition-all resize-none" />
                </div>
                <button type="submit" disabled={loading} className="md:col-span-2 bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                  {loading ? 'Processing...' : 'Register for Consultation'}
                </button>
              </form>
            </div>
          </section>
        )}

        {view === View.PatientStatus && (
          <section className="max-w-3xl mx-auto py-12 animate-fade-up">
            <div className="bg-white p-12 rounded-[40px] shadow-2xl text-center border-t-[12px] border-blue-600 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 -mr-16 -mt-16"></div>
              
              <h2 className="text-4xl font-black text-slate-900 mb-4">Track Consultation</h2>
              <p className="text-slate-500 mb-10 text-lg">Your queue number and OP status are shown below.</p>
              
              {!currentPatient && (
                <div className="flex gap-4 mb-12">
                  <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="ENTER OP-ID" className="flex-1 px-8 py-5 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-600 uppercase font-black text-2xl tracking-[0.2em] text-center" />
                  <button onClick={() => checkPatientStatus()} className="bg-blue-600 text-white px-10 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">Track</button>
                </div>
              )}

              {currentPatient && (
                <div className="animate-fade-up">
                  <div className="bg-blue-50 border border-blue-100 p-10 rounded-[32px] mb-8 shadow-inner">
                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Registration ID: {currentPatient.id}</p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                       <span className="text-8xl font-black text-blue-600 tracking-tighter">#{currentPatient.tokenNumber}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{currentPatient.name}</p>
                    <p className="text-blue-600 font-medium">{currentPatient.department} Unit - {currentPatient.doctor}</p>
                  </div>
                  
                  <div className={`inline-flex items-center gap-3 px-8 py-3 rounded-full font-black text-sm mb-8 ${currentPatient.status === 'WAITING' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${currentPatient.status === 'WAITING' ? 'bg-amber-600' : 'bg-green-600'}`}></div>
                    {currentPatient.status === 'WAITING' ? 'STATUS: WAITING IN QUEUE' : 'STATUS: PRESCRIPTION READY'}
                  </div>
                  
                  {currentPatient.status === 'WAITING' ? (
                    <div className="p-6 bg-slate-50 rounded-2xl text-slate-500 text-sm">
                      <p><i className="fas fa-info-circle mr-2 text-blue-400"></i> Please wait for the doctor to review your symptoms. Once prescribed, your <strong>Smart Medication Token</strong> will be generated here.</p>
                    </div>
                  ) : (
                    <button onClick={() => setView(View.Ticket)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                      View Smart Medication Token <i className="fas fa-qrcode"></i>
                    </button>
                  )}

                  <button onClick={() => { setCurrentPatient(null); setSearchId(''); }} className="mt-8 text-slate-400 hover:text-slate-600 font-bold flex items-center justify-center gap-2 mx-auto">
                    <i className="fas fa-search"></i> Check different ID
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {view === View.Ticket && currentPatient && (
          <section className="flex justify-center py-10 animate-fade-up">
            <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl border-t-[16px] border-blue-600">
              <div className="p-10 text-center">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                  <div className="text-left">
                    <h3 className="text-3xl font-black text-slate-800 leading-none">{currentPatient.name}</h3>
                    <p className="text-slate-400 font-bold text-sm mt-2">{currentPatient.id}</p>
                  </div>
                  <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-200">#{currentPatient.tokenNumber}</div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-8 mb-10 text-left border border-slate-200 relative">
                  <div className="absolute -top-3 left-6 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">Smart Medication Data</div>
                  {currentPatient.prescription ? (
                    <div className="space-y-6 pt-2">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medication</p>
                        <p className="text-xl font-bold text-slate-800">{currentPatient.prescription.medicine}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dosage</p>
                          <p className="font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-100 text-center">{currentPatient.prescription.dosage}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                          <p className="font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-100 text-center">{currentPatient.prescription.duration}</p>
                        </div>
                      </div>
                      {currentPatient.prescription.notes && (
                        <div className="bg-blue-50/50 p-4 rounded-xl border-l-4 border-blue-600">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Instructions</p>
                          <p className="text-sm text-slate-700 italic font-medium leading-relaxed">"{currentPatient.prescription.notes}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-center py-4">Data processing error. Please contact helpdesk.</p>
                  )}
                </div>

                <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 flex flex-col items-center gap-6 shadow-inner">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentPatient.id}`} alt="QR Code" className="w-48 h-48 p-2" />
                  <p className="text-xs text-slate-400 font-bold max-w-[240px] leading-tight uppercase tracking-tight">Pharmacy: Scan this QR to dispense medication.</p>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4">
                  <button onClick={() => window.print()} className="bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"><i className="fas fa-print"></i> PRINT</button>
                  <button onClick={() => setView(View.Home)} className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">CLOSE</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === View.DoctorLogin && (
          <section className="max-w-md mx-auto py-20 animate-fade-up">
            <div className="bg-white p-12 rounded-[40px] shadow-2xl border-2 border-blue-50 text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <i className="fas fa-user-md text-5xl text-blue-600"></i>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">Doctor Login</h2>
              <p className="text-slate-500 mb-10">Access the consultation dashboard.</p>
              <div className="space-y-6">
                <input type="text" placeholder="Employee ID" className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white outline-none focus:border-blue-600 transition-all" />
                <input type="password" placeholder="Secure Password" className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white outline-none focus:border-blue-600 transition-all" />
                <button onClick={() => { setIsDoctorLoggedIn(true); setView(View.Doctor); }} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Login to Portal</button>
              </div>
            </div>
          </section>
        )}

        {view === View.Doctor && isDoctorLoggedIn && <DoctorDashboard />}

        {view === View.Pharmacy && <PharmacyDashboard />}
      </main>

      <footer className="bg-slate-900 text-white py-20 px-6 mt-20">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="text-3xl font-black text-blue-400 mb-6 flex items-center gap-3">
              <i className="fas fa-hand-holding-medical"></i> CARECLOUD
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md text-lg">Next-generation hospital management system streamlining the entire journey from symptom reporting to medicine dispensing.</p>
          </div>
          <div>
            <h4 className="font-black text-lg mb-6 uppercase tracking-widest text-blue-400">Quick Portal</h4>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><button onClick={() => setView(View.Register)} className="hover:text-blue-400">Patient Registration</button></li>
              <li><button onClick={() => setView(View.PatientStatus)} className="hover:text-blue-400">Track OP Status</button></li>
              <li><button onClick={() => setView(View.DoctorLogin)} className="hover:text-blue-400">Doctor Access</button></li>
              <li><button onClick={() => setView(View.Pharmacy)} className="hover:text-blue-400">Pharmacy Counter</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-lg mb-6 uppercase tracking-widest text-blue-400">Emergency</h4>
            <p className="text-4xl font-black text-white mb-4">911-555-0199</p>
            <p className="text-slate-500 font-bold">24/7 Rapid Response Unit Available</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prescription, setPrescription] = useState<Prescription>({ medicine: '', dosage: '', duration: '', notes: '' });

  useEffect(() => { fetchPatients(); }, []);
  const fetchPatients = async () => { const list = await MockFirebaseService.getPatients(); setPatients(list); };

  const handlePrescribe = async () => {
    if (!selectedPatient) return;
    if (!prescription.medicine || !prescription.dosage) { alert("Please enter medicine and dosage details."); return; }
    await MockFirebaseService.addPrescription(selectedPatient.id, prescription);
    setSelectedPatient(null);
    setPrescription({ medicine: '', dosage: '', duration: '', notes: '' });
    fetchPatients();
    alert("Smart Medication Token has been generated for the patient.");
  };

  return (
    <div className="animate-fade-up">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black text-slate-900">Patient Queue</h2>
        <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-black text-sm shadow-lg">LIVE MONITORING ACTIVE</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {patients.filter(p => p.status === 'WAITING').map(p => (
            <div key={p.id} onClick={() => setSelectedPatient(p)} className={`bg-white p-8 rounded-[32px] shadow-sm border-2 transition-all cursor-pointer flex justify-between items-center group ${selectedPatient?.id === p.id ? 'border-blue-600 shadow-xl scale-[1.02]' : 'border-transparent hover:border-blue-100 hover:shadow-lg'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-lg">TOKEN #{p.tokenNumber}</span>
                  <h4 className="text-2xl font-black text-slate-800">{p.name} <span className="text-slate-400 font-bold text-lg">({p.age})</span></h4>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{p.id} • {p.department} Unit • {p.doctor}</p>
                <div className="mt-4 p-5 bg-slate-50 rounded-2xl border-l-8 border-blue-600">
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Symptoms Reported:</p>
                  <p className="text-slate-700 font-medium italic">"{p.symptoms}"</p>
                </div>
              </div>
              <div className="ml-8 text-right flex flex-col items-end gap-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"><i className="fas fa-stethoscope text-xl"></i></div>
                <p className="text-[10px] font-black text-slate-300 uppercase">{new Date(p.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {patients.filter(p => p.status === 'WAITING').length === 0 && (
            <div className="bg-white p-24 rounded-[40px] text-center text-slate-400 border-4 border-dashed border-slate-100 flex flex-col items-center gap-4">
              <i className="fas fa-check-circle text-6xl opacity-20"></i>
              <p className="text-2xl font-bold">Queue Clear</p>
              <p className="text-sm">All pending registrations have been processed.</p>
            </div>
          )}
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl h-fit sticky top-28 border border-blue-50">
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <i className="fas fa-file-medical text-blue-600"></i> Generation Panel
          </h3>
          {selectedPatient ? (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
                <p className="text-[10px] font-black uppercase opacity-70 mb-1">Current Patient</p>
                <p className="text-2xl font-black">{selectedPatient.name}</p>
                <p className="text-xs font-bold opacity-80 mt-1">{selectedPatient.id} • Token #{selectedPatient.tokenNumber}</p>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medicine Name</label>
                 <input type="text" value={prescription.medicine} onChange={e => setPrescription({...prescription, medicine: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 outline-none focus:bg-white focus:border-blue-600 transition-all font-bold" placeholder="E.g. Amoxicillin 500mg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</label>
                  <input type="text" value={prescription.dosage} onChange={e => setPrescription({...prescription, dosage: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 outline-none focus:bg-white focus:border-blue-600 transition-all font-bold" placeholder="1-0-1" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                  <input type="text" value={prescription.duration} onChange={e => setPrescription({...prescription, duration: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 outline-none focus:bg-white focus:border-blue-600 transition-all font-bold" placeholder="5 Days" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Instructions</label>
                <textarea rows={3} value={prescription.notes} onChange={e => setPrescription({...prescription, notes: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 outline-none focus:bg-white focus:border-blue-600 transition-all font-medium resize-none" placeholder="After food, plenty of fluids..." />
              </div>
              <button onClick={handlePrescribe} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                <i className="fas fa-magic"></i> Generate Smart Token
              </button>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              <i className="fas fa-hand-pointer text-5xl text-slate-200 mb-6 block"></i>
              <p className="text-slate-400 font-bold px-6 leading-relaxed uppercase text-xs tracking-widest">Select a patient from the queue to start consultation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PharmacyDashboard: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchId) return;
    setLoading(true);
    const p = await MockFirebaseService.getPatientById(searchId);
    setPatient(p);
    setLoading(false);
  };

  const handleDispense = async () => {
    if (!patient) return;
    await MockFirebaseService.dispenseMedicine(patient.id);
    setPatient({...patient, status: 'DISPENSED'});
    alert("Medicines dispensed successfully. Smart Token updated.");
  };

  return (
    <div className="animate-fade-up max-w-4xl mx-auto py-10">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Pharmacy Interface</h2>
        <p className="text-slate-500 text-xl">Scan Smart Tokens to dispense medication.</p>
      </div>
      
      <div className="bg-white p-10 rounded-[40px] shadow-2xl mb-12 border border-slate-100">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <i className="fas fa-qrcode absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 text-xl"></i>
            <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="SCAN SMART TOKEN (OP-ID)" className="w-full px-14 py-6 rounded-2xl border-4 border-slate-50 bg-slate-50 outline-none focus:border-blue-600 focus:bg-white font-black text-2xl tracking-[0.2em] uppercase text-center transition-all" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-12 rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Fetch Data</button>
        </form>
      </div>

      {patient ? (
        <div className="bg-white rounded-[48px] overflow-hidden shadow-2xl border border-slate-100 animate-fade-up">
          <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
            <div>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">Verified Patient Data</span>
              <h3 className="text-4xl font-black text-slate-900 mt-4">{patient.name}</h3>
              <p className="text-slate-500 font-bold text-lg">{patient.id} • Age: {patient.age}</p>
            </div>
            <div className={`px-8 py-3 rounded-2xl font-black text-sm shadow-sm ${patient.status === 'DISPENSED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              STATUS: {patient.status}
            </div>
          </div>
          <div className="p-10">
            {patient.prescription ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-blue-50/50 p-8 rounded-[32px] border border-blue-50">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Medication Name</p>
                    <p className="text-2xl font-black text-slate-800">{patient.prescription.medicine}</p>
                  </div>
                  <div className="bg-blue-50/50 p-8 rounded-[32px] border border-blue-50">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Dispense Logic</p>
                    <p className="text-2xl font-black text-slate-800">{patient.prescription.dosage}</p>
                  </div>
                  <div className="bg-blue-50/50 p-8 rounded-[32px] border border-blue-50">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Total Duration</p>
                    <p className="text-2xl font-black text-slate-800">{patient.prescription.duration}</p>
                  </div>
                </div>
                
                {patient.prescription.notes && (
                  <div className="bg-amber-50 p-6 rounded-3xl border-l-8 border-amber-400">
                    <p className="text-xs font-black text-amber-600 uppercase mb-2">Pharmacist Instructions:</p>
                    <p className="text-slate-700 font-bold italic leading-relaxed">"{patient.prescription.notes}"</p>
                  </div>
                )}

                {patient.status !== 'DISPENSED' && (
                  <button onClick={handleDispense} className="w-full bg-green-600 text-white py-6 rounded-[32px] font-black text-2xl shadow-2xl shadow-green-200 hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-4">
                    <i className="fas fa-pills text-3xl"></i> DISPENSE MEDICATION NOW
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-amber-50 rounded-[40px] border-4 border-dashed border-amber-200">
                <i className="fas fa-hourglass-half text-6xl text-amber-300 mb-6"></i>
                <p className="text-2xl font-black text-amber-800 uppercase tracking-tighter">Token Active • No Prescription Data</p>
                <p className="text-amber-600 font-bold mt-2">The doctor has not finalized medication details for this token yet.</p>
              </div>
            )}
          </div>
        </div>
      ) : searchId && !loading && (
        <div className="text-center py-24 text-slate-300">
           <i className="fas fa-search text-8xl mb-6 opacity-20"></i>
           <p className="text-3xl font-black">NO VALID TOKEN FOUND</p>
           <p className="font-bold text-slate-400 uppercase tracking-widest text-sm mt-2">Check the OP-ID and search again.</p>
        </div>
      )}
    </div>
  );
};

const AboutGrid: React.FC = () => {
  const cards = [
    { badge: 'STEP 1', icon: 'clipboard-list', title: 'Queue Entry', desc: 'Patients report symptoms and enter the clinical queue instantly.' },
    { badge: 'STEP 2', icon: 'user-md', title: 'Consultation', desc: 'Doctors review digital symptoms and prescribe medication remotely.' },
    { badge: 'STEP 3', icon: 'qrcode', title: 'Smart Token', desc: 'A secure QR-based smart token is generated with full prescription details.' },
    { badge: 'STEP 4', icon: 'pills', title: 'Dispensing', desc: 'Pharmacies scan the smart token for paperless medicine retrieval.' }
  ];
  return (
    <div className="py-12 animate-fade-up">
      <h2 className="text-4xl font-black text-center mb-16 text-slate-900 tracking-tight">How CareCloud Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-10 rounded-[32px] shadow-lg border border-slate-50 flex flex-col items-center text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm">
              <i className={`fas fa-${c.icon} text-3xl`}></i>
            </div>
            <span className="px-4 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">{c.badge}</span>
            <h3 className="text-2xl font-black mb-4 text-slate-800">{c.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
