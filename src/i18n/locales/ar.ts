/**
 * Phase 06 — Arabic translation dictionary.
 *
 * Mirrors the canonical English shell dictionary exactly.
 */
export const ar = {
  nav_home: 'الرئيسية',
  nav_about: 'عني',
  nav_services: 'الخدمات',
  nav_projects: 'المشاريع',
  nav_reviews: 'التقييمات',
  nav_contact: 'الاتصال',
  nav_projects_sub: 'المشاريع',

  header_brand: 'ملف عبد الجليل الشخصي',
  menu_open: 'فتح القائمة',
  menu_close: 'إغلاق القائمة',
  menu_sign_in: 'تسجيل الدخول',

  locale_switch_label: 'تبديل اللغة',
  locale_english: 'الإنجليزية',
  locale_arabic: 'العربية',

  footer_copyright: 'جميع الحقوق محفوظة.',
  footer_nav: 'التنقل',
  footer_social: 'وسائل التواصل',
  footer_no_projects: 'لا توجد مشاريع متاحة.',
  loading_label: 'جارٍ التحميل…',

  not_found_title: 'الصفحة غير موجودة',
  not_found_message: 'الصفحة التي تبحث عنها غير موجودة.',
  not_found_return_home: 'العودة إلى الرئيسية',

  error_title: 'حدث خطأ ما',
  error_message: 'حدث خطأ غير متوقع. يمكنك المحاولة مرة أخرى أو إعادة تحميل الصفحة.',
  error_return_home: 'العودة إلى الرئيسية',

  sign_in_title: 'إدارة الملف الشخصي',
  sign_in_prompt: 'سجّل الدخول باستخدام حساب Google المؤسسي.',
  sign_in_error_generic: 'تعذّر تسجيل الدخول. يرجى المحاولة مرة أخرى.',
  sign_in_error_popup_closed: 'تم إلغاء تسجيل الدخول. يرجى المحاولة مرة أخرى.',
  sign_in_error_popup_blocked: 'تم حظر نافذة تسجيل الدخول. يرجى السماح بالنوافذ المنبثقة والمحاولة مرة أخرى.',
  sign_in_error_account_exists: 'هذا الحساب على Google مرتبط بطريقة تسجيل دخول أخرى.',
  sign_in_error_network: 'خطأ في الشبكة. تحقّق من اتصالك وحاول مرة أخرى.',
  sign_in_error_too_many: 'عدد المحاولات كبير جدًا. يرجى الانتظار والمحاولة مرة أخرى.',
  sign_in_button: 'تسجيل الدخول باستخدام Google',
  sign_in_loading: 'جارٍ تسجيل الدخول…',

  route_dashboard: 'لوحة التحكم',
  route_projects: 'المشاريع',
  route_project: 'المشروع',
  route_services: 'الخدمات',
  route_skills: 'المهارات',
  route_reviews: 'التقييمات',
  route_profile: 'الملف الشخصي',
  route_contact: 'الاتصال ووسائل التواصل',
  route_analytics: 'التحليلات',
  route_settings: 'الإعدادات',
  route_about: 'عني',
  route_design_system: 'نظام التصميم',

  nav_main: 'التنقل الرئيسي',
  nav_mobile: 'التنقل على الهاتف',
  sign_out: 'تسجيل الخروج',
  admin_sign_out: 'تسجيل الخروج',

  admin_access_denied_title: 'الوصول مرفوض',
  admin_access_denied_message: 'أنت مسجّل الدخول لكنك لا تملك صلاحية الإدارة.',
  admin_refresh_access: 'تحديث صلاحية الوصول',

  root_title: 'ملف عبد الجليل الشخصي',
  root_subtitle: 'ملف أعمال لهندسة الواجهات الأمامية. الموقع العام ونظام إدارة المحتوى يُنفّذان في المراحل اللاحقة.',
  placeholder_not_implemented: 'هذا المسار نموذج من Phase 03 ولم يُنفّذ بعد.',
} as const satisfies typeof import('./en.ts').en
