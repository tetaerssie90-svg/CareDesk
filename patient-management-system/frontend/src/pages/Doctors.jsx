import ResourcePage from '../components/ResourcePage';
const config={endpoint:'doctors',singular:'Doctor',heading:'Doctors',description:'Manage clinician profiles, specialties and contact details.',
 columns:[{key:'full_name',label:'DOCTOR'},{key:'specialization',label:'SPECIALIZATION'},{key:'email',label:'EMAIL'},{key:'phone',label:'PHONE'},{key:'license_number',label:'LICENSE'}],
 fields:[{name:'full_name',label:'Full name',required:true},{name:'email',label:'Email',type:'email',required:true},{name:'phone',label:'Phone'},{name:'specialization',label:'Specialization',required:true},{name:'license_number',label:'License number'},{name:'availability_notes',label:'Availability notes',type:'textarea',full:true}]};
export default function Doctors(){return <ResourcePage config={config}/>;}
