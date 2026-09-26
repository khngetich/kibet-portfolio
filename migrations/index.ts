import * as migration_20260923_203019 from './20260923_203019';
import * as migration_20260923_213642_section_cms from './20260923_213642_section_cms';
import * as migration_20260923_221901_studio_styles from './20260923_221901_studio_styles';
import * as migration_20260925_201114_testimonial_rating from './20260925_201114_testimonial_rating';
import * as migration_20260925_205445_homepage_story from './20260925_205445_homepage_story';
import * as migration_20260925_211826_project_files_services_deck from './20260925_211826_project_files_services_deck';
import * as migration_20260925_212959_process_circuit from './20260925_212959_process_circuit';

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
    name: '20260925_212959_process_circuit'
  },
];
