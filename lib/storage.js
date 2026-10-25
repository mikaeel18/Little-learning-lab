// Private file storage inside Supabase (bucket "product-files"). Files here have NO public web address.
// Only logged-in admins can add or remove files. Customer downloads will go through the server later.
const BUCKET = 'product-files';

export const putFile = (sb, key, body, type) =>
  sb.storage.from(BUCKET).upload(key, body, { contentType: type, upsert: false });

export const deleteFile = (sb, key) => sb.storage.from(BUCKET).remove([key]);
