export function createIntegrityController(service) {
  return {
    stamp(req, res) {
      res.json(service.stamp(req.body?.hash));
    },
    async verify(req, res) {
      res.json(await service.verify(req.body?.audit));
    },
  };
}
