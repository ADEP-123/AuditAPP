import { frameworkService } from '../../application/services/frameworkService.js';

export function list(req, res) {
  res.json(frameworkService.list());
}

export function get(req, res) {
  res.json(frameworkService.get(req.params.id));
}
