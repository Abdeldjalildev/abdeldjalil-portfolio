/**
 * Phase 06 — English translation dictionary.
 *
 * Canonical shell key set. Other locales must satisfy this contract exactly.
 */
export const en = {
  nav_home: 'Home',
  nav_about: 'About',
  nav_services: 'Services',
  nav_projects: 'Projects',
  nav_reviews: 'Reviews',
  nav_contact: 'Contact',
  nav_projects_sub: 'Projects',

  header_brand: 'Abdeldjalil Portfolio',
  menu_open: 'Open menu',
  menu_close: 'Close menu',
  menu_sign_in: 'Sign in',

  locale_switch_label: 'Switch language',
  locale_english: 'English',
  locale_arabic: 'Arabic',

  footer_copyright: 'All rights reserved.',
  footer_nav: 'Navigation',
  footer_social: 'Social',
  footer_no_projects: 'No projects available.',
  loading_label: 'Loading…',

  not_found_title: 'Page not found',
  not_found_message: "The page you're looking for doesn't exist.",
  not_found_return_home: 'Return home',

  error_title: 'Something went wrong',
  error_message: 'An unexpected error occurred. You can try navigating away and back, or reloading the page.',
  error_return_home: 'Return home',

  sign_in_title: 'Portfolio Admin',
  sign_in_prompt: 'Sign in with your organization Google account.',
  sign_in_error_generic: 'Unable to sign in. Please try again.',
  sign_in_error_popup_closed: 'Sign-in was cancelled. Please try again.',
  sign_in_error_popup_blocked: 'The sign-in popup was blocked. Please allow popups and try again.',
  sign_in_error_account_exists: 'This Google account is linked to another sign-in method.',
  sign_in_error_network: 'Network error. Check your connection and try again.',
  sign_in_error_too_many: 'Too many attempts. Please wait and try again.',
  sign_in_button: 'Sign in with Google',
  sign_in_loading: 'Signing in…',

  route_dashboard: 'Dashboard',
  route_projects: 'Projects',
  route_project: 'Project',
  route_services: 'Services',
  route_skills: 'Skills',
  route_reviews: 'Reviews',
  route_profile: 'Profile',
  route_contact: 'Contact',
  route_analytics: 'Analytics',
  route_settings: 'Settings',
  route_about: 'About',
  route_design_system: 'Design System',

  nav_main: 'Main navigation',
  nav_mobile: 'Mobile navigation',
  sign_out: 'Sign out',
  admin_sign_out: 'Sign out',

  admin_access_denied_title: 'Access denied',
  admin_access_denied_message: 'You are signed in but do not have admin access.',
  admin_refresh_access: 'Refresh access',

  root_title: 'Abdeldjalil Portfolio',
  root_subtitle: 'Frontend engineering portfolio. The public site and admin CMS are implemented in later phases.',
  placeholder_not_implemented: 'This route is a Phase 03 placeholder and is not implemented yet.',
} as const
