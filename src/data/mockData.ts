import { Service, Cleaner, Booking, Coupon, EnrolmentApplication, TrainingModule, Notification } from '@/types';

export const services: Service[] = [
  { id: 's1', name: 'Regular Cleaning', description: 'Standard home cleaning including dusting, vacuuming, mopping, and surface wiping.', category: 'cleaning', ratePerHour: 18, minDuration: 2, maxDuration: 8, icon: 'Sparkles' },
  { id: 's2', name: 'Deep Cleaning', description: 'Thorough deep clean covering all areas including behind furniture, inside appliances, and detailed scrubbing.', category: 'cleaning', ratePerHour: 25, minDuration: 3, maxDuration: 10, icon: 'Sparkles' },
  { id: 's3', name: 'End of Tenancy', description: 'Comprehensive clean to prepare your property for new tenants or deposit return.', category: 'cleaning', ratePerHour: 28, minDuration: 4, maxDuration: 12, icon: 'Home' },
  { id: 's4', name: 'Kitchen Deep Clean', description: 'Focused kitchen cleaning including oven, hob, extractor, and all surfaces.', category: 'cleaning', ratePerHour: 22, minDuration: 2, maxDuration: 5, icon: 'ChefHat' },
  { id: 's5', name: 'Laundry & Ironing', description: 'Washing, drying, ironing, and folding your clothes and linens.', category: 'housekeeping', ratePerHour: 16, minDuration: 2, maxDuration: 6, icon: 'Shirt' },
  { id: 's6', name: 'Organising & Decluttering', description: 'Help organise wardrobes, cupboards, and living spaces for a clutter-free home.', category: 'housekeeping', ratePerHour: 20, minDuration: 2, maxDuration: 8, icon: 'LayoutGrid' },
  { id: 's7', name: 'Bed Making & Linen Change', description: 'Fresh bed making, linen changes, and bedroom tidying.', category: 'housekeeping', ratePerHour: 15, minDuration: 1, maxDuration: 3, icon: 'Bed' },
  { id: 's8', name: 'General Housekeeping', description: 'All-round home maintenance including tidying, light cleaning, and household tasks.', category: 'housekeeping', ratePerHour: 17, minDuration: 2, maxDuration: 8, icon: 'Home' },
];

export const cleaners: Cleaner[] = [
  { id: 'c1', name: 'Emma Thompson', avatar: '', rating: 4.9, reviewCount: 342, experience: 8, specialisations: ['Deep Cleaning', 'End of Tenancy'], verified: true, available: true },
  { id: 'c2', name: 'James Wilson', avatar: '', rating: 4.8, reviewCount: 215, experience: 5, specialisations: ['Regular Cleaning', 'Kitchen'], verified: true, available: true },
  { id: 'c3', name: 'Sarah Patel', avatar: '', rating: 4.7, reviewCount: 189, experience: 6, specialisations: ['Housekeeping', 'Organising'], verified: true, available: true },
  { id: 'c4', name: 'Michael O\'Brien', avatar: '', rating: 4.9, reviewCount: 278, experience: 10, specialisations: ['Deep Cleaning', 'Commercial'], verified: true, available: false },
  { id: 'c5', name: 'Priya Sharma', avatar: '', rating: 4.6, reviewCount: 156, experience: 4, specialisations: ['Regular Cleaning', 'Laundry'], verified: true, available: true },
];

export const bookings: Booking[] = [
  { id: 'b1', customerId: 'u1', customerName: 'Alex Morgan', cleanerId: 'c1', cleanerName: 'Emma Thompson', cleanerAvatar: '', serviceId: 's1', serviceName: 'Regular Cleaning', address: { id: 'a1', label: 'Home', line1: '42 Baker Street', city: 'London', postcode: 'NW1 6XE' }, date: '2026-04-05', time: '09:00', duration: 3, recurring: 'weekly', status: 'assigned', otp: '4829', totalCost: 54, createdAt: '2026-04-01T10:00:00Z' },
  { id: 'b2', customerId: 'u1', customerName: 'Alex Morgan', cleanerId: 'c2', cleanerName: 'James Wilson', cleanerAvatar: '', serviceId: 's2', serviceName: 'Deep Cleaning', address: { id: 'a1', label: 'Home', line1: '42 Baker Street', city: 'London', postcode: 'NW1 6XE' }, date: '2026-03-28', time: '10:00', duration: 4, recurring: 'none', status: 'completed', otp: '7153', totalCost: 100, rating: 5, review: 'Absolutely brilliant! James did a fantastic job.', createdAt: '2026-03-25T14:00:00Z' },
  { id: 'b3', customerId: 'u2', customerName: 'Sophie Chen', cleanerId: 'c3', cleanerName: 'Sarah Patel', cleanerAvatar: '', serviceId: 's6', serviceName: 'Organising & Decluttering', address: { id: 'a2', label: 'Flat', line1: '15 Canary Wharf', city: 'London', postcode: 'E14 5AB' }, date: '2026-04-03', time: '14:00', duration: 3, recurring: 'none', status: 'in-progress', otp: '3947', totalCost: 60, createdAt: '2026-04-01T08:00:00Z' },
];

export const coupons: Coupon[] = [
  { id: 'cp1', code: 'WELCOME20', description: '20% off your first clean', discountPercent: 20, maxUses: 1, usedCount: 0, active: true, expiresAt: '2026-12-31' },
  { id: 'cp2', code: 'SPRING15', description: '15% off spring cleaning', discountPercent: 15, maxUses: 100, usedCount: 43, active: true, expiresAt: '2026-06-30' },
];

export const enrolments: EnrolmentApplication[] = [
  { id: 'e1', fullName: 'David Brown', dob: '1990-05-15', phone: '+447700900001', email: 'david@example.com', postcode: 'SW1A 1AA', rightToWork: 'British Citizen', idType: 'Passport', experience: 3, specialisations: ['Regular Cleaning'], references: [{ name: 'Jane Smith', phone: '+447700900002', relationship: 'Previous Employer' }, { name: 'Tom Harris', phone: '+447700900003', relationship: 'Colleague' }], dbsConsent: true, availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '08:00-18:00' }, bankSortCode: '12-34-56', bankAccountNumber: '12345678', agreedTerms: true, status: 'under-review', submittedAt: '2026-03-28T09:00:00Z' },
];

export const trainingModules: TrainingModule[] = [
  { id: 't1', level: 1, levelTitle: 'Professional Presence – First Impressions Matter', moduleNumber: 1, title: 'Polished Appearance', content: ['Comfortable, stylish overcoat with practical pockets with Indiana Green approved logo', 'Clean, tidy uniform', 'Groomed hair and minimal fragrance', 'Calm, confident body language', 'Indoor/outdoor shoes'], completed: false },
  { id: 't2', level: 1, levelTitle: 'Professional Presence – First Impressions Matter', moduleNumber: 2, title: 'Professional Cleaning Kit', content: ['All-natural, non-invasive products', 'Premium microfibre cloths', 'Understanding how to use both natural and chemical products safely and responsibly', 'Clear knowledge of COSHH principles and safe storage', 'Logo caddy and container for cloths', "You don't just carry products — you understand them."], completed: false },
  { id: 't3', level: 1, levelTitle: 'Professional Presence – First Impressions Matter', moduleNumber: 3, title: 'Customer Service Excellence', content: ['Respectful, warm introductions', 'Indoor/outdoor shoe policy', 'Polite, professional conversation', 'No cups of tea or snacks while on the job', 'Boundaries with kindness', 'Priorities and pointers to tailor cleaning session', 'Time keeping - communication'], completed: false },
  { id: 't4', level: 2, levelTitle: 'Five-Star Cleaning Principles', moduleNumber: 1, title: 'Harness the Power of Water', content: ['Water is your greatest tool.', 'Use a water-first approach', 'Let premium microfibre do the heavy lifting', 'Introduce products only when necessary - buy approved kit', 'Clean to remove dirt — not mask it', 'Skill over saturation. Precision over perfume.'], completed: false },
  { id: 't5', level: 2, levelTitle: 'Five-Star Cleaning Principles', moduleNumber: 2, title: 'Chunk by Chunk – Top to Bottom', content: ['A methodical, intuitive system.', 'Divide spaces into manageable sections', 'Work from high surfaces downwards', 'Finish one area completely before moving on', 'Maintain flow and momentum through understanding priorities', 'This creates efficiency, consistency and visible progress.'], completed: false },
  { id: 't6', level: 2, levelTitle: 'Five-Star Cleaning Principles', moduleNumber: 3, title: 'Unclogging & Flow', content: ['Cleaning is not just wiping — it is restoring harmony.', 'Help clients organise and present their belongings if needed', 'Reduce visual noise - keep what brings positivity', 'Create systems that work for their lifestyle', 'Respect sentimental items and personal boundaries', 'You are improving how the home feels, not just how it looks.'], completed: false },
  { id: 't7', level: 2, levelTitle: 'Five-Star Cleaning Principles', moduleNumber: 4, title: 'Zooming In – Attention to Detail', content: ['Door handles', 'Light switches', 'Edges and skirtings', 'Taps and plugholes', 'Hidden corners', 'Behind and underneath', 'Five-star standards live in the details others miss.'], completed: false },
  { id: 't8', level: 2, levelTitle: 'Five-Star Cleaning Principles', moduleNumber: 5, title: 'Zooming Out – Presentation Mastery', content: ['Step back and assess.', 'Cushions aligned', 'Towels folded beautifully', 'Lines straight', 'Surfaces balanced and clutter-free', 'The room feeling calm and intentional', 'Items labelled front', 'This is the "wow" moment.'], completed: false },
  { id: 't9', level: 3, levelTitle: 'Ongoing Excellence', moduleNumber: 1, title: 'Monthly Upkeep', content: ['Latest best practice', 'Eco-innovation', 'Efficiency techniques', 'Client communication refinement', 'Industry standards updates', 'One module every month to stay sharp, skilled and ahead.', 'This is not just cleaning. It is pride. It is discipline. It is care in action.', 'Become a Five-Star Cleaner with Cleanfit.'], completed: false },
];

export const notifications: Notification[] = [
  { id: 'n1', title: 'Booking Confirmed', message: 'Your Regular Cleaning with Emma Thompson is confirmed for 5 Apr at 9:00 AM.', type: 'booking', read: false, createdAt: '2026-04-01T10:00:00Z' },
  { id: 'n2', title: 'Welcome to Cleanfit!', message: 'Use code WELCOME20 for 20% off your first clean.', type: 'promo', read: false, createdAt: '2026-04-01T09:00:00Z' },
];
