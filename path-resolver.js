// This file is used to register path aliases for the compiled code
import { register } from 'tsconfig-paths';

register({
  baseUrl: '.',
  paths: {
    '#src/*': ['./dist/*']
  }
});
