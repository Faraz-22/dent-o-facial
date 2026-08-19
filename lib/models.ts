import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  registeredAt: { type: Date, default: Date.now }
});

const AppointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientName: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  treatment: { type: String, required: true },
  clinic: { type: String, required: true },
  preferredDate: { type: String, required: true },
  preferredTime: { type: String, required: true },
  notes: { type: String },
  status: { type: String, default: 'New' }, // New, Confirmed, Cancelled, Visited
  createdAt: { type: Date, default: Date.now }
});

const RecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String }, // Stable user id (optional for now to not break existing)
  patientEmail: { type: String, required: true },
  type: { type: String, required: true }, // Prescription, Report, Scan, Other
  title: { type: String },
  date: { type: String, required: true },
  fileUrl: { type: String, required: true },
  storageKey: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  notes: { type: String },
  uploadedBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const LeadSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String },
  message: { type: String },
  status: { type: String, default: 'New' },
  createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true }, // Appointment, Lead, System
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  link: { type: String }
});

const AnalyticsSchema = new mongoose.Schema({
  type: { type: String, required: true },
  page: { type: String },
  treatment: { type: String },
  method: { type: String },
  userEmail: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const SiteContentSchema = new mongoose.Schema({
  id: { type: String, default: 'main' },
  schemaVersion: { type: Number, default: 1 },
  hero: { type: mongoose.Schema.Types.Mixed },
  doctor: { type: mongoose.Schema.Types.Mixed },
  locations: { type: mongoose.Schema.Types.Mixed },
  treatments: { type: mongoose.Schema.Types.Mixed },
  testimonials: { type: mongoose.Schema.Types.Mixed },
  blog: { type: mongoose.Schema.Types.Mixed },
  faq: { type: mongoose.Schema.Types.Mixed },
  cta: { type: mongoose.Schema.Types.Mixed },
  images: { type: mongoose.Schema.Types.Mixed },
  results: { type: mongoose.Schema.Types.Mixed },
  translations: { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String }
});

const AftercareSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  aftercareText: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

const ImageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  url: { type: String }, // Cloudinary URL
  storageKey: { type: String }, // Cloudinary public_id
  dataUri: { type: String }, // Keep for legacy fallback
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  uploadedBy: { type: String },
  purpose: { type: String, default: 'public' }, // 'public' or 'private'
  createdAt: { type: Date, default: Date.now }
});

const UserTestimonialSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientName: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  treatment: { type: String },
  status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected, Published
  adminNote: { type: String },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const PatientProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  
  // Legacy global fields (kept for migration fallback, will be phased out)
  totalPayments: { type: Number, default: 0 },
  dues: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  paymentHistory: [{
    id: { type: String },
    amount: { type: Number },
    date: { type: String },
    method: { type: String },
    notes: { type: String }
  }],
  sessionsRequired: { type: Number, default: 0 },
  sessionsCompleted: { type: Number, default: 0 },
  
  // New per-treatment architecture
  treatments: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    totalCost: { type: Number, default: 0 },
    paymentHistory: [{
      id: { type: String, required: true },
      amount: { type: Number, required: true },
      date: { type: String, required: true },
      method: { type: String, required: true },
      notes: { type: String }
    }],
    sessionsRequired: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }],
  
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
export const RecordModel = mongoose.models.Record || mongoose.model('Record', RecordSchema);
export const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
export const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
export const Aftercare = mongoose.models.Aftercare || mongoose.model('Aftercare', AftercareSchema);
export const ImageModel = mongoose.models.Image || mongoose.model('Image', ImageSchema);
export const UserTestimonial = mongoose.models.UserTestimonial || mongoose.model('UserTestimonial', UserTestimonialSchema);
export const PatientProfile = mongoose.models.PatientProfile || mongoose.model('PatientProfile', PatientProfileSchema);
