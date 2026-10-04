import * as migration_20260923_203019 from './20260923_203019';
import * as migration_20260923_213642_section_cms from './20260923_213642_section_cms';
import * as migration_20260923_221901_studio_styles from './20260923_221901_studio_styles';
import * as migration_20260925_201114_testimonial_rating from './20260925_201114_testimonial_rating';
import * as migration_20260925_205445_homepage_story from './20260925_205445_homepage_story';
import * as migration_20260925_211826_project_files_services_deck from './20260925_211826_project_files_services_deck';
import * as migration_20260925_212959_process_circuit from './20260925_212959_process_circuit';
import * as migration_20260926_082828_about_editorial_footer from './20260926_082828_about_editorial_footer';
import * as migration_20260928_172816_project_samples from './20260928_172816_project_samples';
import * as migration_20261001_171615_user_roles_site_versions from './20261001_171615_user_roles_site_versions';
import * as migration_20261001_205913_slider_labels_booking_timeline from './20261001_205913_slider_labels_booking_timeline';
import * as migration_20261001_224434_media_prefix from './20261001_224434_media_prefix';
import * as migration_20261002_174456_tools_showreel_insights from './20261002_174456_tools_showreel_insights';
import * as migration_20261003_103258_editorial_redesign from './20261003_103258_editorial_redesign';
import * as migration_20261003_111048_services_policies_simple_footer from './20261003_111048_services_policies_simple_footer';
import * as migration_20261003_111200_seed_services_policies from './20261003_111200_seed_services_policies';
import * as migration_20261003_151213_orange_accent from './20261003_151213_orange_accent';
import * as migration_20261003_152920_service_flag_defaults from './20261003_152920_service_flag_defaults';
import * as migration_20261003_153100_resume_section from './20261003_153100_resume_section';
import * as migration_20261003_153200_seed_resume_page from './20261003_153200_seed_resume_page';
import * as migration_20261003_200937_review_fixes from './20261003_200937_review_fixes';
import * as migration_20261004_113105_footer_credit from './20261004_113105_footer_credit';
import * as migration_20261004_134452_profile_principles from './20261004_134452_profile_principles';
import * as migration_20261004_163000_enable_rls from './20261004_163000_enable_rls';

export const migrations = [
  {
    up: migration_20260923_203019.up,
    down: migration_20260923_203019.down,
    name: '20260923_203019',
  },
  {
    up: migration_20260923_213642_section_cms.up,
    down: migration_20260923_213642_section_cms.down,
    name: '20260923_213642_section_cms',
  },
  {
    up: migration_20260923_221901_studio_styles.up,
    down: migration_20260923_221901_studio_styles.down,
    name: '20260923_221901_studio_styles',
  },
  {
    up: migration_20260925_201114_testimonial_rating.up,
    down: migration_20260925_201114_testimonial_rating.down,
    name: '20260925_201114_testimonial_rating',
  },
  {
    up: migration_20260925_205445_homepage_story.up,
    down: migration_20260925_205445_homepage_story.down,
    name: '20260925_205445_homepage_story',
  },
  {
    up: migration_20260925_211826_project_files_services_deck.up,
    down: migration_20260925_211826_project_files_services_deck.down,
    name: '20260925_211826_project_files_services_deck',
  },
  {
    up: migration_20260925_212959_process_circuit.up,
    down: migration_20260925_212959_process_circuit.down,
    name: '20260925_212959_process_circuit',
  },
  {
    up: migration_20260926_082828_about_editorial_footer.up,
    down: migration_20260926_082828_about_editorial_footer.down,
    name: '20260926_082828_about_editorial_footer',
  },
  {
    up: migration_20260928_172816_project_samples.up,
    down: migration_20260928_172816_project_samples.down,
    name: '20260928_172816_project_samples',
  },
  {
    up: migration_20261001_171615_user_roles_site_versions.up,
    down: migration_20261001_171615_user_roles_site_versions.down,
    name: '20261001_171615_user_roles_site_versions',
  },
  {
    up: migration_20261001_205913_slider_labels_booking_timeline.up,
    down: migration_20261001_205913_slider_labels_booking_timeline.down,
    name: '20261001_205913_slider_labels_booking_timeline',
  },
  {
    up: migration_20261001_224434_media_prefix.up,
    down: migration_20261001_224434_media_prefix.down,
    name: '20261001_224434_media_prefix',
  },
  {
    up: migration_20261002_174456_tools_showreel_insights.up,
    down: migration_20261002_174456_tools_showreel_insights.down,
    name: '20261002_174456_tools_showreel_insights',
  },
  {
    up: migration_20261003_103258_editorial_redesign.up,
    down: migration_20261003_103258_editorial_redesign.down,
    name: '20261003_103258_editorial_redesign',
  },
  {
    up: migration_20261003_111048_services_policies_simple_footer.up,
    down: migration_20261003_111048_services_policies_simple_footer.down,
    name: '20261003_111048_services_policies_simple_footer',
  },
  {
    up: migration_20261003_111200_seed_services_policies.up,
    down: migration_20261003_111200_seed_services_policies.down,
    name: '20261003_111200_seed_services_policies',
  },
  {
    up: migration_20261003_151213_orange_accent.up,
    down: migration_20261003_151213_orange_accent.down,
    name: '20261003_151213_orange_accent',
  },
  {
    up: migration_20261003_152920_service_flag_defaults.up,
    down: migration_20261003_152920_service_flag_defaults.down,
    name: '20261003_152920_service_flag_defaults',
  },
  {
    up: migration_20261003_153100_resume_section.up,
    down: migration_20261003_153100_resume_section.down,
    name: '20261003_153100_resume_section',
  },
  {
    up: migration_20261003_153200_seed_resume_page.up,
    down: migration_20261003_153200_seed_resume_page.down,
    name: '20261003_153200_seed_resume_page',
  },
  {
    up: migration_20261003_200937_review_fixes.up,
    down: migration_20261003_200937_review_fixes.down,
    name: '20261003_200937_review_fixes',
  },
  {
    up: migration_20261004_113105_footer_credit.up,
    down: migration_20261004_113105_footer_credit.down,
    name: '20261004_113105_footer_credit',
  },
  {
    up: migration_20261004_134452_profile_principles.up,
    down: migration_20261004_134452_profile_principles.down,
    name: '20261004_134452_profile_principles',
  },
  {
    up: migration_20261004_163000_enable_rls.up,
    down: migration_20261004_163000_enable_rls.down,
    name: '20261004_163000_enable_rls',
  },
];
