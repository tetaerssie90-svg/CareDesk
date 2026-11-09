import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import Prescriptions from './pages/Prescriptions';
import Login from './pages/Login';

function PrivateLayout(){return <ProtectedRoute><AppLayout/></ProtectedRoute>;}
export default function App(){
 return <AuthProvider><BrowserRouter><Routes>
  <Route path="/login" element={<Login/>}/>
  <Route element={<PrivateLayout/>}>
   <Route index element={<Dashboard/>}/>
   <Route path="patients" element={<Patients/>}/>
   <Route path="doctors" element={<Doctors/>}/>
   <Route path="appointments" element={<Appointments/>}/>
   <Route path="medical-records" element={<MedicalRecords/>}/>
   <Route path="prescriptions" element={<Prescriptions/>}/>
  </Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes></BrowserRouter></AuthProvider>;
}
