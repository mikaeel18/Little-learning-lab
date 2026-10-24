// Allows admin uploads up to 25 MB per file. Bigger files need a different upload method (later).
module.exports = { experimental: { serverActions: { bodySizeLimit: '25mb' } } };
