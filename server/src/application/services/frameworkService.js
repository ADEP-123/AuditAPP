import { frameworkRepository } from '../../infrastructure/repositories/frameworkRepository.js';
import { AppError } from '../errors.js';

export const frameworkService = {
  list() {
    return frameworkRepository.findAll().map(({ items, guidance, groups, ...meta }) => ({
      ...meta,
      itemCount: items.length,
      groupCount: groups.length,
    }));
  },

  get(id) {
    const fw = frameworkRepository.findById(id);
    if (!fw) throw new AppError(404, `Framework not found: ${id}`);
    return fw;
  },
};
