export const bn = {
  app: { title: 'মাদ্রাসা ম্যানেজমেন্ট সিস্টেম', subtitle: 'প্রাথমিক স্তরের ইসলামিক শিক্ষা ব্যবস্থাপনা', footer: 'সব অধিকার সংরক্ষিত' },
  nav: {
    overview: 'ওভারভিউ', students: 'শিক্ষার্থী', classes: 'শ্রেণি', teachers: 'শিক্ষক', attendance: 'উপস্থিতি',
    grades: 'গ্রেড ও পরীক্ষা', fees: 'ফি', accounting: 'হিসাবরক্ষণ', notices: 'নোটিশ', settings: 'সেটিংস',
    myClasses: 'আমার শ্রেণি', income: 'আয়', expenses: 'ব্যয়', reports: 'প্রতিবেদন',
    feeCollection: 'ফি সংগ্রহ', logout: 'সাইন আউট', login: 'সাইন ইন',
  },
  roles: { admin: 'প্রশাসক', teacher: 'শিক্ষক', accountant: 'হিসাবরক্ষক' },
  common: {
    search: 'অনুসন্ধান', add: 'যোগ করুন', edit: 'সম্পাদনা', delete: 'মুছুন', save: 'সংরক্ষণ',
    cancel: 'বাতিল', confirm: 'নিশ্চিত', create: 'তৈরি করুন', update: 'হালনাগাদ', view: 'দেখুন',
    export: 'এক্সপোর্ট', import: 'ইমপোর্ট', download: 'ডাউনলোড', upload: 'আপলোড', print: 'প্রিন্ট',
    back: 'পিছনে', submit: 'জমা দিন', loading: 'লোড হচ্ছে...', noData: 'কোন তথ্য নেই',
    name: 'নাম', email: 'ইমেইল', phone: 'ফোন', address: 'ঠিকানা', date: 'তারিখ',
    status: 'স্ট্যাটাস', active: 'সক্রিয়', inactive: 'নিষ্ক্রিয়', amount: 'পরিমাণ',
    description: 'বর্ণনা', category: 'বিভাগ', method: 'পদ্ধতি', receipt: 'রসিদ', total: 'মোট',
    present: 'উপস্থিত', absent: 'অনুপস্থিত', late: 'বিলম্বে',
  },
  dashboard: {
    totalStudents: 'মোট শিক্ষার্থী', totalTeachers: 'মোট শিক্ষক', monthlyIncome: 'মাসিক আয়',
    monthlyExpense: 'মাসিক ব্যয়', netBalance: 'নিট ব্যালেন্স', dueFees: 'বকেয়া ফি',
    recentPayments: 'সাম্প্রতিক লেনদেন', myClasses: 'আজকের শ্রেণি', upcomingExams: 'আসন্ন পরীক্ষা',
  },
  student: {
    manage: 'শিক্ষার্থী ব্যবস্থাপনা', add: 'শিক্ষার্থী যোগ করুন', edit: 'শিক্ষার্থী সম্পাদনা',
    profile: 'শিক্ষার্থী প্রোফাইল', name: 'শিক্ষার্থীর নাম', father: 'পিতার নাম', mother: 'মাতার নাম',
    dob: 'জন্ম তারিখ', gender: 'লিঙ্গ', male: 'পুরুষ', female: 'নারী', classId: 'শ্রেণি',
    enrollment: 'ভর্তির তারিখ', photo: 'ছবি', idCard: 'আইডি কার্ড', importCsv: 'CSV ইমপোর্ট',
  },
  teacher: {
    manage: 'শিক্ষক ব্যবস্থাপনা', add: 'শিক্ষক যোগ করুন', assignClasses: 'শ্রেণি বরাদ্দ',
  },
  class_: {
    manage: 'শ্রেণি ব্যবস্থাপনা', add: 'শ্রেণি যোগ করুন', headTeacher: 'প্রধান শিক্ষক',
    section: 'শাখা', academicYear: 'শিক্ষাবর্ষ', studentRoster: 'শিক্ষার্থী তালিকা',
  },
  attendance: {
    manage: 'উপস্থিতি ব্যবস্থাপনা', mark: 'উপস্থিতি চিহ্নিত করুন', date: 'তারিখ',
    report: 'উপস্থিতি প্রতিবেদন', monthly: 'মাসিক উপস্থিতি', lowAttendance: '৭৫% এর নিচে',
  },
  grade: {
    manage: 'গ্রেড ও পরীক্ষা', examType: 'পরীক্ষার ধরন', marks: 'নম্বর', totalMarks: 'পূর্ণমান',
    monthlyTest: 'মাসিক পরীক্ষা', halfYearly: 'বার্ষিক পরীক্ষা', annual: 'সমাপনী পরীক্ষা',
  },
  fee: {
    manage: 'ফি ব্যবস্থাপনা', structure: 'ফি কাঠামো', payment: 'পেমেন্ট', collect: 'ফি সংগ্রহ',
    due: 'বকেয়া', paid: 'পরিশোধিত', partial: 'আংশিক', receipt: 'ফি রসিদ',
    type: 'ফি ধরন', tuition: 'টিউশন', admission: 'ভর্তি', exam: 'পরীক্ষা', library: 'লাইব্রেরি',
  },
  accounting: {
    title: 'হিসাবরক্ষণ', income: 'আয়', expense: 'ব্যয়', addIncome: 'আয় যোগ করুন',
    addExpense: 'ব্যয় যোগ করুন', source: 'উৎস', balance: 'নিট ব্যালেন্স',
    monthlySummary: 'মাসিক সারসংক্ষেপ', categoryBreakdown: 'বিভাগ অনুযায়ী ব্যয়',
  },
  notice: { manage: 'নোটিশ', post: 'নোটিশ পোস্ট করুন', target: 'লক্ষ্য দর্শক', all: 'সবাই' },
  settings: {
    title: 'সেটিংস', academicYear: 'শিক্ষাবর্ষ', userManagement: 'ব্যবহারকারী ব্যবস্থাপনা',
    schoolProfile: 'মাদ্রাসার তথ্য', createUser: 'ব্যবহারকারী তৈরি করুন', resetPassword: 'পাসওয়ার্ড রিসেট',
  },
  report: {
    title: 'প্রতিবেদন', pnl: 'আয়-ব্যয় বিবরণী', feeCollection: 'ফি সংগ্রহ প্রতিবেদন',
    monthly: 'মাসিক প্রতিবেদন', annual: 'বার্ষিক প্রতিবেদন',
  },
  home: {
    hero: 'প্রাথমিক ইসলামিক শিক্ষা', heroSub: 'উজ্জ্বল ভবিষ্যতের জন্য',
    desc: 'প্রাথমিক স্তরের ইসলামিক বিদ্যালয়ের জন্য একটি আধুনিক ব্যবস্থাপনা সিস্টেম। প্রশাসন, শিক্ষার্থীর অগ্রগতি, আর্থিক ব্যবস্থাপনা এবং একাডেমিক শ্রেষ্ঠত্ব — সবকিছু এক জায়গায়।',
    about: 'আমাদের প্রতিষ্ঠান', aboutDesc1: 'আমাদের মাদ্রাসা ইসলামী মূল্যবোধসম্পন্ন মানসম্পন্ন প্রাথমিক শিক্ষা প্রদানে নিবেদিত। আমরা ঐতিহ্যবাহী ইসলামী শিক্ষার সাথে আধুনিক একাডেমিক কারিকুলামকে সমন্বয় করি।',
    aboutDesc2: 'মাদ্রাসা ম্যানেজমেন্ট সিস্টেম প্রশাসক, শিক্ষক এবং হিসাবরক্ষকদের শিক্ষার্থীর রেকর্ড, উপস্থিতি ট্র্যাকিং, গ্রেড ব্যবস্থাপনা, ফি সংগ্রহ এবং আর্থিক প্রতিবেদনের জন্য ডিজিটাল টুলস সরবরাহ করে।',
    portals: 'তিনটি ডেডিকেটেড পোর্টাল', portalsDesc: 'প্রশাসক, শিক্ষক এবং হিসাবরক্ষকদের জন্য ভূমিকা-ভিত্তিক অ্যাক্সেস — প্রতিটির জন্য উপযোগী টুলস ও ড্যাশবোর্ড।',
    stats: { students: 'শিক্ষার্থী', teachers: 'শিক্ষক', classes: 'শ্রেণি', satisfaction: 'সন্তুষ্টি' },
    features: { quran: 'কুরআন শিক্ষা', quranDesc: 'তাজবীদ ও মুখস্থ', academic: 'একাডেমিক', academicDesc: 'মানসম্মত পাঠ্যক্রম', character: 'চরিত্র', characterDesc: 'ইসলামী নৈতিকতা', community: 'সম্প্রদায়', communityDesc: 'অভিভাবকের সম্পৃক্ততা' },
  },
  portal: {
    admin: 'প্রশাসক প্যানেল', adminDesc: 'শিক্ষার্থী, শ্রেণি, শিক্ষক, উপস্থিতি, গ্রেড, ফি, হিসাব এবং সিস্টেম সেটিংসের পূর্ণ নিয়ন্ত্রণ।',
    teacher: 'শিক্ষক প্যানেল', teacherDesc: 'আপনার শ্রেণি পরিচালনা করুন, উপস্থিতি চিহ্নিত করুন, গ্রেড দিন এবং শিক্ষার্থী প্রোফাইল দেখুন।',
    accountant: 'হিসাবরক্ষক প্যানেল', accountantDesc: 'ফি সংগ্রহ, আয়/ব্যয় ট্র্যাকিং এবং আর্থিক প্রতিবেদন সহজেই তৈরি করুন।',
  },
  contact: { title: 'যোগাযোগ', address: '১২৩ ইসলামিক স্ট্রিট, ঢাকা, বাংলাদেশ', phone: '+৮৮০-XXX-XXXXXX', email: 'info@madrasa.edu', hours: 'শনি-বৃহস্পতি, সকাল ৮:০০ - দুপুর ২:০০' },
  auth: {
    login: 'সাইন ইন', email: 'ইমেইল', password: 'পাসওয়ার্ড', enterEmail: 'আপনার ইমেইল লিখুন',
    enterPassword: 'আপনার পাসওয়ার্ড লিখুন', signingIn: 'সাইন ইন হচ্ছে...',
    invalidCredentials: 'ভুল ইমেইল বা পাসওয়ার্ড',
  },
}
