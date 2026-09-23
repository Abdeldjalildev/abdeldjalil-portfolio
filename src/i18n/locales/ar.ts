/**
 * Phase 06 — Arabic translation dictionary.
 *
 * Mirrors the English shell vocabulary. Arabic is written in Arabic script;
 * the base.css typography rules supply the Arabic font stack and leading.
 */

export const ar = {
  nav_home: 'الرئيسية',
  nav_about: 'عني',
  nav_services: 'الخدمات',
  nav_projects: 'المشاريع',
  nav_reviews: 'التقييمات',
  nav_contact: 'الاتصال',

  header_brand: 'ملف أبراهيم البياني',
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
  error_message:
    'حدث خطأ غير متوقع. يمكنك المحاولة مرة أخرى أو إعادة تحميل الصفحة.',
  error_return_home: 'العودة إلى الرئيسية',

  sign_in_title: 'بياني الإداري',
  sign_in_prompt: 'سجّل الدخول باستخدام حساب Google المؤسسي.',
  sign_in_error_generic: 'تعذّر تسجيل الدخول. يرجى المحاولة مرة أخرى.',
  sign_in_error_popup_closed: 'تم إلغاء تسجيل الدخول. يرجى المحاولة مرة أخرى.',
  sign_in_error_popup_blocked: 'تم حظر نافذة التسجيل. يرجى السماح بالنوافذ الممنوعة وحاول مرة أخرى.',
  sign_in_error_account_exists: 'هذا الحساب Google مرتبط بطريقة تسجيل دخول أخرى.',
  sign_in_error_network: 'خطأ شبكة. تحقّق من اتصالك وحاول مرة أخرى.',
  sign_in_error_too_many: 'كثرة المحاولات. يرجى الانتظار وحاول مرة أخرى.',
  sign_in_button: 'تسجيل الدخول بـ Google',
  sign_in_loading: 'جارٍ تسجيل الدخول…',

  admin_access_denied_title: 'الوصول مرفوض',
  admin_access_denied_message: 'أنت مسجّل الدخول لكنك لا تملك صلاحية الإدارة.',
  admin_refresh_access: 'تحديث الوصول',
  nav_main: 'الرئيسية',
  nav_mobile: 'الجوال',

  admin_sign_out: 'تسجيل الخروج',

  root_title: 'ملف أبراهيم البياني',
  root_subtitle:
    'محفوظ تقني للواجهة الأمامية. الموقع العلني ونظام إدارة المحتوى يُنفّذان في المراحل اللاحقة.',
  placeholder_not_implemented: 'نموذج Phase 03 — غير مُنفّذ بعد.',
} as const
