export function createReportsController(service) {
  return {
    async generate(req, res) {
      const { buffer, contentType, filename } = await service.generate({ format: req.params.format, ...req.body });
      res.set({ 'Content-Type': contentType, 'Content-Disposition': `attachment; filename="${filename}"` }).send(buffer);
    },
  };
}
