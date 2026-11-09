import ResourcePage from '../components/ResourcePage';
const config = {
 endpoint:'patients',singular:'Patient',heading:'Patients',description:'Register patients and keep their demographic details organised.',
 columns:[{key:'patient_number',label:'PATIENT ID'},{key:'first_name',label:'FIRST NAME'},{key:'last_name',label:'LAST NAME'},{key:'phone',label:'PHONE'},{key:'date_of_birth',label:'DATE OF BIRTH'},{key:'status',label:'STATUS',render:r=><span className={`status-pill ${r.status}`}>{r.status}</span>}],
 fields:[
  {name:'patient_number',label:'Patient number',required:true},{name:'first_name',label:'First name',required:true},{name:'last_name',label:'Last name',required:true},
  {name:'date_of_birth',label:'Date of birth',type:'date',required:true},{name:'sex',label:'Sex',type:'select',options:[{value:'female',label:'Female'},{value:'male',label:'Male'},{value:'other',label:'Other'},{value:'prefer_not_to_say',label:'Prefer not to say'}]},
  {name:'phone',label:'Phone'},{name:'email',label:'Email',type:'email'},{name:'blood_group',label:'Blood group'},
  {name:'address',label:'Address',type:'textarea',full:true},{name:'emergency_contact_name',label:'Emergency contact name'},{name:'emergency_contact_phone',label:'Emergency contact phone'},
  {name:'allergies',label:'Allergies / alerts',type:'textarea',full:true},{name:'status',label:'Status',type:'select',defaultValue:'active',options:[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'}]}
 ]
};
export default function Patients(){return <ResourcePage config={config}/>;}
